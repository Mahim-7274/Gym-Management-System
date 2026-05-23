const express = require('express');
const mongoose = require('mongoose');
const CheckIn = require('../models/CheckIn');
const Member = require('../models/Member');

const router = express.Router();

// ── In-memory fallback store (used when MongoDB is unavailable) ──
let memoryCheckInIdCounter = 1;
let memoryCheckIns = [];

// Check whether the MongoDB connection is ready.
const isDbConnected = () => mongoose.connection.readyState === 1;

// Get today's check-ins
router.get('/today', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        if (!isDbConnected()) {
            const todayCheckIns = memoryCheckIns.filter(ci => {
                const ciDate = new Date(ci.timestamp);
                return ciDate >= startOfDay && ciDate <= endOfDay;
            });
            return res.json(todayCheckIns);
        }

        const checkIns = await CheckIn.find({
            timestamp: { $gte: startOfDay, $lte: endOfDay }
        }).populate('memberId', 'name status expiryDate currentPlan');

        res.json(checkIns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check-in a member
router.post('/', async (req, res) => {
    try {
        const { memberId } = req.body;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        if (!isDbConnected()) {
            const existingCheckIn = memoryCheckIns.find(ci => {
                const ciDate = new Date(ci.timestamp);
                const isToday = ciDate >= startOfDay && ciDate <= endOfDay;
                const matchId = (ci.memberId._id || ci.memberId) === memberId;
                return isToday && matchId;
            });

            if (existingCheckIn) {
                return res.status(400).json({ error: 'Member has already checked in today.' });
            }

            const newCheckIn = {
                _id: `checkin-${memoryCheckInIdCounter++}`,
                memberId: {
                    _id: memberId,
                    name: "Demo Member (Offline)",
                    status: "Active",
                    currentPlan: { name: "Mock Plan" }
                },
                timestamp: new Date().toISOString()
            };
            memoryCheckIns.push(newCheckIn);
            return res.status(201).json(newCheckIn);
        }

        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

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
