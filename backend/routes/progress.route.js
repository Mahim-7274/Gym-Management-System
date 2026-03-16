const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');

// @route   POST api/progress/add
// @desc    Save a new monthly measurement log
router.post('/add', async (req, res) => {
    try {
        const { memberId, weight, chest, waist } = req.body;
        
        const newLog = new Progress({
            memberId,
            weight,
            chest,
            waist,
            date: new Date() // Automatically sets the current date
        });

        await newLog.save();
        res.status(201).json(newLog);
    } catch (err) {
        console.error("Error saving progress:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// @route   GET api/progress/:memberId
// @desc    Get all measurement logs for a specific member
router.get('/:memberId', async (req, res) => {
    try {
        const history = await Progress.find({ memberId: req.params.memberId })
            .sort({ date: -1 }); // Shows newest entries first
        res.json(history);
    } catch (err) {
        console.error("Error fetching history:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE api/progress/:id
// @desc    Delete a specific measurement log by its MongoDB _id
router.delete('/:id', async (req, res) => {
    try {
        const deletedLog = await Progress.findByIdAndDelete(req.params.id);
        
        if (!deletedLog) {
            return res.status(404).json({ message: "Log entry not found" });
        }

        console.log(`Successfully deleted log: ${req.params.id}`);
        res.json({ message: "Log deleted successfully" });
    } catch (err) {
        console.error("Error deleting log:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;