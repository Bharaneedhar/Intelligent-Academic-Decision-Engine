const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { completeModule } = require('../controllers/moduleController');

// All module routes require authentication
router.use(protect);

// POST /api/modules/complete
router.post('/complete', completeModule);

module.exports = router;

