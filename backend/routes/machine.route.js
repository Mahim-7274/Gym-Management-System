const express = require('express');
const router = express.Router();
const Machine = require('../models/Machine');

// 1. GET only broken machines (for Dashboard alerts)
router.get('/broken', async (req, res) => {
    try {
        const brokenMachines = await Machine.find({ status: 'Broken' });
        res.json(brokenMachines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET all machines
router.get('/', async (req, res) => {
    try {
        const machines = await Machine.find().sort({ updatedAt: -1 });
        res.json(machines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. POST - Add a new machine
router.post('/', async (req, res) => {
    try {
        const newMachine = new Machine(req.body);
        const savedMachine = await newMachine.save();
        res.status(201).json(savedMachine);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. PUT - Update status (Broken/Fixed)
router.put('/:id', async (req, res) => {
    try {
        const { status, note } = req.body;
        const updateData = { status, note };
        
        // If fixed, update the lastFixed timestamp
        if (status === 'Functional') {
            updateData.lastFixed = new Date();
        }

        const machine = await Machine.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData }, 
            { new: true }
        );
        
        if (!machine) return res.status(404).json({ error: "Machine not found" });
        res.json(machine);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;