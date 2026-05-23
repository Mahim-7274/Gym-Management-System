const express = require('express');
const mongoose = require('mongoose');
const Member = require('../models/Member');
const Plan = require('../models/Plan');
const Receipt = require('../models/Receipt');
const upload = require('../config/upload');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ── In-memory fallback store (used when MongoDB is unavailable) ──
let memoryMemberIdCounter = 1;
let memoryMembers = [];

const DEFAULT_PLANS_MOCK = {
    'plan-1': { _id: 'plan-1', name: '1-Month', durationInDays: 30, price: 50 },
    'plan-2': { _id: 'plan-2', name: '6-Month', durationInDays: 180, price: 250 },
    'plan-3': { _id: 'plan-3', name: 'Yearly', durationInDays: 365, price: 450 }
};

// Check whether the MongoDB connection is ready.
const isDbConnected = () => mongoose.connection.readyState === 1;

const getMonthDayKey = (date) => {
    if (!date) return null;
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return null;

    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getUTCDate()).padStart(2, '0');
    return `${month}-${day}`;
};

const getTodayMonthDayKey = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${month}-${day}`;
};

// Get members whose birthday is today. Month/day only, year ignored.
router.get('/birthdays/today', protect, async (req, res) => {
    try {
        const todayKey = getTodayMonthDayKey();

        if (!isDbConnected()) {
            const birthdayMembers = memoryMembers.filter((member) => getMonthDayKey(member.dateOfBirth) === todayKey);
            return res.json(birthdayMembers);
        }

        const members = await Member.find({
            dateOfBirth: { $exists: true, $ne: null }
        }).populate('currentPlan');

        const birthdayMembers = members.filter((member) => getMonthDayKey(member.dateOfBirth) === todayKey);

        res.json(birthdayMembers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * FEATURE 9: Get members with unpaid balances
 * Always placed above generic ID routes
 */
router.get('/unpaid', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const unpaidMembers = memoryMembers.filter(m => m.paymentStatus !== 'Paid');
            return res.json(unpaidMembers);
        }
        const unpaidMembers = await Member.find({ 
            paymentStatus: { $ne: 'Paid' } 
        }).populate('currentPlan');
        res.json(unpaidMembers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all members
router.get('/', protect, async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json([...memoryMembers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
        const members = await Member.find().populate('currentPlan').sort({ createdAt: -1 });
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single member by ID
router.get('/:id', protect, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const member = memoryMembers.find(m => m._id === req.params.id);
            if (!member) return res.status(404).json({ error: 'Member not found' });
            return res.json(member);
        }
        const member = await Member.findById(req.params.id).populate('currentPlan');
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * UPDATED PUT ROUTE: Uses .save() for "Aggressive Saving"
 * This ensures paymentStatus: 'Paid' actually sticks in the DB.
 */
router.put('/:id', upload.single('profilePicture'), async (req, res) => {
    try {
        const updates = req.body;
        if (updates.dateOfBirth === '') {
            updates.dateOfBirth = null;
        }
        if (req.file) {
            updates.profilePicture = `/uploads/profiles/${req.file.filename}`;
        }

        if (!isDbConnected()) {
            const idx = memoryMembers.findIndex(m => m._id === req.params.id);
            if (idx === -1) {
                return res.status(404).json({ error: 'Member not found' });
            }
            memoryMembers[idx] = {
                ...memoryMembers[idx],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            return res.json(memoryMembers[idx]);
        }

        const member = await Member.findById(req.params.id);
        
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Merge the incoming updates (like paymentStatus) into the member object
        Object.assign(member, updates);

        // .save() is more reliable than findByIdAndUpdate for new schema fields
        const updatedMember = await member.save();
        
        console.log(`Update successful for ${updatedMember.name}: Status is now ${updatedMember.paymentStatus}`);
        res.json(updatedMember);
    } catch (err) {
        console.error("Database Save Error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Create a new member
router.post('/', upload.single('profilePicture'), async (req, res) => {
    try {
        const memberData = req.body;
        if (memberData.dateOfBirth === '') {
            delete memberData.dateOfBirth;
        }
        if (req.file) {
            memberData.profilePicture = `/uploads/profiles/${req.file.filename}`;
        }

        if (!isDbConnected()) {
            const newMember = {
                _id: `member-${memoryMemberIdCounter++}`,
                ...memberData,
                status: memberData.status || 'Active',
                paymentStatus: memberData.paymentStatus || 'Unpaid',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            memoryMembers.push(newMember);
            return res.status(201).json(newMember);
        }

        const newMember = new Member(memberData);
        await newMember.save();
        res.status(201).json(newMember);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Renew a member's plan
router.post('/:id/renew', async (req, res) => {
    try {
        const { planId } = req.body;

        if (!isDbConnected()) {
            const plan = DEFAULT_PLANS_MOCK[planId] || { _id: planId, name: 'Custom Plan', durationInDays: 30, price: 50 };
            const idx = memoryMembers.findIndex(m => m._id === req.params.id);
            if (idx === -1) return res.status(404).json({ error: 'Member not found' });

            const newExpiryDate = new Date();
            newExpiryDate.setDate(newExpiryDate.getDate() + plan.durationInDays);

            memoryMembers[idx] = {
                ...memoryMembers[idx],
                currentPlan: plan, // populate mock object
                expiryDate: newExpiryDate.toISOString(),
                status: 'Active',
                paymentStatus: 'Unpaid',
                updatedAt: new Date().toISOString()
            };

            const mockReceipt = {
                _id: `receipt-${Date.now()}`,
                memberId: req.params.id,
                planId: plan._id,
                amountPaid: plan.price
            };

            return res.json({ member: memoryMembers[idx], receipt: mockReceipt });
        }

        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        let member = await Member.findById(req.params.id);
        if (!member) return res.status(404).json({ error: 'Member not found' });

        const newExpiryDate = new Date();
        newExpiryDate.setDate(newExpiryDate.getDate() + plan.durationInDays);

        member.currentPlan = planId;
        member.expiryDate = newExpiryDate;
        member.status = 'Active';
        member.paymentStatus = 'Unpaid'; // Reset on renewal
        
        await member.save();

        const receipt = new Receipt({
            memberId: member._id,
            planId: plan._id,
            amountPaid: plan.price
        });
        await receipt.save();

        res.json({ member, receipt });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a member
router.delete('/:id', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const idx = memoryMembers.findIndex(m => m._id === req.params.id);
            if (idx === -1) {
                return res.status(404).json({ error: 'Member not found' });
            }
            memoryMembers.splice(idx, 1);
            return res.json({ message: 'Member deleted' });
        }
        await Member.findByIdAndDelete(req.params.id);
        res.json({ message: 'Member deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
