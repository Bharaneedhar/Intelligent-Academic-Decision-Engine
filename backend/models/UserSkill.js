const mongoose = require('mongoose');

const UserSkillSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    // User-provided self rating (1–5)
    selfRating: { type: Number, min: 1, max: 5, default: null },
    // AI-verified mastery level (after quiz)
    masteryLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    validatedLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: null },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
    progress: { type: Number, default: 0 }, // 0 to 100
    lastAssessed: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserSkill', UserSkillSchema);
