const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://express.adobe.com/static/oauth-redirect.html' // Must match frontend
);

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Google OAuth Callback (Exchange Code)
// @route   POST /auth/google
router.post('/google', async (req, res) => {
    try {
        const { code, codeVerifier } = req.body; // Frontend sends code & verifier (PKCE)

        // 1. Exchange code for tokens
        const { tokens } = await client.getToken({
            code,
            codeVerifier,
        });

        const idToken = tokens.id_token;
        if (!idToken) {
            return res.status(400).json({ msg: 'No ID token returned from Google' });
        }

        // 2. Verify ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const { email, name, sub: googleId } = payload;

        // 3. Find or Create User
        let user = await User.findOne({ email });

        if (user) {
            // Update googleId if missing? or just login
            // user.googleId = googleId; // if we want to store it
            // await user.save();
        } else {
            // Create new user
            // Password is required in our schema, lets generate a random one or modify schema
            // For now, generate a random secure-ish password
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                displayName: name,
                email,
                password: hashedPassword, // Dummy password for OAuth users
                // googleId: googleId // Optional: add back to schema if needed
            });
        }

        // 4. Return JWT
        res.json({
            _id: user.id,
            displayName: user.displayName,
            email: user.email,
            token: generateToken(user._id),
            organization: user.organization,
            role: user.role
        });

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(500).json({ msg: 'Server Error during Google Login', error: err.message });
    }
});

// @desc    Signup User
// @route   POST /auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { displayName, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            displayName,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            _id: user.id,
            displayName: user.displayName,
            email: user.email,
            token: generateToken(user._id),
            organization: user.organization
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Login User
// @route   POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                displayName: user.displayName,
                email: user.email,
                token: generateToken(user._id),
                organization: user.organization,
                role: user.role
            });
        } else {
            res.status(400).json({ msg: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @desc    Get Current User (Me)
// @route   GET /auth/me
router.get('/me', protect, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});

module.exports = router;
