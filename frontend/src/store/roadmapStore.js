import { create } from 'zustand';
import api from '../utils/api';

const useRoadmapStore = create((set) => ({
    roadmaps: [],
    currentRoadmap: null,
    loading: false,
    error: null,

    fetchRoadmaps: async () => {
        set({ loading: true, error: null });
        try {
            const res = await api.get('/roadmaps');
            set({ roadmaps: res.data, loading: false, error: null });
        } catch (err) {
            set({ error: 'Failed to fetch roadmaps', loading: false });
        }
    },

    generateRoadmap: async (roleId) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post('/roadmaps/generate', { roleId });
            console.log("Roadmap Generation Response:", res.data);
            set((state) => ({
                roadmaps: [...state.roadmaps, res.data],
                currentRoadmap: res.data,
                loading: false
            }));
            return true;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Generation failed', loading: false });
            return false;
        }
    },

    setCurrentRoadmap: (roadmap) => set({ currentRoadmap: roadmap }),

    deleteRoadmap: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/roadmaps/${id}`);
            set((state) => ({
                roadmaps: state.roadmaps.filter((r) => r._id !== id),
                currentRoadmap: state.currentRoadmap?._id === id ? null : state.currentRoadmap,
                loading: false
            }));
            return true;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Deletion failed', loading: false });
            return false;
        }
    },
}));

export default useRoadmapStore;
