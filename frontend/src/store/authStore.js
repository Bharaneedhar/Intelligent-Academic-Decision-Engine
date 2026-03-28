import { create } from 'zustand';
import api from '../utils/api';
import useSessionStore from './sessionStore';

const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post('/auth/register', userData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            set({ user: res.data, token: res.data.token, loading: false });
            return true;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Registration failed', loading: false });
            return false;
        }
    },

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post('/auth/login', credentials);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            set({ user: res.data, token: res.data.token, loading: false });
            return true;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Login failed', loading: false });
            return false;
        }
    },

    logout: async () => {
        useSessionStore.getState().stopSessionTimer();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
    },

    getMe: async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const res = await api.get('/auth/me');
            localStorage.setItem('user', JSON.stringify(res.data));
            set({ user: res.data });
        } catch (err) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null });
        }
    },

    // Update user fields in store (called after profile save)
    updateUser: (updatedFields) => {
        set((state) => {
            const newUser = state.user ? { ...state.user, ...updatedFields } : state.user;
            if (newUser) {
                localStorage.setItem('user', JSON.stringify(newUser));
            }
            return { user: newUser };
        });
    },
}));

export default useAuthStore;
