const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Ticket = require('../models/Ticket');
const Project = require('../models/Project');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Multer setup for memory storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 4 * 1024 * 1024 } // 4MB limit per file
});

// Helper for roles (Simple inline or better in middleware)
const ensureRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Not authorized for this action' });
    }
    next();
};

// @desc    Get All Tickets (Scoped to Org, optionally filtered by Project)
// @route   GET /api/tickets
router.get('/', protect, async (req, res) => {
    try {
        const query = { organization: req.user.organization };

        // Filter by project if provided
        if (req.query.project) {
            query.project = req.query.project;
        }

        // Restrict Designers to their own tickets
        if (req.user.role === 'DESIGNER') {
            query.assignee = req.user.id;
        }

        const tickets = await Ticket.find(query)
            .populate('assignee', 'displayName email')
            .populate('created_by', 'displayName')
            .populate('project', 'name')
            .sort({ created_at: -1 });
        res.json(tickets);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Create Ticket (Manager/Admin only)
// @route   POST /api/tickets
router.post('/', protect, ensureRole(['ADMIN', 'MANAGER']), async (req, res) => {
    try {
        const ticket = await Ticket.create({
            ...req.body,
            created_by: req.user.id,
            organization: req.user.organization
        });
        res.status(201).json(ticket);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// NOTE: More specific routes must come before generic :id routes

// @desc    Upload Attachment
// @route   POST /api/tickets/:id/attachments
router.post('/:id/attachments', protect, ensureRole(['ADMIN', 'MANAGER']), upload.single('file'), async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // Check Permissions
        if (!ticket.organization.equals(req.user.organization)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        ticket.attachments.push({
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            data: req.file.buffer,
            size: req.file.size
        });

        await ticket.save();
        
        // Return ticket without heavy binary data for performance, or specific attachment info
        // We'll just return the updated list metadata
        const updatedTicket = await Ticket.findById(req.params.id).select('-attachments.data');
        res.json(updatedTicket);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Delete Attachment (Admin/Manager only)
// @route   DELETE /api/tickets/:id/attachments/:fileId
router.delete('/:id/attachments/:fileId', protect, ensureRole(['ADMIN', 'MANAGER']), async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // Verify Org Match
        if (!ticket.organization.equals(req.user.organization)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const attachment = ticket.attachments.id(req.params.fileId);
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }

        ticket.attachments.pull(req.params.fileId);
        await ticket.save();

        const updatedTicket = await Ticket.findById(req.params.id)
            .populate('assignee', 'displayName email')
            .populate('created_by', 'displayName')
            .populate('project', 'name')
            .select('-attachments.data');

        res.json(updatedTicket);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Get Attachment Content
// @route   GET /api/tickets/:id/files/:fileId
router.get('/:id/files/:fileId', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        
        // Simple auth check: if user is in same org
        if (!ticket.organization.equals(req.user.organization)) {
             return res.status(403).json({ error: 'Not authorized' });
        }

        const attachment = ticket.attachments.id(req.params.fileId);
        if (!attachment) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.set('Content-Type', attachment.contentType);
        res.send(attachment.data);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Add a Todo (Admin/Manager only)
// @route   POST /api/tickets/:id/todos
router.post('/:id/todos', protect, ensureRole(['ADMIN', 'MANAGER']), async (req, res) => {
    try {
        const { text } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        if (!ticket.organization.equals(req.user.organization)) return res.status(403).json({ error: 'Not authorized' });

        ticket.todos.push({ text, isCompleted: false });
        await ticket.save();

        res.json(ticket);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Review/Toggle Todo (Admin/Manager OR Assignee)
// @route   PATCH /api/tickets/:id/todos/:index/toggle
router.patch('/:id/todos/:index/toggle', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        if (!ticket.organization.equals(req.user.organization)) return res.status(403).json({ error: 'Not authorized' });

        const isManager = ['ADMIN', 'MANAGER'].includes(req.user.role);
        const isAssignee = ticket.assignee && ticket.assignee.equals(req.user._id);

        if (!isManager && !isAssignee) {
            return res.status(403).json({ error: 'Not authorized to toggle this todo' });
        }

        const index = parseInt(req.params.index);
        if (index < 0 || index >= ticket.todos.length) {
            return res.status(400).json({ error: 'Invalid todo index' });
        }

        ticket.todos[index].isCompleted = !ticket.todos[index].isCompleted;
        await ticket.save();

        res.json(ticket);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Delete Todo (Admin/Manager only)
// @route   DELETE /api/tickets/:id/todos/:index
router.delete('/:id/todos/:index', protect, ensureRole(['ADMIN', 'MANAGER']), async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        
        console.log(`[DEBUG] Delete Todo Request - Ticket: ${req.params.id}, Index: ${req.params.index}, User: ${req.user._id}`);
        
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        if (!ticket.organization.equals(req.user.organization)) return res.status(403).json({ error: 'Not authorized' });

        const index = parseInt(req.params.index);
        if (index < 0 || index >= ticket.todos.length) {
            return res.status(400).json({ error: 'Invalid todo index' });
        }

        // Prevent deletion of completed todos
        if (ticket.todos[index].isCompleted) {
            return res.status(400).json({ error: 'Cannot delete completed checklist items' });
        }

        ticket.todos.splice(index, 1);
        await ticket.save();

        res.json(ticket);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Update Express Project Link (Designer can update their assigned tickets)
// @route   PUT /api/tickets/:id/express-link
router.put('/:id/express-link', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Verify Org Match
        if (!ticket.organization.equals(req.user.organization)) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Only assigned designers can update the Express project link
        if (req.user.role !== 'DESIGNER') {
            return res.status(403).json({ error: 'Only assigned designers can update the Express project link' });
        }
        
        if (!ticket.assignee || !ticket.assignee.equals(req.user._id)) {
            return res.status(403).json({ error: 'You are not assigned to this ticket' });
        }

        const { expressProjectLink } = req.body;
        ticket.expressProjectLink = expressProjectLink || null;
        await ticket.save();

        const updatedTicket = await Ticket.findById(req.params.id)
            .populate('assignee', 'displayName email')
            .populate('created_by', 'displayName')
            .populate('project', 'name');

        res.json(updatedTicket);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Update Ticket Status (Designer can move to InProgress/Review, Manager can do all)
// @route   PUT /api/tickets/:id
router.put('/:id', protect, async (req, res) => {
    try {
        let ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Verify Org Match
        if (!ticket.organization.equals(req.user.organization)) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Logic Re: Roles
        // Designers can only update THEIR tickets
        if (req.user.role === 'DESIGNER' && ticket.assignee && !ticket.assignee.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to edit this ticket' });
        }

        ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        // Populate fields before returning
        const updatedTicket = await Ticket.findById(ticket._id)
            .populate('assignee', 'displayName email')
            .populate('created_by', 'displayName')
            .populate('project', 'name')
            .select('-attachments.data');

        res.json(updatedTicket);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Delete Ticket (Admin only)
// @route   DELETE /api/tickets/:id
router.delete('/:id', protect, ensureRole(['ADMIN']), async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Verify Org Match
        if (!ticket.organization.equals(req.user.organization)) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        await Ticket.findByIdAndDelete(req.params.id);
        res.json({ message: 'Ticket removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// @desc    Generate Todos using Gemini AI
// @route   POST /api/tickets/generate-todos
router.post('/generate-todos', protect, ensureRole(['ADMIN', 'MANAGER']), async (req, res) => {
    try {
        const { taskName, description, projectId } = req.body;
        
        console.log("AI Todo Request:", { taskName, userId: req.user.id });
        console.log("Gemini Key Present:", !!process.env.GEMINI_API_KEY);

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API Key not configured' });
        }

        // Fetch Project Context
        const project = await Project.findById(projectId);
        const projectContext = project 
            ? `Project: ${project.name}. Description: ${project.description || 'N/A'}.` 
            : '';

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using 'gemini-pro' as it is the most widely available stable model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
            Role: Experienced Project Manager.
            Context: ${projectContext}
            Task: ${taskName}
            Task Details: ${description}
            
            Goal: Create a concise checklist of 3-6 actionable sub-tasks (todos) for this ticket.
            Format: Return ONLY a raw JSON array of strings. No markdown formatting, no code blocks.
            Example: ["Design the UI", "Implement API", "Write Tests"]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        console.log("Raw AI Response:", text);

        // Clean up markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Attempt Parse
        try {
            const todos = JSON.parse(text);
            res.json(todos);
        } catch (parseErr) {
            console.error("JSON Parse Failure:", text);
            // Fallback: try to split by newlines if it looks like a list
            const fallbackTodos = text.split('\n').filter(line => line.trim().length > 0).map(l => l.replace(/^- /, '').replace(/^\d+\. /, ''));
            res.json(fallbackTodos);
        }

    } catch (err) {
        console.error("AI Generation Critical Error:", err);
        // Send actual error message to frontend for debugging
        res.status(500).json({ error: err.message || 'Failed to generate todos' });
    }
});

module.exports = router;
