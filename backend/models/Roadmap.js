const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    estimatedDurationWeeks: { type: Number },
    roadmap: [{
        skill: { type: String },
        durationWeeks: { type: Number },
        modules: [{
            week: { type: Number },
            topics: [String],
            practiceFocus: { type: String },
            completed: { type: Boolean, default: false }
        }]
    }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
