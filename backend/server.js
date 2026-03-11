const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const memberRoutes = require('./routes/memberRoutes');
const planRoutes = require('./routes/planRoutes');
const checkInRoutes = require('./routes/checkInRoutes');
const receiptRoutes = require('./routes/receiptRoutes');

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Use Routes
app.use('/api/members', memberRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/receipts', receiptRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Gym Management API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
