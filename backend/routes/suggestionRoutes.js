const express = require('express');
const Suggestion = require('../models/Suggestion');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();
const allowedStatuses = ['New', 'Reviewed', 'Resolved'];

// List submitted suggestions.
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const suggestions = await Suggestion.find().sort({ createdAt: -1 });
        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit a new suggestion.
router.post('/', protect, async (req, res) => {
    try {
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
