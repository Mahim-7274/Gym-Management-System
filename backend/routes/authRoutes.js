const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Initialize default users (Run once on startup to ensure we can log in)
const initDefaultUsers = async () => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const hashedAdminPassword = await bcrypt.hash('password123', 10);
            await User.create({ username: 'admin', password: hashedAdminPassword, role: 'admin' });
            console.log('Default Admin created');
        }

        const staffExists = await User.findOne({ username: 'staff' });
        if (!staffExists) {
            const hashedStaffPassword = await bcrypt.hash('password123', 10);
            await User.create({ username: 'staff', password: hashedStaffPassword, role: 'staff' });
            console.log('Default Staff created');
        }
    } catch (err) {
        console.error('Error initializing default users:', err);
    }
};

// Call initialization
initDefaultUsers();

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 3. Create JWT payload
        const payload = {
            id: user._id,
            username: user.username,
            role: user.role
        };

        // 4. Sign token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        // 5. Return success with token and basic user info
        res.json({
            message: 'Login successful',
            token,
            user: payload
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
