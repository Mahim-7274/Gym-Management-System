const express = require('express');
const mongoose = require('mongoose');
const ClassTimetable = require('../models/ClassTimetable');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_CLASSES = [
    { day: 'Monday', time: '07:00 AM', className: 'Yoga', trainer: 'Sara', room: 'Studio A' },
    { day: 'Tuesday', time: '06:00 PM', className: 'Zumba', trainer: 'Nadia', room: 'Studio B' },
    { day: 'Wednesday', time: '08:00 AM', className: 'Cardio', trainer: 'Rahim', room: 'Main Floor' },
    { day: 'Thursday', time: '07:00 PM', className: 'Strength Training', trainer: 'Arif', room: 'Weights Room' },
    { day: 'Saturday', time: '09:00 AM', className: 'HIIT', trainer: 'Mina', room: 'Studio A' }
];

// ── In-memory fallback store (used when MongoDB is unavailable) ──
let memoryIdCounter = 1;
let memoryClasses = DEFAULT_CLASSES.map(c => ({
    _id: `mem-${memoryIdCounter++}`,
    ...c,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
}));

// Check whether the MongoDB connection is ready.
const isDbConnected = () => mongoose.connection.readyState === 1;

const seedDefaultClasses = async () => {
    const count = await ClassTimetable.countDocuments();
    if (count === 0) {
        await Promise.all(DEFAULT_CLASSES.map((classEntry) => (
            ClassTimetable.updateOne(classEntry, { $setOnInsert: classEntry }, { upsert: true })
        )));
    }
};

const getDayIndex = (day) => {
    const index = DAY_ORDER.indexOf(day);
    return index === -1 ? DAY_ORDER.length : index;
};

const timeToMinutes = (time) => {
    const value = String(time || '').trim().toUpperCase();
    const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);

    if (!match) {
        return Number.MAX_SAFE_INTEGER;
    }

    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const meridiem = match[3];

    if (meridiem === 'AM' && hour === 12) {
        hour = 0;
    } else if (meridiem === 'PM' && hour !== 12) {
        hour += 12;
    }

    return hour * 60 + minute;
};

const sortClasses = (classes) => [...classes].sort((a, b) => {
    const dayDiff = getDayIndex(a.day) - getDayIndex(b.day);
    if (dayDiff !== 0) {
        return dayDiff;
    }
    return timeToMinutes(a.time) - timeToMinutes(b.time);
});

// Get timetable entries. Falls back to in-memory data when MongoDB is unavailable.
router.get('/', protect, async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json(sortClasses(memoryClasses));
        }
        await seedDefaultClasses();
        const classes = await ClassTimetable.find();
        res.json(sortClasses(classes));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a class.
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const newClass = {
                _id: `mem-${memoryIdCounter++}`,
                day: req.body.day,
                time: req.body.time,
                className: req.body.className,
                trainer: req.body.trainer,
                room: req.body.room,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            memoryClasses.push(newClass);
            return res.status(201).json(newClass);
        }
        const classEntry = new ClassTimetable(req.body);
        await classEntry.save();
        res.status(201).json(classEntry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a class.
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const idx = memoryClasses.findIndex(c => c._id === req.params.id);
            if (idx === -1) {
                return res.status(404).json({ error: 'Class not found' });
            }
            memoryClasses[idx] = {
                ...memoryClasses[idx],
                ...req.body,
                updatedAt: new Date().toISOString()
            };
            return res.json(memoryClasses[idx]);
        }
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
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        if (!isDbConnected()) {
            const idx = memoryClasses.findIndex(c => c._id === req.params.id);
            if (idx === -1) {
                return res.status(404).json({ error: 'Class not found' });
            }
            memoryClasses.splice(idx, 1);
            return res.json({ message: 'Class deleted' });
        }
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
