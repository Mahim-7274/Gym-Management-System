const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true 
    },
    status: { 
        type: String, 
        enum: ['Functional', 'Broken', 'Under Maintenance'], 
        default: 'Functional' 
    },
    lastFixed: { 
        type: Date 
    },
    note: { 
        type: String,
        default: '' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Machine', machineSchema);