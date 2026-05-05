const express = require('express');
const Member = require('../models/Member');
const Plan = require('../models/Plan');
const Receipt = require('../models/Receipt');
const upload = require('../config/upload');

const router = express.Router();

// Get members whose birthday is today. Month/day only, year ignored.
router.get('/birthdays/today', async (req, res) => {
    try {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();

        const members = await Member.find({
            dateOfBirth: { $exists: true, $ne: null }
        }).populate('currentPlan');

        const birthdayMembers = members.filter((member) => {
            const birthDate = new Date(member.dateOfBirth);
            return birthDate.getMonth() === todayMonth && birthDate.getDate() === todayDate;
        });

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
        const unpaidMembers = await Member.find({ 
            paymentStatus: { $ne: 'Paid' } 
        }).populate('currentPlan');
        res.json(unpaidMembers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all members
router.get('/', async (req, res) => {
    try {
        const members = await Member.find().populate('currentPlan').sort({ createdAt: -1 });
        res.json(members);
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
        const member = await Member.findById(req.params.id);
        
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const updates = req.body;
        if (updates.dateOfBirth === '') {
            updates.dateOfBirth = null;
        }
        if (req.file) {
            updates.profilePicture = `/uploads/profiles/${req.file.filename}`;
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
        await Member.findByIdAndDelete(req.params.id);
        res.json({ message: 'Member deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
