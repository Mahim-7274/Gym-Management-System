const express = require('express');
const ClassTimetable = require('../models/ClassTimetable');

const router = express.Router();

const DEFAULT_CLASSES = [
    { day: 'Monday', time: '07:00 AM', className: 'Yoga', trainer: 'Sara', room: 'Studio A' },
    { day: 'Tuesday', time: '06:00 PM', className: 'Zumba', trainer: 'Nadia', room: 'Studio B' },
    { day: 'Wednesday', time: '08:00 AM', className: 'Cardio', trainer: 'Rahim', room: 'Main Floor' },
    { day: 'Thursday', time: '07:00 PM', className: 'Strength Training', trainer: 'Arif', room: 'Weights Room' },
    { day: 'Saturday', time: '09:00 AM', className: 'HIIT', trainer: 'Mina', room: 'Studio A' }
];

const seedDefaultClasses = async () => {
    const count = await ClassTimetable.countDocuments();
    if (count === 0) {
        await ClassTimetable.insertMany(DEFAULT_CLASSES);
    }
};

// Get timetable entries. Seeds a starter timetable when the collection is empty.
router.get('/', async (req, res) => {
    try {
        await seedDefaultClasses();
        const classes = await ClassTimetable.find().sort({ day: 1, time: 1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a class.
router.post('/', async (req, res) => {
    try {
        const classEntry = new ClassTimetable(req.body);
        await classEntry.save();
        res.status(201).json(classEntry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a class.
router.put('/:id', async (req, res) => {
    try {
        const classEntry = await ClassTimetable.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!classEntry) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.json(classEntry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a class.
router.delete('/:id', async (req, res) => {
    try {
        const classEntry = await ClassTimetable.findByIdAndDelete(req.params.id);
        if (!classEntry) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.json({ message: 'Class deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
