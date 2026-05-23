const express = require('express');
const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// ── In-memory fallback store (used when MongoDB is unavailable) ──
let memoryPlanIdCounter = 4;
let memoryPlans = [
    { _id: 'plan-1', name: '1-Month', durationInDays: 30, price: 50, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: 'plan-2', name: '6-Month', durationInDays: 180, price: 250, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: 'plan-3', name: 'Yearly', durationInDays: 365, price: 450, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

// Check whether the MongoDB connection is ready.
const isDbConnected = () => mongoose.connection.readyState === 1;

// Get all plans
router.get('/', protect, async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json([...memoryPlans].sort((a, b) => a.durationInDays - b.durationInDays));
        }
        const plans = await Plan.find().sort({ durationInDays: 1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single plan by ID
router.get('/:id', protect, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const plan = memoryPlans.find(p => p._id === req.params.id);
            if (!plan) return res.status(404).json({ error: 'Plan not found' });
            return res.json(plan);
        }
        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a plan
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const idx = memoryPlans.findIndex(p => p._id === req.params.id);
            if (idx === -1) return res.status(404).json({ error: 'Plan not found' });
            memoryPlans[idx] = { ...memoryPlans[idx], ...req.body, updatedAt: new Date().toISOString() };
            return res.json(memoryPlans[idx]);
        }
        const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPlan) return res.status(404).json({ error: 'Plan not found' });
        res.json(updatedPlan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Create a new plan
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const newPlan = {
                _id: `plan-${memoryPlanIdCounter++}`,
                name: req.body.name,
                durationInDays: req.body.durationInDays,
                price: req.body.price,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            memoryPlans.push(newPlan);
            return res.status(201).json(newPlan);
        }
        const newPlan = new Plan(req.body);
        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a plan
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const idx = memoryPlans.findIndex(p => p._id === req.params.id);
            if (idx === -1) {
                return res.status(404).json({ error: 'Plan not found' });
            }
            memoryPlans.splice(idx, 1);
            return res.json({ message: 'Plan deleted' });
        }
        const deletedPlan = await Plan.findByIdAndDelete(req.params.id);
        if (!deletedPlan) {
            return res.status(404).json({ error: 'Plan not found' });
        }
        res.json({ message: 'Plan deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
