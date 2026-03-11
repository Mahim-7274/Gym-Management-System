const express = require('express');
const CheckIn = require('../models/CheckIn');
const Member = require('../models/Member');

const router = express.Router();

// Get today's check-ins
router.get('/today', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const checkIns = await CheckIn.find({
            timestamp: { $gte: startOfDay, $lte: endOfDay }
        }).populate('memberId', 'name status expiryDate');

        res.json(checkIns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check-in a member
router.post('/', async (req, res) => {
    try {
        const { memberId } = req.body;

        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Prevent duplicate check-ins today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const existingCheckIn = await CheckIn.findOne({
            memberId,
            timestamp: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingCheckIn) {
            return res.status(400).json({ error: 'Member has already checked in today.' });
        }

        const checkIn = new CheckIn({ memberId });
        await checkIn.save();

        res.status(201).json(checkIn);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
