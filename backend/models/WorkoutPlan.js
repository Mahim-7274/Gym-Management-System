const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    title: {
        type: String,
        trim: true,
        default: 'Workout Plan'
    },
    dailyExercises: {
        type: String,
        required: [true, 'Please provide workout exercises'],
        trim: true
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    assignedTrainer: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
