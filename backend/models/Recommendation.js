const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    role: { type: String },
    internships: [{ type: String }],
    certifications: [{ type: String }],
    technologies: [{ type: String }],
    courses: [{ type: String }],
    projectIdeas: [{ type: String }],
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);

