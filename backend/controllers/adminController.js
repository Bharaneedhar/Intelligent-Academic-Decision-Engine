const Role = require('../models/Role');
const Skill = require('../models/Skill');
const User = require('../models/User');
const UserSkill = require('../models/UserSkill');
const Roadmap = require('../models/Roadmap');
const FallbackRoadmap = require('../models/FallbackRoadmap');
const ModuleCompletion = require('../models/ModuleCompletion');
const LearningSession = require('../models/LearningSession');
const QuizResult = require('../models/QuizResult');

const mongoose = require('mongoose');

const toObjectId = (id) => {
    try {
        return typeof id === 'string' ? mongoose.Types.ObjectId.createFromHexString(id) : id;
    } catch {
        return null;
    }
};

const computeUserStatsBulk = async (userIds) => {
    const ids = userIds
        .map((u) => (u && u._id ? u._id : u))
        .map((id) => toObjectId(String(id)))
        .filter(Boolean);

    if (ids.length === 0) return new Map();

    // Total roadmap modules per user
    const roadmapTotals = await Roadmap.aggregate([
        { $match: { user: { $in: ids } } },
        { $unwind: '$roadmap' },
        { $unwind: '$roadmap.modules' },
        { $group: { _id: '$user', totalModules: { $sum: 1 } } },
    ]);

    // Completed modules per user
    const completionTotals = await ModuleCompletion.aggregate([
        { $match: { userId: { $in: ids }, completed: true } },
        { $group: { _id: '$userId', modulesCompleted: { $sum: 1 } } },
    ]);

    // Quiz stats per user
    const quizTotals = await QuizResult.aggregate([
        { $match: { user: { $in: ids } } },
        {
            $addFields: {
                percent: {
                    $cond: [
                        { $gt: ['$totalQuestions', 0] },
                        { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] },
                        0,
                    ]
                }
            }
        },
        {
            $group: {
                _id: '$user',
                quizzesTaken: { $sum: 1 },
                avgScore: { $avg: '$percent' }
            }
        },
    ]);

    const totalsMap = new Map();
    const getOrInit = (key) => {
        const k = String(key);
        if (!totalsMap.has(k)) {
            totalsMap.set(k, { totalModules: 0, modulesCompleted: 0, quizzesTaken: 0, avgScore: 0 });
        }
        return totalsMap.get(k);
    };

    roadmapTotals.forEach((r) => {
        const s = getOrInit(r._id);
        s.totalModules = r.totalModules || 0;
    });
    completionTotals.forEach((c) => {
        const s = getOrInit(c._id);
        s.modulesCompleted = c.modulesCompleted || 0;
    });
    quizTotals.forEach((q) => {
        const s = getOrInit(q._id);
        s.quizzesTaken = q.quizzesTaken || 0;
        s.avgScore = typeof q.avgScore === 'number' ? Math.round(q.avgScore) : 0;
    });

    // Derive progress %
    for (const [k, v] of totalsMap.entries()) {
        v.overallProgress = v.totalModules > 0 ? Math.round((v.modulesCompleted / v.totalModules) * 100) : 0;
    }

    return totalsMap;
};

// ─── ROLE MANAGEMENT ─────────────────────────────────────────────────────────

// GET /api/admin/roles
const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find().lean();
        res.json(roles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/admin/roles
const createRole = async (req, res) => {
    const { title, description, category, requiredSkills } = req.body;
    if (!title) return res.status(400).json({ message: 'Role title is required' });
    try {
        const role = await Role.create({ title, description, category });
        res.status(201).json(role);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/admin/roles/:id
const updateRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.json(role);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/admin/roles/:id
const deleteRole = async (req, res) => {
    try {
        await Role.findByIdAndDelete(req.params.id);
        res.json({ message: 'Role deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── SKILL MANAGEMENT ────────────────────────────────────────────────────────

// GET /api/admin/skills
const getAllSkillsAdmin = async (req, res) => {
    try {
        const skills = await Skill.find().lean();
        res.json(skills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/admin/skills
const createSkill = async (req, res) => {
    const { name, category, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Skill name is required' });
    try {
        const skill = await Skill.create({ name, category, description });
        res.status(201).json(skill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/admin/skills/:id
const updateSkill = async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!skill) return res.status(404).json({ message: 'Skill not found' });
        res.json(skill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/admin/skills/:id
const deleteSkill = async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.params.id);
        res.json({ message: 'Skill deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── FALLBACK ROADMAP MANAGEMENT ──────────────────────────────────────────────

// GET /api/admin/fallback-roadmaps
const getFallbackRoadmaps = async (req, res) => {
    try {
        const roadmaps = await FallbackRoadmap.find().populate('role', 'title').lean();
        res.json(roadmaps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/admin/fallback-roadmaps
const createFallbackRoadmap = async (req, res) => {
    const { roleId, weeks } = req.body;
    if (!roleId || !weeks) return res.status(400).json({ message: 'roleId and weeks are required' });
    try {
        const existing = await FallbackRoadmap.findOne({ role: roleId });
        if (existing) {
            existing.weeks = weeks;
            existing.updatedAt = Date.now();
            existing.createdBy = req.user._id;
            await existing.save();
            return res.json(existing);
        }
        const roadmap = await FallbackRoadmap.create({ role: roleId, weeks, createdBy: req.user._id });
        res.status(201).json(roadmap);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/admin/fallback-roadmaps/:id
const deleteFallbackRoadmap = async (req, res) => {
    try {
        await FallbackRoadmap.findByIdAndDelete(req.params.id);
        res.json({ message: 'Fallback roadmap deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── USER MANAGEMENT ───────────────────────────────────────────────────────────

// GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' })
            .populate('selectedRoles')
            .populate('roleAssessments.roleId')
            .lean();
        const statsByUserId = await computeUserStatsBulk(users.map(u => u._id));

        // Map raw DB user elements into the structured shape the frontend needs initially.
        const mappedUsers = users.map(u => ({
            ...(statsByUserId.get(String(u._id)) || {}),
            _id: u._id,
            id: u._id, // keep legacy field for existing frontend usage
            name: (u.name && u.name.trim()) || 'Unknown User',
            email: u.email,
            role: u.role,
            joined: u.createdAt,
            roles: u.selectedRoles ? u.selectedRoles.map(r => r.title) : [],
            active: u.profileComplete,
            skillGaps: 0,
            academicProfile: u.academicProfile,
            roleAssessments: u.roleAssessments
        }));

        res.json(mappedUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('selectedRoles')
            .populate('roleAssessments.roleId')
            .lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const statsByUserId = await computeUserStatsBulk([user._id]);
        const stats = statsByUserId.get(String(user._id)) || { totalModules: 0, modulesCompleted: 0, quizzesTaken: 0, avgScore: 0, overallProgress: 0 };

        const quizHistory = await QuizResult.find({ user: user._id })
            .sort({ date: -1 })
            .limit(7)
            .lean();

        const recentSessions = await LearningSession.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const recentQuizzes = await QuizResult.find({ user: user._id })
            .sort({ date: -1 })
            .limit(5)
            .lean();

        const recentActivities = [
            ...recentSessions.map(s => ({
                type: 'learning',
                date: s.createdAt,
                summary: `Learning session ${s.sessionDuration || 0}s`,
                completedModules: s.completedModules || [],
            })),
            ...recentQuizzes.map(q => ({
                type: 'quiz',
                date: q.date,
                summary: `Quiz "${q.moduleTitle || 'Module'}" - ${q.score}/${q.totalQuestions}`,
            })),
        ]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8);

        const mappedUser = {
            ...stats,
            _id: user._id,
            id: user._id,
            name: (user.name && user.name.trim()) || 'Unknown User',
            email: user.email,
            role: user.role,
            joined: user.createdAt,
            roles: user.selectedRoles ? user.selectedRoles.map(r => r.title) : [],
            active: user.profileComplete,
            skillGaps: 0,
            academicProfile: user.academicProfile,
            roleAssessments: user.roleAssessments,
            quizHistory: quizHistory.map(q => ({
                date: q.date,
                moduleTitle: q.moduleTitle,
                score: q.score,
                totalQuestions: q.totalQuestions,
                percent: q.totalQuestions ? Math.round((q.score / q.totalQuestions) * 100) : 0,
            })),
            recentActivities,
        };

        res.json(mappedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── SYSTEM ANALYTICS ────────────────────────────────────────────────────────

// GET /api/admin/analytics
const getSystemAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const activeUsers = await User.countDocuments({ role: 'user', profileComplete: true });
        const totalRoadmaps = await Roadmap.countDocuments();

        // Most selected roles
        const roleAgg = await User.aggregate([
            { $unwind: '$selectedRoles' },
            { $group: { _id: '$selectedRoles', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'roles', localField: '_id', foreignField: '_id', as: 'role' } },
            { $unwind: '$role' },
            { $project: { _id: 0, role: '$role.title', count: 1 } },
        ]);

        // Skill verification stats
        const verified = await UserSkill.countDocuments({ verificationStatus: 'verified' });
        const failed = await UserSkill.countDocuments({ verificationStatus: 'failed' });
        const pending = await UserSkill.countDocuments({ verificationStatus: 'pending' });

        res.json({
            totalUsers,
            activeUsers,
            totalRoadmaps,
            topRoles: roleAgg,
            skillVerification: { verified, failed, pending },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/admin/dashboard
// Higher-level admin metrics including module and activity stats
const getAdminDashboard = async (req, res) => {
    try {
        const [totalUsers, activeUsers, modulesCompleted, coursesInProgress] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'user', profileComplete: true }),
            ModuleCompletion.countDocuments({ completed: true }),
            Roadmap.countDocuments(),
        ]);

        // Recent learning sessions (last 5)
        const recentSessions = await LearningSession.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .lean();

        // Recent quiz results (last 5)
        const recentQuizzes = await QuizResult.find()
            .sort({ date: -1 })
            .limit(5)
            .populate('user', 'name email')
            .lean();

        const recentActivities = [
            ...recentSessions.map(s => ({
                type: 'learning',
                userId: s.user?._id,
                userName: s.user?.name,
                email: s.user?.email,
                date: s.createdAt,
                summary: `Learning session ${s.sessionDuration || 0}s`,
                completedModules: s.completedModules || [],
            })),
            ...recentQuizzes.map(q => ({
                type: 'quiz',
                userId: q.user?._id,
                userName: q.user?.name,
                email: q.user?.email,
                date: q.date,
                summary: `Quiz "${q.moduleTitle || 'Module'}" - ${q.score}/${q.totalQuestions}`,
            })),
        ]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8);

        // System Skill Gap Analysis
        const systemSkillGap = await UserSkill.aggregate([
            { $group: { _id: '$skill', avgProgress: { $avg: '$progress' }, userCount: { $sum: 1 } } },
            { $match: { userCount: { $gte: 1 } } },
            { $lookup: { from: 'skills', localField: '_id', foreignField: '_id', as: 'skillDetails' } },
            { $unwind: '$skillDetails' },
            { $project: { _id: 1, name: '$skillDetails.name', avgProgress: { $round: ['$avgProgress', 0] }, userCount: 1 } },
            { $sort: { avgProgress: 1, userCount: -1 } },
            { $limit: 6 }
        ]);

        res.json({
            totalUsers,
            activeUsers,
            modulesCompleted,
            coursesInProgress,
            recentActivities,
            systemSkillGap,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllRoles,
    createRole,
    updateRole,
    deleteRole,
    getAllSkillsAdmin,
    createSkill,
    updateSkill,
    deleteSkill,
    getFallbackRoadmaps,
    createFallbackRoadmap,
    deleteFallbackRoadmap,
    getSystemAnalytics,
    getAllUsers,
    getUserById,
    getAdminDashboard,
};
