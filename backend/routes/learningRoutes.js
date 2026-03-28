const express = require('express');
const router = express.Router();
const { generateContent, syncSession, getHistory } = require('../controllers/learningController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateContent);
router.post('/session', protect, syncSession);
router.get('/history', protect, getHistory);

module.exports = router;
