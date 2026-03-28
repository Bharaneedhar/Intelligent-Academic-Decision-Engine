const Roadmap = require('../models/Roadmap');
const UserSkill = require('../models/UserSkill');
const QuizResult = require('../models/QuizResult');
const RoleSkill = require('../models/RoleSkill');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private
const getDashboardAnalytics = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Get overall progress from roadmaps
        const roadmaps = await Roadmap.find({ user: userId });

        let totalModules = 0;
        let completedModules = 0;

        roadmaps.forEach(r => {
            r.roadmap.forEach(phase => {
                phase.modules.forEach(m => {
                    totalModules++;
                    if (m.completed) completedModules++;
                });
            });
        });

        const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

        // 2. Get skill distribution
        const userSkills = await UserSkill.find({ user: userId }).populate('skill');
        const skillDistribution = userSkills.map(us => ({
            name: us.skill.name,
            level: us.progress,
            mastery: us.masteryLevel
        }));

        // 3. Get recent activity (quiz results)
        const recentQuizzes = await QuizResult.find({ user: userId })
            .populate('skill')
            .sort({ createdAt: -1 })
            .limit(5);

        // 4. Learning activity (simplified for now)
        const learningActivity = [
            { day: 'Mon', hours: 2 },
            { day: 'Tue', hours: 3 },
            { day: 'Wed', hours: 1 },
            { day: 'Thu', hours: 4 },
            { day: 'Fri', hours: 2 },
            { day: 'Sat', hours: 5 },
            { day: 'Sun', hours: 3 },
        ];

        // 5. Skill Gap Analysis
        const activeRoleIds = [...new Set(roadmaps.map(r => r.role?.toString()).filter(Boolean))];
        let skillGap = [];
        
        if (activeRoleIds.length > 0) {
            const requiredSkills = await RoleSkill.find({ role: { $in: activeRoleIds } })
                .populate('skill')
                .populate('role');

            const userSkillMap = new Map();
            userSkills.forEach(us => {
                if (us.skill && us.skill._id) {
                    userSkillMap.set(us.skill._id.toString(), us.progress);
                }
            });

            requiredSkills.forEach(rs => {
                if (!rs.skill) return;
                const skillId = rs.skill._id.toString();
                const userProgress = userSkillMap.get(skillId) || 0;
                
                const targetProgress = rs.importance === 'Required' ? 100 : rs.importance === 'Recommended' ? 80 : 50;
                
                if (userProgress < targetProgress) {
                    skillGap.push({
                        role: rs.role?.title || 'Unknown Role',
                        skill: rs.skill.name,
                        importance: rs.importance,
                        current: userProgress,
                        target: targetProgress,
                        gap: targetProgress - userProgress
                    });
                }
            });

            skillGap.sort((a, b) => b.gap - a.gap);
            skillGap = skillGap.slice(0, 5); // Return top 5 gaps
        }

        res.json({
            overallProgress,
            totalRoadmaps: roadmaps.length,
            completedModules,
            totalModules,
            skillDistribution,
            recentQuizzes,
            learningActivity,
            skillGap
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardAnalytics
};
