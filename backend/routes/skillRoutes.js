const express = require('express');
const router = express.Router();
const {
    getUserSkills,
    getAllSkills,
    assessSkill,
    generateVerificationQuiz,
    submitVerification,
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllSkills);             // GET all skills (for search)
router.get('/user', protect, getUserSkills);        // GET logged-in user's skills
router.post('/assess', protect, assessSkill);       // POST add/update skill + self-rating
router.post('/verify/generate', protect, generateVerificationQuiz);  // POST generate AI quiz
router.post('/verify/submit', protect, submitVerification);          // POST submit quiz answers

module.exports = router;
