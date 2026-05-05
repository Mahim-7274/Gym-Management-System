const express = require('express');
const Receipt = require('../models/Receipt');

const router = express.Router();

// Get recent receipts
router.get('/', async (req, res) => {
    try {
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
