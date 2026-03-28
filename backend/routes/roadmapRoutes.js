const express = require('express');
const router = express.Router();
const { generateUserRoadmap, getUserRoadmaps, deleteRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateUserRoadmap);
router.get('/', protect, getUserRoadmaps);
router.delete('/:id', protect, deleteRoadmap);

module.exports = router;
