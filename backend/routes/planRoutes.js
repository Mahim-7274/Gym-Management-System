const express = require('express');
const Plan = require('../models/Plan');

const router = express.Router();

// Get all plans
router.get('/', async (req, res) => {
    try {
        const plans = await Plan.find().sort({ durationInDays: 1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new plan
router.post('/', async (req, res) => {
    try {
        const newPlan = new Plan(req.body);
        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a plan
router.delete('/:id', async (req, res) => {
    try {
        await Plan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Plan deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
