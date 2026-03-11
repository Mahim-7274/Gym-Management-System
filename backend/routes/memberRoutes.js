const express = require('express');
const Member = require('../models/Member');
const Plan = require('../models/Plan');
const Receipt = require('../models/Receipt');

const router = express.Router();

// Get all members
router.get('/', async (req, res) => {
    try {
        const members = await Member.find().populate('currentPlan').sort({ createdAt: -1 });
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new member
router.post('/', async (req, res) => {
    try {
        const newMember = new Member(req.body);
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
        await member.save();

        // Generate a receipt
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

// Update member details
router.put('/:id', async (req, res) => {
    try {
        const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(member);
    } catch (err) {
        res.status(400).json({ error: err.message });
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
