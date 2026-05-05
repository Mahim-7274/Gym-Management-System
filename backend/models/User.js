const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password']
    },
    role: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'staff'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
