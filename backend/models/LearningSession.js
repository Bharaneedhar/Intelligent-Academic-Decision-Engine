const mongoose = require('mongoose');

const learningSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
    },
    sessionDuration: {
        type: Number, // In seconds
        default: 0,
    },
    completedModules: [{
        type: String,
    }]
}, {
    timestamps: true
});

// Ensure one record per user per date
learningSessionSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('LearningSession', learningSessionSchema);
