import { create } from 'zustand';

// Nested progress state:
// {
//   [courseId]: {
//     [weekId]: {
//       [moduleId]: true
//     }
//   }
// }

const useProgressStore = create((set, get) => ({
    progress: {},

    markModuleComplete: (courseId, weekId, moduleId) => {
        if (!courseId || typeof weekId === 'undefined' || !moduleId) return;

        set((state) => {
            const courseKey = String(courseId);
            const weekKey = String(weekId);

            const next = { ...state.progress };
            if (!next[courseKey]) next[courseKey] = {};
            if (!next[courseKey][weekKey]) next[courseKey][weekKey] = {};

            next[courseKey][weekKey] = {
                ...next[courseKey][weekKey],
                [moduleId]: true,
            };

            return { progress: next };
        });
    },

    isModuleCompleted: (courseId, weekId, moduleId) => {
        const state = get().progress;
        const courseKey = String(courseId);
        const weekKey = String(weekId);
        return !!state[courseKey]?.[weekKey]?.[moduleId];
    },
}));

export default useProgressStore;

