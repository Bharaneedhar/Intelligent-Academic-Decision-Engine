import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Moon, Sun, ChevronDown, Clock, Calendar as CalendarIcon, Zap, LayoutDashboard, Compass, Target, BookOpen, BarChart2, Brain, LogOut, Menu, X, Settings, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useSessionStore from '../store/sessionStore';
import useLearningStore from '../store/useLearningStore';
import useNotificationStore from '../store/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getMediaUrl } from '../utils/getMediaUrl';

const Navbar = ({ sidebarOpen, setSidebarOpen, setMobileOpen }) => {
    const { user, logout } = useAuthStore();
    const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
    const { currentSessionTime, initializeTimer } = useSessionStore();
    const { sessionHistory, fetchHistory } = useLearningStore();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Roadmaps', icon: Compass, path: '/roadmap' },
        { name: 'Modules', icon: BookOpen, path: '/courses' },
        { name: 'Recommendations', icon: Sparkles, path: '/recommendations' },
        { name: 'Progress', icon: BarChart2, path: '/analytics' },
        { name: 'Settings', icon: Settings, path: '/profile' },
    ];

    const [currentTime, setCurrentTime] = useState(new Date());
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const notifRef = useRef(null);
    const calRef = useRef(null);

    // Read persisted theme from localStorage
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    // Apply stored theme on first mount
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        fetchNotifications();
        fetchHistory();
        initializeTimer();

        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(clockInterval);
    }, [fetchNotifications, fetchHistory, initializeTimer]);

    const formatSessionTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (calRef.current && !calRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleNotifClick = (id) => {
        markAsRead(id);
    };

    // Heatmap Logic
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    const getDayData = (date) => {
        if (!Array.isArray(sessionHistory)) return null;
        const dateStr = date.toISOString().split('T')[0];
        return sessionHistory.find(s => s.date === dateStr);
    };

    const getHeatmapColor = (duration) => {
        const mins = duration / 60;
        if (mins === 0) return 'bg-slate-100 dark:bg-slate-800';
        if (mins < 30) return 'bg-emerald-200 dark:bg-emerald-900/40';
        if (mins < 60) return 'bg-emerald-400 dark:bg-emerald-700/60';
        return 'bg-emerald-600 dark:bg-emerald-500';
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const data = getDayData(date);
            if (data && data.sessionDuration > 0) {
                return <div className="calendar-dot" />;
            }
        }
        return null;
    };

    const selectedDayData = getDayData(selectedDate);

    // User Image logic
    const avatarUrl = user?.profileImage
        ? getMediaUrl(user.profileImage)
        : `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`;

    return (
        <div className="h-16 border-b border-border-light dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/70 dark:bg-[#030712]/80 backdrop-blur-xl sticky top-0 z-40">
            {/* Left side: Sidebar toggle + mobile sidebar open */}
            <div className="flex items-center gap-3 flex-1">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden md:inline-flex p-2 rounded-xl border border-border-light bg-white/70 hover:bg-white transition-all text-slate-700"
                    aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    <Menu className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Right side utils */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Weekly Heatmap */}
                {user && (
                    <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/50">
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">Learning Activity</span>
                            <div className="flex gap-1">
                                {last7Days.map((date, i) => {
                                    const data = getDayData(date);
                                    const duration = data?.sessionDuration || 0;
                                    return (
                                        <div
                                            key={i}
                                            title={`${date.toLocaleDateString()}: ${Math.round(duration / 60)} mins`}
                                            className={`w-3 h-3 rounded-[3px] transition-colors ${getHeatmapColor(duration)}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Calendar Toggle */}
                <div className="relative" ref={calRef}>
                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-bold text-xs ${showCalendar ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800/50'}`}
                    >
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Calendar</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showCalendar && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-[340px] glass-dropdown p-4 rounded-2xl z-50 overflow-hidden"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Learning History</h4>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Activity Found
                                    </div>
                                </div>
                                <div className="light-calendar-override">
                                    <Calendar
                                        onChange={setSelectedDate}
                                        value={selectedDate}
                                        tileContent={tileContent}
                                    />
                                </div>

                                {/* Selected Date Details */}
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <h5 className="font-bold text-sm mt-0.5 text-slate-900 dark:text-white">
                                                {selectedDayData ? formatSessionTime(selectedDayData.sessionDuration) : '00:00:00'}
                                            </h5>
                                        </div>
                                        <div className={`p-2 rounded-lg ${selectedDayData ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                            <Zap className="w-4 h-4" />
                                        </div>
                                    </div>
                                    {!selectedDayData && (
                                        <p className="text-center text-[10px] text-slate-500 mt-3 italic">No learning activity recorded for this date.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Session Timer */}
                {user && (
                    <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 tabular-nums">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span className="text-slate-900 dark:text-white">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                            </span>
                        </div>
                        <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary tabular-nums">
                            ⏱ {formatSessionTime(currentSessionTime)}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300 relative"
                        >
                            <Bell className="w-4 h-4" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[7px] font-black text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-80 glass-dropdown rounded-2xl overflow-hidden shadow-2xl"
                                >
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-xs">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllAsRead} className="text-[10px] text-primary hover:underline font-bold">Clear All</button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500 text-xs italic">No notifications</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n._id} onClick={() => markAsRead(n._id)} className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer flex gap-3 ${!n.isRead ? 'bg-primary/5' : ''}`}>
                                                    <div className={`w-1.5 h-1.5 mt-1.5 rounded-full ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

                    {/* Profile Dropdown (Hover or click could be implemented, currently just click avatar to go to profile) */}
                    <NavLink to="/profile" className="flex items-center gap-3 pl-1 group cursor-pointer">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
                            <img src={avatarUrl} alt="User" className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 object-cover" />
                        </div>
                    </NavLink>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="lg:hidden p-2 ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            <AnimatePresence>
                {showMobileMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-16 md:top-20 left-0 right-0 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-xl lg:hidden p-4 z-30"
                    >
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setShowMobileMenu(false)}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all
                                        ${isActive
                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }
                                    `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </NavLink>
                            ))}
                            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-2" />
                            <button
                                onClick={() => {
                                    setShowMobileMenu(false);
                                    logout();
                                }}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Navbar;
