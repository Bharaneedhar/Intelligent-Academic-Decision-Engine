const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserRecommendations } = require('../controllers/recommendationController');

// All recommendation routes require authentication
router.use(protect);

// GET /api/recommendations/:userId
router.get('/:userId', getUserRecommendations);

module.exports = router;

