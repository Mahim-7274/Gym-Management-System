const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const DEMO_PASSWORD = 'password123';
const DEMO_USERS = [
    { username: 'admin', password: DEMO_PASSWORD, role: 'admin' },
    { username: 'staff', password: DEMO_PASSWORD, role: 'staff' }
];

const normalizeUsername = (username) => String(username || '').trim().toLowerCase();

const isDemoFallbackEnabled = () => (
    process.env.NODE_ENV !== 'production' &&
    process.env.DISABLE_DEMO_LOGIN !== 'true'
);

const passwordMatches = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword || '');
    } catch (err) {
        return false;
    }
};

const sendLoginResponse = (res, user) => {
    const payload = {
        id: user._id ? user._id.toString() : user.id,
        username: user.username,
        role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    return res.json({
        message: 'Login successful',
        token,
        user: payload
    });
};

// Initialize/repair default demo users so the credentials shown on Login.jsx work.
const initDefaultUsers = async () => {
    try {
        for (const demoUser of DEMO_USERS) {
            const existingUser = await User.findOne({ username: demoUser.username });

            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(demoUser.password, 10);
                await User.create({
                    username: demoUser.username,
                    password: hashedPassword,
                    role: demoUser.role
                });
                console.log(`Default ${demoUser.role} created`);
                continue;
            }

            const updates = {};
            const hasExpectedPassword = await passwordMatches(demoUser.password, existingUser.password);

            if (!hasExpectedPassword) {
                updates.password = await bcrypt.hash(demoUser.password, 10);
            }

            if (existingUser.role !== demoUser.role) {
                updates.role = demoUser.role;
            }

            if (Object.keys(updates).length) {
                await User.updateOne({ _id: existingUser._id }, { $set: updates });
                console.log(`Default ${demoUser.role} repaired`);
            }
        }
    } catch (err) {
        console.error('Error initializing default users:', err);
    }
};

// Login Route
router.post('/login', async (req, res) => {
    try {
        const username = normalizeUsername(req.body?.username);
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        let user = null;

        if (mongoose.connection.readyState === 1) {
            user = await User.findOne({ username });
        }

        if (user) {
            const isMatch = await passwordMatches(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            return sendLoginResponse(res, user);
        }

        if (isDemoFallbackEnabled()) {
            const demoUser = DEMO_USERS.find((item) => item.username === username);

            if (demoUser && password === demoUser.password) {
                return sendLoginResponse(res, {
                    id: `demo-${demoUser.username}`,
                    username: demoUser.username,
                    role: demoUser.role
                });
            }
        }

        return res.status(401).json({ error: 'Invalid credentials' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.initDefaultUsers = initDefaultUsers;

module.exports = router;
