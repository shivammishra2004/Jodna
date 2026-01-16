const express = require('express');
const passport = require('passport');
const router = express.Router();

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Redirect back to the frontend root since routing is client-side
        const frontendUrl = process.env.FRONTEND_URL || 'https://localhost:5241';
        res.redirect(frontendUrl);
    }
);

// @desc    Logout user
// @route   GET /auth/logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// @desc    Get Current User
// @route   GET /auth/current_user
router.get('/current_user', (req, res) => {
    res.send(req.user);
});

module.exports = router;
