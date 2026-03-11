const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CheckIn', checkInSchema);
