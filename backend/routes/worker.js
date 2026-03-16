const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker'); // Double-check if the file name is 'Worker.js' or 'worker.model.js'

// 1. Get all workers
router.get('/', async (req, res) => {
    try {
        const workers = await Worker.find();
        res.status(200).json(workers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Add a new worker
router.post('/add', async (req, res) => {
    try {
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
        await Worker.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Worker deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;