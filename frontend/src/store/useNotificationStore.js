import { create } from 'zustand';
import api from '../utils/api';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const res = await api.get('/notifications');
            set({ notifications: res.data.notifications, unreadCount: res.data.unreadCount, loading: false });
        } catch (err) {
            console.error('Failed to fetch notifications', err);
            set({ loading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            const { notifications, unreadCount } = get();
            const updated = notifications.map(n => n._id === id ? { ...n, isRead: true } : n);
            set({ notifications: updated, unreadCount: Math.max(0, unreadCount - 1) });
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    },

    markAllAsRead: async () => {
        try {
            await api.put('/notifications/read-all');
            const { notifications } = get();
            const updated = notifications.map(n => ({ ...n, isRead: true }));
            set({ notifications: updated, unreadCount: 0 });
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    }
}));

export default useNotificationStore;
