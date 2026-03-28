const { generateLearningMaterial } = require('../services/aiService');
const LearningSession = require('../models/LearningSession');

// @desc    Generate learning material for a topic
// @route   POST /api/learning/generate
// @access  Private
const generateContent = async (req, res) => {
    const { topic, skillName } = req.body;

    if (!topic || !skillName) {
        return res.status(400).json({ message: "Topic and skillName are required" });
    }

    try {
        const content = await generateLearningMaterial(topic, skillName);
        res.json({ topic, content });
    } catch (error) {
        console.error("Learning Content Generation Error:", error);
        res.status(500).json({ message: "Failed to generate learning material", error: error.message });
    }
};

// @desc    Sync learning session duration and completed modules
// @route   POST /api/learning/session
// @access  Private
const syncSession = async (req, res) => {
    try {
        const { date, durationToAdd, completedModule } = req.body;
        const userId = req.user.id;

        if (!date || durationToAdd === undefined) {
            return res.status(400).json({ message: 'Date and durationToAdd are required' });
        }

        let session = await LearningSession.findOne({ user: userId, date });

        if (!session) {
            session = new LearningSession({
                user: userId,
                date,
                sessionDuration: 0,
                completedModules: []
            });
        }

        session.sessionDuration += Number(durationToAdd);

        if (completedModule && !session.completedModules.includes(completedModule)) {
            session.completedModules.push(completedModule);
        }

        await session.save();
        res.status(200).json(session);
    } catch (error) {
        console.error('Sync session error:', error);
        res.status(500).json({ message: 'Server error syncing session' });
    }
};

// @desc    Get user's learning history
// @route   GET /api/learning/history
// @access  Private
const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await LearningSession.find({ user: userId }).sort({ date: 1 });
        res.status(200).json(history);
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ message: 'Server error fetching history' });
    }
};

module.exports = {
    generateContent,
    syncSession,
    getHistory
};
