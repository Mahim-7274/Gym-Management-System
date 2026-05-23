const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploads as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB if not in testing mode
if (process.env.NODE_ENV !== 'test' && process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Successfully connected to MongoDB.'))
        .catch(err => console.error('MongoDB connection error:', err));
}

// Routes
const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const memberRoutes = require('./routes/memberRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');
const classTimetableRoutes = require('./routes/classTimetableRoutes');
const workerRoutes = require('./routes/worker');
const machineRoutes = require('./routes/machine.route');
const progressRoutes = require('./routes/progress.route');
const workoutPlanRoutes = require('./routes/workoutPlanRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const checkInRoutes = require('./routes/checkInRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/gym-plans', planRoutes); // For backend Jest tests
app.use('/api/members', memberRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/class-timetable', classTimetableRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/analytics', analyticsRoutes);

module.exports = app;

