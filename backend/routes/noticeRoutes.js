const express = require('express');
const mongoose = require('mongoose');
const Notice = require('../models/Notice');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// ── In-memory fallback store (used when MongoDB is unavailable) ──
let memoryNoticeIdCounter = 1;
let memoryNotices = [];

// Check whether the MongoDB connection is ready.
const isDbConnected = () => mongoose.connection.readyState === 1;

// GET all notices
router.get('/', protect, async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json([...memoryNotices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new notice
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const newNotice = {
                _id: `notice-${memoryNoticeIdCounter++}`,
                title: req.body.title,
                content: req.body.content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            memoryNotices.push(newNotice);
            return res.status(201).json(newNotice);
        }
        const newNotice = new Notice(req.body);
        await newNotice.save();
        res.status(201).json(newNotice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE a notice
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const idx = memoryNotices.findIndex(n => n._id === req.params.id);
            if (idx === -1) {
                return res.status(404).json({ error: 'Notice not found' });
            }
            memoryNotices.splice(idx, 1);
            return res.json({ message: 'Notice deleted successfully' });
        }
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
