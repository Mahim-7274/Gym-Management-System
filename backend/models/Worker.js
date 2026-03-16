const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: 'Trainer' }, // Can be Trainer, Staff, etc.
    workHours: { type: Number, default: 0 },    // For tracking hours (Requirement #6)
    joinedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Worker', workerSchema);