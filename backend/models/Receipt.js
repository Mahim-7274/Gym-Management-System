const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    amountPaid: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Receipt', receiptSchema);
