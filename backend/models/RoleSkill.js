const mongoose = require('mongoose');

const RoleSkillSchema = new mongoose.Schema({
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    importance: { type: String, enum: ['Required', 'Recommended', 'Optional'], default: 'Required'},
});

module.exports = mongoose.model('RoleSkill', RoleSkillSchema);
