const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String },
    description: { type: String },
});

module.exports = mongoose.model('Skill', SkillSchema);
