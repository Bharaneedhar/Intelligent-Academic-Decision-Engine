const UserSkill = require('../models/UserSkill');
const Skill = require('../models/Skill');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: attempt JSON extraction from AI text
const extractJSON = (text) => {
    let jsonStr = text;
    if (text.includes('```json')) {
        jsonStr = text.split('```json')[1].split('```')[0];
    } else if (text.includes('```')) {
        jsonStr = text.split('```')[1].split('```')[0];
    } else {
        const s = text.indexOf('{'); const e = text.lastIndexOf('}');
        if (s !== -1 && e !== -1) jsonStr = text.substring(s, e + 1);
    }
    return JSON.parse(jsonStr.trim().replace(/,(\s*[\]}])/g, '$1'));
};

// @desc  Get all user skills
// @route GET /api/skills/user
const getUserSkills = async (req, res) => {
    try {
        const userSkills = await UserSkill.find({ user: req.user.id }).populate('skill');
        res.json(userSkills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all skills (for search in assessment UI)
// @route GET /api/skills
const getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find().lean();
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Add/update user skill with self-rating
// @route POST /api/skills/assess
const assessSkill = async (req, res) => {
    const { skillId, masteryLevel, selfRating } = req.body;
    try {
        let userSkill = await UserSkill.findOne({ user: req.user.id, skill: skillId });
        if (userSkill) {
            if (masteryLevel) userSkill.masteryLevel = masteryLevel;
            if (selfRating !== undefined) {
                userSkill.selfRating = selfRating;
                userSkill.verificationStatus = 'pending'; // reset verification on re-rate
            }
            userSkill.lastAssessed = Date.now();
            await userSkill.save();
        } else {
            userSkill = await UserSkill.create({
                user: req.user.id,
                skill: skillId,
                masteryLevel: masteryLevel || deriveLevelFromRating(selfRating),
                selfRating: selfRating || null,
                verificationStatus: 'pending',
            });
        }
        res.json(userSkill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: map 1-5 self-rating to mastery level label
const deriveLevelFromRating = (rating) => {
    if (!rating) return 'Beginner';
    if (rating <= 2) return 'Beginner';
    if (rating <= 3) return 'Intermediate';
    return 'Advanced';
};

// @desc  Generate AI verification quiz for a user skill
// @route POST /api/skills/verify/generate
const generateVerificationQuiz = async (req, res) => {
    const { skillId, selfRating } = req.body;
    try {
        const skill = await Skill.findById(skillId);
        if (!skill) return res.status(404).json({ message: 'Skill not found' });

        const level = deriveLevelFromRating(selfRating);
        const prompt = `
You are an expert interviewer. Generate exactly 5 multiple-choice questions to verify a user's 
${level} level proficiency in "${skill.name}".

The difficulty should match "${level}" level.
Rating provided by user: ${selfRating}/5.

Return ONLY this JSON (no markdown, no explanations):
{
  "skillName": "${skill.name}",
  "level": "${level}",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    }
  ]
}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = extractJSON(text);
        res.json(parsed);
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ message: 'Failed to generate verification quiz: ' + error.message });
    }
};

// @desc  Submit quiz answers and validate skill level
// @route POST /api/skills/verify/submit
const submitVerification = async (req, res) => {
    const { skillId, answers, questions, selfRating } = req.body;
    // answers = [{ id, selectedAnswer }], questions = [{ id, correctAnswer }]
    try {
        const totalQuestions = questions.length;
        const correct = answers.filter(a => {
            const q = questions.find(q => q.id === a.id);
            return q && q.correctAnswer === a.selectedAnswer;
        }).length;

        const score = Math.round((correct / totalQuestions) * 100);
        const passed = score >= 60; // threshold: 60%

        const selfLevel = deriveLevelFromRating(selfRating);
        let validatedLevel;

        if (passed) {
            validatedLevel = selfLevel; // confirmed
        } else {
            // Downgrade one level
            if (selfLevel === 'Advanced') validatedLevel = 'Intermediate';
            else validatedLevel = 'Beginner';
        }

        // Save validated level
        await UserSkill.findOneAndUpdate(
            { user: req.user.id, skill: skillId },
            {
                validatedLevel,
                masteryLevel: validatedLevel,
                verificationStatus: passed ? 'verified' : 'failed',
                lastAssessed: Date.now(),
            },
            { upsert: true }
        );

        res.json({
            score,
            correct,
            total: totalQuestions,
            passed,
            validatedLevel,
            message: passed
                ? `Great job! Your ${selfLevel} level in this skill has been confirmed.`
                : `Based on your answers, your skill level has been adjusted to ${validatedLevel}.`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserSkills,
    getAllSkills,
    assessSkill,
    generateVerificationQuiz,
    submitVerification,
};
