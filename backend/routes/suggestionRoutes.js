const express = require('express');
const mongoose = require('mongoose');
const Suggestion = require('../models/Suggestion');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();
const allowedStatuses = ['New', 'Reviewed', 'Resolved'];

// ── In-memory fallback store (used when MongoDB is unavailable) ──
let memoryIdCounter = 1;
let memorySuggestions = [];

// Check whether the MongoDB connection is ready.
const isDbConnected = () => mongoose.connection.readyState === 1;

// List submitted suggestions.
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        if (!isDbConnected()) {
            // Return in-memory suggestions sorted by newest first.
            const sorted = [...memorySuggestions].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            return res.json(sorted);
        }
        const suggestions = await Suggestion.find().sort({ createdAt: -1 });
        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit a new suggestion.
router.post('/', protect, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const newSuggestion = {
                _id: `mem-${memoryIdCounter++}`,
                name: req.body.name,
                roleType: req.body.roleType || 'Member',
                category: req.body.category || 'Feedback',
                message: req.body.message,
                status: 'New',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            memorySuggestions.push(newSuggestion);
            return res.status(201).json(newSuggestion);
        }
        const suggestion = new Suggestion({
            name: req.body.name,
            roleType: req.body.roleType,
            category: req.body.category,
            message: req.body.message
        });
        await suggestion.save();
        res.status(201).json(suggestion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update suggestion status.
router.patch('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid suggestion status' });
        }

        if (!isDbConnected()) {
            const idx = memorySuggestions.findIndex(s => s._id === req.params.id);
            if (idx === -1) {
                return res.status(404).json({ error: 'Suggestion not found' });
            }
            memorySuggestions[idx] = {
                ...memorySuggestions[idx],
                status,
                updatedAt: new Date().toISOString()
            };
            return res.json(memorySuggestions[idx]);
        }

        const suggestion = await Suggestion.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!suggestion) {
            return res.status(404).json({ error: 'Suggestion not found' });
        }

        res.json(suggestion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
