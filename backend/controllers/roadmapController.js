const Roadmap = require('../models/Roadmap');
const { generateAndSaveRoadmap } = require('../services/roadmapService');

// @desc    Generate and save roadmap
// @route   POST /api/roadmaps/generate
// @access  Private
const generateUserRoadmap = async (req, res) => {
    const { roleId } = req.body;
    const userId = req.user.id;

    try {
        const result = await generateAndSaveRoadmap(userId, roleId);

        if (result.noGap) {
            return res.status(200).json(result);
        }

        res.status(201).json(result);
    } catch (error) {
        console.error("Roadmap Generation Error:", error);
        res.status(500).json({ message: "Failed to generate roadmap", error: error.message });
    }
};

// @desc    Get user's roadmaps
// @route   GET /api/roadmaps
// @access  Private
const getUserRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({ user: req.user.id })
            .populate('role')
            .sort({ createdAt: -1 });
        res.json(roadmaps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a roadmap
// @route   DELETE /api/roadmaps/:id
// @access  Private
const deleteRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id);

        if (!roadmap) {
            return res.status(404).json({ message: 'Roadmap not found' });
        }

        // Check ownership
        if (roadmap.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this roadmap' });
        }

        await Roadmap.findByIdAndDelete(req.params.id);
        res.json({ message: 'Roadmap deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateUserRoadmap,
    getUserRoadmaps,
    deleteRoadmap
};
