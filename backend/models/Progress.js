const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    memberId: { type: String, required: true }, // We can link this to the Member's ID
    weight: { type: Number, required: true },
    chest: { type: Number },
    waist: { type: Number },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', ProgressSchema);