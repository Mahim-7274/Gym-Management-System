const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    emergencyContactName: { type: String },
    emergencyContactPhone: { type: String },
    healthNotes: { type: String },
    status: { type: String, enum: ['Active', 'Expired'], default: 'Expired' },
    currentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    expiryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
