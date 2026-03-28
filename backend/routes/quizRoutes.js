const express = require('express');
const router = express.Router();
const { generateUserQuiz, saveQuizResult, getQuizHistory } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateUserQuiz);
router.post('/result', protect, saveQuizResult);
router.get('/history', protect, getQuizHistory);

module.exports = router;
