const express = require('express');
const router = express.Router();
const { ensureAuth, ensureRole } = require('../middleware/auth');
const Review = require('../models/Review');
const Ticket = require('../models/Ticket');

// @desc    Add Review to Ticket
// @route   POST /api/reviews
router.post('/', ensureAuth, ensureRole(['ADMIN', 'MANAGER']), async (req, res) => {
    try {
        const { ticketId, feedback, status } = req.body; // status: 'Done' or 'Open' (if rejected)

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // Create Review
        const review = await Review.create({
            ticket: ticketId,
            reviewer: req.user.id,
            feedback
        });

        // Update Ticket Status based on review
        if (status) {
            ticket.status = status;
            await ticket.save();
        }

        res.status(201).json(review);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Get Reviews for a Ticket
// @route   GET /api/reviews/:ticketId
router.get('/:ticketId', ensureAuth, async (req, res) => {
    try {
        const reviews = await Review.find({ ticket: req.params.ticketId }).populate('reviewer', 'displayName');
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
