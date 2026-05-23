const express = require('express');
const mongoose = require('mongoose');
const WorkoutPlan = require('../models/WorkoutPlan');
const Member = require('../models/Member');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
const canManageWorkoutPlans = authorizeRoles('admin', 'trainer', 'staff');

router.use(protect);

// ── In-memory fallback store (used when MongoDB is unavailable) ──
let memoryWorkoutPlanIdCounter = 1;
let memoryWorkoutPlans = [];

// Check whether the MongoDB connection is ready.
const isDbConnected = () => mongoose.connection.readyState === 1;

const hasExercises = (dailyExercises) => (
    typeof dailyExercises === 'string' && dailyExercises.trim().length > 0
);

const memberExists = async (memberId) => {
    if (!memberId) return false;
    if (!mongoose.Types.ObjectId.isValid(memberId) && !memberId.toString().startsWith('mem')) return false; // allow memory IDs
    if (!isDbConnected()) return true; // Accept any ID in memory mode for now
    return Boolean(await Member.exists({ _id: memberId }));
};

// Get latest workout plan for every member.
router.get('/latest', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const latestPlansMap = {};
            // Assuming memoryWorkoutPlans is ordered roughly by insertion time
            memoryWorkoutPlans.forEach(plan => {
                latestPlansMap[plan.memberId._id || plan.memberId] = plan;
            });
            return res.json(Object.values(latestPlansMap));
        }
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
        if (!isDbConnected()) {
            return res.json([...memoryWorkoutPlans].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
        }
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
        if (!isDbConnected()) {
            const memberPlans = memoryWorkoutPlans.filter(p => (p.memberId._id || p.memberId) === req.params.memberId);
            return res.json(memberPlans.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
        }
        const plans = await WorkoutPlan.find({ memberId: req.params.memberId })
            .populate('memberId', 'name phone profilePicture')
            .sort({ updatedAt: -1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a workout plan.
router.post('/', canManageWorkoutPlans, async (req, res) => {
    try {
        if (!await memberExists(req.body.memberId)) {
            return res.status(400).json({ error: 'Please select a valid member' });
        }

        if (!hasExercises(req.body.dailyExercises)) {
            return res.status(400).json({ error: 'Please provide at least one daily exercise' });
        }

        if (!isDbConnected()) {
            const newPlan = {
                _id: `wp-${memoryWorkoutPlanIdCounter++}`,
                ...req.body,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            memoryWorkoutPlans.push(newPlan);
            return res.status(201).json(newPlan);
        }

        const plan = new WorkoutPlan(req.body);
        await plan.save();
        const populatedPlan = await plan.populate('memberId', 'name phone profilePicture');
        res.status(201).json(populatedPlan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a workout plan.
router.put('/:id', canManageWorkoutPlans, async (req, res) => {
    try {
        if (Object.prototype.hasOwnProperty.call(req.body, 'memberId') && !await memberExists(req.body.memberId)) {
            return res.status(400).json({ error: 'Please select a valid member' });
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'dailyExercises') && !hasExercises(req.body.dailyExercises)) {
            return res.status(400).json({ error: 'Please provide at least one daily exercise' });
        }

        if (!isDbConnected()) {
            const idx = memoryWorkoutPlans.findIndex(p => p._id === req.params.id);
            if (idx === -1) {
                return res.status(404).json({ error: 'Workout plan not found' });
            }
            memoryWorkoutPlans[idx] = {
                ...memoryWorkoutPlans[idx],
                ...req.body,
                updatedAt: new Date().toISOString()
            };
            return res.json(memoryWorkoutPlans[idx]);
        }

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
router.delete('/:id', canManageWorkoutPlans, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const idx = memoryWorkoutPlans.findIndex(p => p._id === req.params.id);
            if (idx === -1) {
                return res.status(404).json({ error: 'Workout plan not found' });
            }
            memoryWorkoutPlans.splice(idx, 1);
            return res.json({ message: 'Workout plan deleted' });
        }

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
