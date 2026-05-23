const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g. "1-Month", "6-Month", "Yearly"
    durationInDays: { type: Number, required: false },
    duration: { type: Number, required: true }, // Added for compatibility with test
    price: { type: Number, required: true },
    description: { type: String, required: false } // Added for compatibility with test
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
