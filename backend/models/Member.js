const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: false
    },
    emergencyContactName: {
        type: String,
        trim: true,
        required: false
    },
    emergencyContactPhone: {
        type: String,
        trim: true,
        required: false
    },
    healthNotes: {
        type: String,
        trim: true,
        required: false
    },
    status: {
        type: String,
        enum: ['Active', 'Expired', 'Inactive'],
        default: 'Active'
    },
    // --- FEATURE 9: Payment Tracking ---
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Partial'],
        default: 'Unpaid' // New members will automatically trigger the Dashboard alert
    },
    currentPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: false
    },
    expiryDate: {
        type: Date,
        required: false
    },
    // Optional: Useful for sorting the member list
    joinDate: {
        type: Date,
        default: Date.now
    },
    profilePicture: {
        type: String,
        required: false
    }
}, { 
    timestamps: true // This automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Member', memberSchema);
