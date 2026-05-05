const express = require('express');
const Suggestion = require('../models/Suggestion');

const router = express.Router();

// List submitted suggestions.
router.get('/', async (req, res) => {
    try {
        const suggestions = await Suggestion.find().sort({ createdAt: -1 });
        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit a new suggestion.
router.post('/', async (req, res) => {
    try {
        const suggestion = new Suggestion(req.body);
        await suggestion.save();
        res.status(201).json(suggestion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update suggestion status.
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;
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
