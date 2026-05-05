const express = require('express');
const Notice = require('../models/Notice');
const router = express.Router();

// GET all notices
router.get('/', async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new notice
router.post('/', async (req, res) => {
    try {
        const newNotice = new Notice(req.body);
        await newNotice.save();
        res.status(201).json(newNotice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE a notice
router.delete('/:id', async (req, res) => {
    try {
        const deletedNotice = await Notice.findByIdAndDelete(req.params.id);
        if (!deletedNotice) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        res.json({ message: 'Notice deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
