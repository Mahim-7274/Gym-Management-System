const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Please provide the notice content'],
        trim: true
    },
    author: {
        type: String,
        default: 'Admin',
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Notice', noticeSchema);
