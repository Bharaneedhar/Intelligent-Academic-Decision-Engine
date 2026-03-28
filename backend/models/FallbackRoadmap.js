const mongoose = require('mongoose');

const FallbackRoadmapSchema = new mongoose.Schema({
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true, unique: true },
    weeks: [
        {
            week: { type: Number, required: true },
            topic: { type: String, required: true },
            description: { type: String },
            resources: [{ type: String }],
        }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FallbackRoadmap', FallbackRoadmapSchema);
