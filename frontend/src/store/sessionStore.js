import { create } from 'zustand';
import useLearningStore from './useLearningStore';

const useSessionStore = create((set, get) => ({
    sessionStartTimestamp: localStorage.getItem('sessionStartTimestamp') || null,
    currentSessionTime: 0,
    timerInterval: null,
    lifecycleAttached: false,

    startSessionTimer: () => {
        // If already running, don't start another one
        if (get().timerInterval) return;

        let startTime = localStorage.getItem('sessionStartTimestamp');
        if (!startTime) {
            startTime = Date.now().toString();
            localStorage.setItem('sessionStartTimestamp', startTime);
        }

        set({ sessionStartTimestamp: startTime });

        const updateTimer = () => {
            // Read latest start time so refresh doesn't reset
            const persistedStart = localStorage.getItem('sessionStartTimestamp') || startTime;
            startTime = persistedStart;
            const now = Date.now();
            const elapsed = Math.floor((now - parseInt(startTime)) / 1000);
            set({ currentSessionTime: elapsed });
        };

        // Initial update
        updateTimer();

        const interval = setInterval(updateTimer, 1000);
        set({ timerInterval: interval });

        // Lifecycle handling is attached separately in initializeTimer().
    },

    stopSessionTimer: () => {
        const interval = get().timerInterval;
        if (interval) {
            clearInterval(interval);
        }

        const duration = get().currentSessionTime;
        if (duration > 10) {
            useLearningStore.getState().syncSession(duration);
        }

        localStorage.removeItem('sessionStartTimestamp');
        set({
            sessionStartTimestamp: null,
            currentSessionTime: 0,
            timerInterval: null
        });
    },

    attachLifecycleHandlers: () => {
        if (get().lifecycleAttached) return;

        const onVisibilityChange = () => {
            // Stop session when user switches away (tab hidden), restart when back.
            if (document.visibilityState === 'hidden') {
                if (localStorage.getItem('token')) {
                    get().stopSessionTimer();
                }
            } else if (document.visibilityState === 'visible') {
                if (localStorage.getItem('token')) {
                    get().startSessionTimer();
                }
            }
        };

        const onPageHide = () => {
            // Tab close / navigation away / refresh on some browsers
            if (localStorage.getItem('token')) {
                get().stopSessionTimer();
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('beforeunload', onPageHide);
        window.addEventListener('pagehide', onPageHide);

        set({ lifecycleAttached: true });
    },

    // To be called in App.jsx or Navbar.jsx on mount if user is logged in
    initializeTimer: () => {
        if (localStorage.getItem('token')) {
            get().attachLifecycleHandlers();
            get().startSessionTimer();
        }
    }
}));

export default useSessionStore;
