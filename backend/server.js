const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');

// Do not buffer DB operations for 10s when MongoDB is unavailable.
// This keeps the frontend from receiving delayed failures that can look like a UI freeze.
mongoose.set('bufferCommands', false);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const memberRoutes = require('./routes/memberRoutes');
const planRoutes = require('./routes/planRoutes');
const checkInRoutes = require('./routes/checkInRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const workerRoutes = require('./routes/worker');
const progressRoutes = require('./routes/progress.route');
const machineRoutes = require('./routes/machine.route');
const analyticsRoutes = require('./routes/analyticsRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const authRoutes = require('./routes/authRoutes');
const workoutPlanRoutes = require('./routes/workoutPlanRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');
const classTimetableRoutes = require('./routes/classTimetableRoutes');


// Database Connection
const connectDatabase = async () => {
    if (!process.env.MONGODB_URI) {
        console.warn('MONGODB_URI is missing. Demo login fallback is available in development.');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB connected successfully');
        await authRoutes.initDefaultUsers();
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        console.warn('Admin/staff demo login fallback is available while MongoDB is unavailable.');
    }
};

connectDatabase();

// Use Routes
app.use('/api/members', memberRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/class-timetable', classTimetableRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Gym Management API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
