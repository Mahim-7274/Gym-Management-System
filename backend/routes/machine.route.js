const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Machine = require('../models/Machine');

// ── In-memory fallback store (used when MongoDB is unavailable) ──
let memoryMachineIdCounter = 1;
let memoryMachines = [];

// Check whether the MongoDB connection is ready.
const isDbConnected = () => mongoose.connection.readyState === 1;

// 1. GET only broken machines (for Dashboard alerts)
router.get('/broken', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json(memoryMachines.filter(m => m.status === 'Broken'));
        }
        const brokenMachines = await Machine.find({ status: 'Broken' });
        res.json(brokenMachines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET all machines
router.get('/', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json([...memoryMachines].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)));
        }
        const machines = await Machine.find().sort({ updatedAt: -1 });
        res.json(machines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. POST - Add a new machine
router.post('/', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const newMachine = {
                _id: `machine-${memoryMachineIdCounter++}`,
                name: req.body.name,
                status: req.body.status || 'Functional',
                note: req.body.note || '',
                lastFixed: req.body.status === 'Functional' ? new Date().toISOString() : null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            memoryMachines.push(newMachine);
            return res.status(201).json(newMachine);
        }
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

        if (!isDbConnected()) {
            const idx = memoryMachines.findIndex(m => m._id === req.params.id);
            if (idx === -1) return res.status(404).json({ error: "Machine not found" });

            memoryMachines[idx] = {
                ...memoryMachines[idx],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            // Format dates back to string if they were updated to Date object
            if (updateData.lastFixed) memoryMachines[idx].lastFixed = updateData.lastFixed.toISOString();
            
            return res.json(memoryMachines[idx]);
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