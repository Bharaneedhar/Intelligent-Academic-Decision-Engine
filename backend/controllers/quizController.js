const QuizResult = require('../models/QuizResult');
const { generateQuiz } = require('../services/aiService');

// @desc    Generate a quiz for a module
// @route   POST /api/quizzes/generate
// @access  Private
const generateUserQuiz = async (req, res) => {
    const { skillName, topics } = req.body;

    try {
        const quizData = await generateQuiz(skillName, topics);
        res.status(200).json(quizData);
    } catch (error) {
        console.error('Quiz Generation Error:', error);
        res.status(500).json({ message: 'Failed to generate quiz', error: error.message });
    }
};

const Roadmap = require('../models/Roadmap');
const UserSkill = require('../models/UserSkill');
const Skill = require('../models/Skill');

// @desc    Save quiz result
// @route   POST /api/quizzes/result
// @access  Private
const saveQuizResult = async (req, res) => {
    const { skillId, moduleTitle, score, totalQuestions, answers, skillName } = req.body;
    const userId = req.user.id;

    try {
        const result = await QuizResult.create({
            user: userId,
            skill: skillId, // Note: this might be roleId currently due to frontend proxying
            moduleTitle,
            score,
            totalQuestions,
            answers
        });

        // 1. Update Roadmap completion status
        // Find roadmap for this user (we might need to search by roleId if skillId is roleId)
        const roadmap = await Roadmap.findOne({ user: userId, role: skillId });
        if (roadmap) {
            let updated = false;
            roadmap.roadmap.forEach(phase => {
                phase.modules.forEach(module => {
                    // Try to match by title
                    if (moduleTitle.includes(`Week ${module.week}`)) {
                        module.completed = true;
                        updated = true;
                    }
                });
            });
            if (updated) await roadmap.save();
        }

        // 2. Update UserSkill progress if it was a good score
        if (score / totalQuestions >= 0.6) {
            // Find actual skill by name if possible
            let skill = await Skill.findOne({ name: skillName });
            if (skill) {
                let userSkill = await UserSkill.findOne({ user: userId, skill: skill._id });
                if (!userSkill) {
                    userSkill = new UserSkill({ user: userId, skill: skill._id });
                }
                userSkill.progress = Math.min(100, userSkill.progress + 20);
                if (userSkill.progress >= 40) userSkill.masteryLevel = "Intermediate";
                if (userSkill.progress >= 80) userSkill.masteryLevel = "Advanced";
                await userSkill.save();
            }
        }

        res.status(201).json(result);
    } catch (error) {
        console.error('Save Quiz Result Error:', error);
        res.status(500).json({ message: 'Failed to save quiz result', error: error.message });
    }
};

// @desc    Get user quiz history
// @route   GET /api/quizzes/history
// @access  Private
const getQuizHistory = async (req, res) => {
    try {
        const history = await QuizResult.find({ user: req.user.id }).populate('skill');
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateUserQuiz,
    saveQuizResult,
    getQuizHistory
};
