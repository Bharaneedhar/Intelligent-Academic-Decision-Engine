const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getAllRoles, createRole, updateRole, deleteRole,
    getAllSkillsAdmin, createSkill, updateSkill, deleteSkill,
    getFallbackRoadmaps, createFallbackRoadmap, deleteFallbackRoadmap,
    getSystemAnalytics, getAdminDashboard,
    getAllUsers, getUserById
} = require('../controllers/adminController');

// All admin routes require authentication AND admin role
router.use(protect, adminOnly);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);

// Roles
router.get('/roles', getAllRoles);
router.post('/roles', createRole);
router.put('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);

// Skills
router.get('/skills', getAllSkillsAdmin);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);

// Fallback Roadmaps
router.get('/fallback-roadmaps', getFallbackRoadmaps);
router.post('/fallback-roadmaps', createFallbackRoadmap);
router.delete('/fallback-roadmaps/:id', deleteFallbackRoadmap);

// System Analytics
router.get('/analytics', getSystemAnalytics);
router.get('/dashboard', getAdminDashboard);

module.exports = router;
