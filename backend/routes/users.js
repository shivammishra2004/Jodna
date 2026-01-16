const express = require('express');
const router = express.Router();
const { ensureAuth, ensureRole } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Get all users in my organization
// @route   GET /api/users
router.get('/', ensureAuth, async (req, res) => {
    try {
        const users = await User.find({ organization: req.user.organization }).sort({ displayName: 1 });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Update User Role (Admin Only)
// @route   PUT /api/users/:id/role
router.put('/:id/role', ensureAuth, ensureRole(['ADMIN']), async (req, res) => {
    try {
        const { role } = req.body;

        // Safety check: ensure the user being modified is in the same org
        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate || !userToUpdate.organization.equals(req.user.organization)) {
            return res.status(404).json({ error: 'User not found in your organization' });
        }

        if (!['ADMIN', 'MANAGER', 'DESIGNER'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        userToUpdate.role = role;
        await userToUpdate.save();

        res.json(userToUpdate);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
