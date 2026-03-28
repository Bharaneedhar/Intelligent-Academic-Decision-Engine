const Role = require('../models/Role');
const Skill = require('../models/Skill');
const RoleSkill = require('../models/RoleSkill');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Public
const getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get skills for a role
// @route   GET /api/roles/:id/skills
// @access  Public
const getRoleSkills = async (req, res) => {
    try {
        const roleSkills = await RoleSkill.find({ role: req.params.id }).populate('skill');
        res.json(roleSkills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin routes (simplified for seeding/setup)
const createRole = async (req, res) => {
    const { title, description, category } = req.body;
    const role = await Role.create({ title, description, category });
    res.status(201).json(role);
};

const createSkill = async (req, res) => {
    const { name, category, description } = req.body;
    const skill = await Skill.create({ name, category, description });
    res.status(201).json(skill);
};

const linkSkillToRole = async (req, res) => {
    const { roleId, skillId, importance } = req.body;
    const roleSkill = await RoleSkill.create({ role: roleId, skill: skillId, importance });
    res.status(201).json(roleSkill);
};

module.exports = {
    getRoles,
    getRoleSkills,
    createRole,
    createSkill,
    linkSkillToRole
};
