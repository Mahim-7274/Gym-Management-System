const express = require('express');
const WorkoutPlan = require('../models/WorkoutPlan');

const router = express.Router();

// Get latest workout plan for every member.
router.get('/latest', async (req, res) => {
    try {
        const latestPlans = await WorkoutPlan.aggregate([
            { $sort: { updatedAt: -1 } },
            {
                $group: {
                    _id: '$memberId',
                    planId: { $first: '$_id' },
                    title: { $first: '$title' },
                    dailyExercises: { $first: '$dailyExercises' },
                    notes: { $first: '$notes' },
                    assignedTrainer: { $first: '$assignedTrainer' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' }
                }
            }
        ]);

        res.json(latestPlans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all workout plans.
router.get('/', async (req, res) => {
    try {
        const plans = await WorkoutPlan.find()
            .populate('memberId', 'name phone profilePicture')
            .sort({ updatedAt: -1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get workout plans for one member.
router.get('/member/:memberId', async (req, res) => {
    try {
        const plans = await WorkoutPlan.find({ memberId: req.params.memberId })
            .populate('memberId', 'name phone profilePicture')
            .sort({ updatedAt: -1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a workout plan.
router.post('/', async (req, res) => {
    try {
        const plan = new WorkoutPlan(req.body);
        await plan.save();
        const populatedPlan = await plan.populate('memberId', 'name phone profilePicture');
        res.status(201).json(populatedPlan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a workout plan.
router.put('/:id', async (req, res) => {
    try {
        const plan = await WorkoutPlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('memberId', 'name phone profilePicture');

        if (!plan) {
            return res.status(404).json({ error: 'Workout plan not found' });
        }

        res.json(plan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a workout plan.
router.delete('/:id', async (req, res) => {
    try {
        const plan = await WorkoutPlan.findByIdAndDelete(req.params.id);
        if (!plan) {
            return res.status(404).json({ error: 'Workout plan not found' });
        }
        res.json({ message: 'Workout plan deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
