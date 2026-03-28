const ModuleCompletion = require('../models/ModuleCompletion');

// POST /api/modules/complete
// Body: { courseId, weekId, moduleId }
const completeModule = async (req, res) => {
    try {
        const { courseId, weekId, moduleId } = req.body;
        const userId = req.user.id;

        if (!userId || !courseId || typeof weekId === 'undefined' || !moduleId) {
            return res.status(400).json({ message: 'courseId, weekId, and moduleId are required' });
        }

        const doc = await ModuleCompletion.findOneAndUpdate(
            { userId, courseId, weekId, moduleId },
            { completed: true },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json(doc);
    } catch (error) {
        console.error('Module completion update failed:', error);
        return res.status(500).json({ message: 'Failed to update module completion', error: error.message });
    }
};

module.exports = {
    completeModule,
};

