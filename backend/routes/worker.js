const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Worker = require('../models/Worker');

// ── In-memory fallback store (used when MongoDB is unavailable) ──
let memoryWorkerIdCounter = 1;
let memoryWorkers = [];

// Check whether the MongoDB connection is ready.
const isDbConnected = () => mongoose.connection.readyState === 1;

// 1. Get all workers
router.get('/', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.status(200).json(memoryWorkers);
        }
        const workers = await Worker.find();
        res.status(200).json(workers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Add a new worker
router.post('/add', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const newWorker = {
                _id: `worker-${memoryWorkerIdCounter++}`,
                name: req.body.name,
                role: req.body.role || 'Staff',
                shift: req.body.shift || 'Morning',
                workHours: req.body.workHours || 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            memoryWorkers.push(newWorker);
            return res.status(201).json(newWorker);
        }
        const newWorker = new Worker(req.body);
        const savedWorker = await newWorker.save();
        res.status(201).json(savedWorker);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. Update work hours (The missing link for Feature #6)
router.patch('/:id', async (req, res) => {
    try {
        const { workHours } = req.body;
        
        if (!isDbConnected()) {
            const idx = memoryWorkers.findIndex(w => w._id === req.params.id);
            if (idx === -1) {
                return res.status(404).json({ message: "Worker not found in database" });
            }
            memoryWorkers[idx].workHours = workHours;
            memoryWorkers[idx].updatedAt = new Date().toISOString();
            return res.status(200).json(memoryWorkers[idx]);
        }

        const updatedWorker = await Worker.findByIdAndUpdate(
            req.params.id, 
            { workHours: workHours }, 
            { new: true } // This returns the updated version to the frontend
        );

        if (!updatedWorker) {
            return res.status(404).json({ message: "Worker not found in database" });
        }

        res.status(200).json(updatedWorker);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. Delete a worker (Optional but very helpful)
router.delete('/:id', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const idx = memoryWorkers.findIndex(w => w._id === req.params.id);
            if (idx === -1) {
                return res.status(404).json({ message: "Worker not found in database" });
            }
            memoryWorkers.splice(idx, 1);
            return res.status(200).json({ message: "Worker deleted successfully" });
        }

        await Worker.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Worker deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;