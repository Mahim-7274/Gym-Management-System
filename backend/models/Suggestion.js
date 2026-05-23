const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    roleType: {
        type: String,
        enum: ['Member', 'Staff', 'Trainer', 'Admin', 'Guest'],
        default: 'Member'
    },
    category: {
        type: String,
        enum: ['Idea', 'Complaint', 'Feedback', 'Maintenance', 'Other'],
        default: 'Feedback'
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        trim: true
    },
    status: {
        type: String,
        enum: ['New', 'Reviewed', 'Resolved'],
        default: 'New'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
