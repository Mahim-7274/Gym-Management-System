const express = require('express');
const mongoose = require('mongoose');
const Receipt = require('../models/Receipt');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ── In-memory fallback store (used when MongoDB is unavailable) ──
let memoryReceipts = [];

// Check whether the MongoDB connection is ready.
const isDbConnected = () => mongoose.connection.readyState === 1;

// Get recent receipts
router.get('/', protect, async (req, res) => {
    try {
        if (!isDbConnected()) {
            let receipts = [...memoryReceipts].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
            if (req.query.all !== 'true') {
                receipts = receipts.slice(0, 50);
            }
            return res.json(receipts);
        }

        const query = Receipt.find()
            .populate('memberId', 'name phone paymentStatus')
            .populate('planId', 'name')
            .sort({ date: -1 });

        if (req.query.all !== 'true') {
            query.limit(50);
        }

        const receipts = await query;
        res.json(receipts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
