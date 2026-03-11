const express = require('express');
const Receipt = require('../models/Receipt');

const router = express.Router();

// Get recent receipts
router.get('/', async (req, res) => {
    try {
        const receipts = await Receipt.find()
            .populate('memberId', 'name phone')
            .populate('planId', 'name')
            .sort({ date: -1 })
            .limit(50);
        res.json(receipts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
