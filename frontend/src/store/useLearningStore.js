import { create } from 'zustand';
import api from '../utils/api';

const useLearningStore = create((set, get) => ({
    sessionHistory: [],
    loading: false,
    error: null,

    fetchHistory: async () => {
        set({ loading: true, error: null });
        try {
            const res = await api.get('/learning/history');
            set({ sessionHistory: res.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch learning history', loading: false });
        }
    },

    syncSession: async (durationToAdd, completedModule = null) => {
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const payload = {
                date: today,
                durationToAdd
            };
            if (completedModule) {
                payload.completedModule = completedModule;
            }
            await api.post('/learning/session', payload);

            // Optionally refetch history so chart updates
            await get().fetchHistory();
        } catch (error) {
            console.error('Failed to sync session', error);
        }
    }
}));

export default useLearningStore;
