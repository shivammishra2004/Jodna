const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Ticket = require('../models/Ticket');

// Helper for roles (Simple inline or better in middleware)
const ensureRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Not authorized for this action' });
    }
    next();
};

// @desc    Get All Tickets (Scoped to Org)
// @route   GET /api/tickets
router.get('/', protect, async (req, res) => {
    try {
        const tickets = await Ticket.find({ organization: req.user.organization })
            .populate('assignee', 'displayName email')
            .populate('created_by', 'displayName')
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
        if (req.user.role === 'DESIGNER' && !ticket.assignee.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to edit this ticket' });
        }

        ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json(ticket);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
