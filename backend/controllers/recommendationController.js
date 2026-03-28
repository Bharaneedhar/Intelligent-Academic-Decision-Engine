const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const UserSkill = require('../models/UserSkill');
const Roadmap = require('../models/Roadmap');
const { generateRecommendations } = require('../services/aiService');

// GET /api/recommendations/:userId
// Returns cached or freshly generated recommendations for a user
const getUserRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;

        // Basic auth guard: user can only access their own recommendations unless admin
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({ message: 'Not authorized to view these recommendations' });
        }

        const user = await User.findById(userId).populate('selectedRoles', 'title').lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const primaryRole = user.selectedRoles && user.selectedRoles.length > 0
            ? user.selectedRoles[0].title
            : null;

        // Gather learned skills (verified or above a threshold)
        const userSkills = await UserSkill.find({ user: userId }).lean();
        const learnedSkills = userSkills
            .filter(s => s.verificationStatus === 'verified' || s.level === 'advanced' || s.level === 'intermediate')
            .map(s => s.skillName || s.name)
            .filter(Boolean);

        // Derive simple progress and completed module labels from roadmaps
        const roadmaps = await Roadmap.find({ user: userId }).lean();
        let completedModules = [];
        let totalModules = 0;

        roadmaps.forEach(r => {
            (r.roadmap || []).forEach(phase => {
                (phase.modules || []).forEach(m => {
                    totalModules += 1;
                    if (m.completed) {
                        completedModules.push({
                            roleTitle: r.roleTitle || undefined,
                            skill: phase.skill,
                            week: m.week,
                            topics: m.topics || [],
                        });
                    }
                });
            });
        });

        const overallProgress = totalModules > 0
            ? Math.round((completedModules.length / totalModules) * 100)
            : user.profileComplete ? 20 : 0;

        // Use cached recommendations if they exist and are recent (e.g., last 6 hours)
        const SIX_HOURS = 6 * 60 * 60 * 1000;
        let existing = await Recommendation.findOne({ userId });

        const isFresh = existing && (Date.now() - existing.updatedAt.getTime() < SIX_HOURS);

        if (existing && isFresh) {
            return res.json(existing);
        }

        // Generate fresh recommendations via Gemini
        const aiResult = await generateRecommendations({
            role: primaryRole,
            skills: learnedSkills,
            completedModules,
            progress: overallProgress,
        });

        const payload = {
            userId,
            role: primaryRole,
            internships: aiResult.internships || [],
            certifications: aiResult.certifications || [],
            technologies: aiResult.technologies || [],
            courses: aiResult.courses || [],
            projectIdeas: aiResult.projectIdeas || [],
            updatedAt: new Date(),
        };

        if (existing) {
            existing.set(payload);
            await existing.save();
            return res.json(existing);
        }

        const created = await Recommendation.create(payload);
        return res.json(created);
    } catch (error) {
        console.error('Recommendation generation failed:', error);
        res.status(500).json({ message: 'Failed to generate recommendations', error: error.message });
    }
};

module.exports = {
    getUserRecommendations,
};

