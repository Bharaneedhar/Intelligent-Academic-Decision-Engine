const express = require('express');
const router = express.Router();
const {
    getRoles,
    getRoleSkills,
    createRole,
    createSkill,
    linkSkillToRole
} = require('../controllers/roleController');

router.get('/', getRoles);
router.get('/:id/skills', getRoleSkills);

// Admin/Setup Routes
router.post('/', createRole);
router.post('/skills', createSkill);
router.post('/link', linkSkillToRole);

module.exports = router;
