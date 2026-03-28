const Notification = require('../models/Notification');
const User = require('../models/User');
const UserSkill = require('../models/UserSkill');

const INACTIVITY_HOURS = 72; // 3 days

// @desc  Get user notifications
// @route GET /api/notifications
const getNotifications = async (req, res) => {
    try {
        // Auto-generate inactivity notification if needed
        await checkAndGenerateInactivity(req.user._id, req.user.name);

        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const unreadCount = notifications.filter(n => !n.isRead).length;

        res.json({ notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc  Mark notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true }
        );
        res.json({ message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc  Mark all notifications as read
// @route PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Internal: generate inactivity notification if threshold exceeded
const checkAndGenerateInactivity = async (userId, userName) => {
    try {
        // Check last assessed skill or last login time
        const lastSkill = await UserSkill.findOne({ user: userId }).sort({ lastAssessed: -1 });
        const lastActivity = lastSkill?.lastAssessed || null;

        if (!lastActivity) return; // No activity to base inactivity on yet

        const hoursElapsed = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60);
        if (hoursElapsed < INACTIVITY_HOURS) return;

        // Check if we already sent this notification recently (within 24h)
        const recent = await Notification.findOne({
            userId,
            type: 'inactivity',
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });
        if (recent) return;

        // Fetch user's first role name for a personalized message
        const user = await User.findById(userId).populate('selectedRoles', 'title').lean();
        const roleName = user?.selectedRoles?.[0]?.title || 'your selected role';

        await Notification.create({
            userId,
            message: `Reminder: You haven't made progress in ${Math.floor(hoursElapsed / 24)} day(s). Continue your learning roadmap to improve your ${roleName} skills!`,
            type: 'inactivity',
        });
    } catch (err) {
        console.error('Inactivity check error:', err.message);
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
