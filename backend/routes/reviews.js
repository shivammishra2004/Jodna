const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Review = require('../models/Review');
const Ticket = require('../models/Ticket');
const multer = require('multer');

// Multer setup for memory storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

// @desc    Get Review log for a Ticket
// @route   GET /api/reviews/ticket/:ticketId
router.get('/ticket/:ticketId', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.ticketId);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Verify Org Match
        if (!ticket.organization.equals(req.user.organization)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        let review = await Review.findOne({ ticket: req.params.ticketId })
            .populate('comments.author', 'displayName email')
            .select('-comments.attachments.data'); // Exclude binary data for performance

        // If no review exists, return empty structure
        if (!review) {
            return res.json({
                ticket: req.params.ticketId,
                comments: [],
                created_at: null,
                updated_at: null
            });
        }

        res.json(review);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Helper middleware to conditionally use multer
const optionalUpload = (req, res, next) => {
    // Check if request is multipart/form-data
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        return upload.array('attachments', 10)(req, res, next);
    } else {
        // Skip multer for JSON requests
        req.files = [];
        next();
    }
};

// @desc    Add Comment to Review log (with optional attachments)
// @route   POST /api/reviews/ticket/:ticketId/comments
router.post('/ticket/:ticketId/comments', protect, optionalUpload, async (req, res) => {
    try {
        console.log('Comment request body:', req.body);
        console.log('Comment request files:', req.files);
        
        // Extract text from body (works for both JSON and FormData)
        const text = req.body.text;
        const isStatusChange = req.body.isStatusChange;
        const statusFrom = req.body.statusFrom;
        const statusTo = req.body.statusTo;

        if (!text || (typeof text === 'string' && !text.trim())) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const commentText = typeof text === 'string' ? text.trim() : String(text).trim();

        const ticket = await Ticket.findById(req.params.ticketId);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Verify Org Match
        if (!ticket.organization.equals(req.user.organization)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Only admin/manager or assigned designer can comment
        if (req.user.role === 'DESIGNER' && (!ticket.assignee || !ticket.assignee.equals(req.user._id))) {
            return res.status(403).json({ error: 'Not authorized to comment on this ticket' });
        }

        // Find or create review
        let review = await Review.findOne({ ticket: req.params.ticketId });
        if (!review) {
            review = await Review.create({
                ticket: req.params.ticketId,
                comments: []
            });
        }

        // Process attachments if any
        const attachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                attachments.push({
                    filename: file.originalname,
                    contentType: file.mimetype,
                    data: file.buffer,
                    size: file.size,
                    uploadDate: new Date()
                });
            }
        }

        // Create comment with attachments
        const comment = {
            text: commentText,
            author: req.user._id,
            created_at: new Date(),
            attachments: attachments,
            isStatusChange: isStatusChange || false,
            statusChange: (isStatusChange && statusFrom && statusTo) ? { from: statusFrom, to: statusTo } : undefined
        };

        review.comments.push(comment);
        await review.save();

        const updatedReview = await Review.findById(review._id)
            .populate('comments.author', 'displayName email')
            .select('-comments.attachments.data');

        res.status(201).json(updatedReview);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Add Attachment to Review Comment
// @route   POST /api/reviews/ticket/:ticketId/comments/:commentId/attachments
router.post('/ticket/:ticketId/comments/:commentId/attachments', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const ticket = await Ticket.findById(req.params.ticketId);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Verify Org Match
        if (!ticket.organization.equals(req.user.organization)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Only admin/manager or assigned designer can add attachments
        if (req.user.role === 'DESIGNER' && (!ticket.assignee || !ticket.assignee.equals(req.user._id))) {
            return res.status(403).json({ error: 'Not authorized to add attachments' });
        }

        const review = await Review.findOne({ ticket: req.params.ticketId });
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const comment = review.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comment.attachments.push({
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            data: req.file.buffer,
            size: req.file.size,
            uploadDate: new Date()
        });

        await review.save();

        const updatedReview = await Review.findById(review._id)
            .populate('comments.author', 'displayName email')
            .select('-comments.attachments.data');

        res.status(201).json(updatedReview);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Get Review Comment Attachment File
// @route   GET /api/reviews/ticket/:ticketId/comments/:commentId/attachments/:attachmentId
router.get('/ticket/:ticketId/comments/:commentId/attachments/:attachmentId', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.ticketId);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Verify Org Match
        if (!ticket.organization.equals(req.user.organization)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const review = await Review.findOne({ ticket: req.params.ticketId });
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const comment = review.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const attachment = comment.attachments.id(req.params.attachmentId);
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }

        res.set('Content-Type', attachment.contentType);
        res.send(attachment.data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
