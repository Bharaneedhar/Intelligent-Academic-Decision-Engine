import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, TrendingUp, AlertCircle, Plus, X, ChevronRight, Loader2, Sparkles, Lightbulb, Clock, ChevronDown, Calendar as CalendarIcon, Trash, FileText, Download, PlayCircle, Trophy, Activity, Award, Compass } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useRoadmapStore from '../store/roadmapStore';
import useLearningStore from '../store/useLearningStore';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const { roadmaps, fetchRoadmaps, generateRoadmap, deleteRoadmap, loading: roadmapLoading, error: roadmapError } = useRoadmapStore();
    const [roles, setRoles] = useState([]);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(null); // stores roadmap ID to delete
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [downloadingReport, setDownloadingReport] = useState(false);
    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customRoleTitle, setCustomRoleTitle] = useState('');
    const [addingRole, setAddingRole] = useState(false);

    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);

    const { user } = useAuthStore();
    const { sessionHistory, fetchHistory } = useLearningStore();

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const chartData = Array.isArray(sessionHistory) ? sessionHistory.slice(-7).map(s => ({
        day: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Number((s.sessionDuration / 3600).toFixed(1))
    })) : [];

    useEffect(() => {
        fetchRoadmaps();
        const fetchRoles = async () => {
            try {
                const res = await api.get('/roles');
                setRoles(res.data);
                setLoadingRoles(false);
            } catch (err) {
                console.error(err);
                setLoadingRoles(false);
            }
        };

        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics');
                setAnalytics(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoadingAnalytics(false);
            }
        };

        fetchRoles();
        fetchAnalytics();
    }, [fetchRoadmaps]);

    useEffect(() => {
        const fetchReport = async () => {
            setLoadingReport(true);
            try {
                const res = await api.get(`/reports/daily?date=${reportDate}`);
                setReportData(res.data);
            } catch (err) {
                console.error("Failed to fetch report", err);
            } finally {
                setLoadingReport(false);
            }
        };
        fetchReport();
    }, [reportDate]);

    const handleSelectRole = async (roleId, customTitle = null) => {
        if (addingRole) return; // Prevent double-click
        setAddingRole(true);
        try {
            const res = await api.post('/profile/roles/add', {
                roleId: customTitle ? null : roleId,
                customRoleTitle: customTitle
            });
            await fetchRoadmaps();
            setShowRoleModal(false);
            setShowCustomInput(false);
            setCustomRoleTitle('');
            navigate('/roadmap', { state: { roleId: res.data.roadmap?.role?._id || roleId } });
        } catch (err) {
            console.error("Failed to add role", err);
            alert(err.response?.data?.message || 'Failed to add role. Please try again.');
        } finally {
            setAddingRole(false);
        }
    };

    const handleDeleteRoadmap = async (id) => {
        try {
            const success = await deleteRoadmap(id);
            if (success) {
                setShowDeleteModal(null);
            }
        } catch (err) {
            console.error("Failed to delete roadmap", err);
        }
    };

    const handleDownloadReport = async () => {
        setDownloadingReport(true);
        try {
            const response = await api.get(`/reports/daily/pdf?date=${reportDate}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Daily_Report_${reportDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Failed to download report", err);
            alert('Failed to generate report. Please try again.');
        } finally {
            setDownloadingReport(false);
        }
    };

    const ProgressBar = ({ label, value, color = "bg-black dark:bg-white" }) => (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className={`h-full ${color}`}
                />
            </div>
            <div className="font-mono text-[10px] text-slate-400">
                {'█'.repeat(Math.round(value / 10))}{'░'.repeat(10 - Math.round(value / 10))}
            </div>
        </div>
    );

    const getOverallProgress = () => {
        if (!analytics?.overallProgress) return 0;
        return Number(analytics.overallProgress) || 0;
    };

    const ProgressRing = ({ value = 0, size = 112, stroke = 10 }) => {
        const safe = Math.max(0, Math.min(100, Number(value) || 0));
        const r = (size - stroke) / 2;
        const c = 2 * Math.PI * r;
        const offset = c - (safe / 100) * c;
        return (
            <svg width={size} height={size} className="block">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke="#EFEFEF"
                    strokeWidth={stroke}
                    fill="transparent"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke="#F6C547"
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.7s ease' }}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
        );
    };

    const StatCircle = ({ icon: Icon, label, value, sub, tone = 'bg-white dark:bg-slate-900' }) => (
        <div className="w-full aspect-square sm:w-[160px] sm:h-[160px] max-w-[160px] rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center mx-auto transition-colors hover:border-slate-300 dark:hover:border-slate-700 p-2 sm:p-4">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl ${tone} flex items-center justify-center mb-2 sm:mb-3`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 dark:text-slate-100" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
            <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{label}</div>
            {sub ? <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-500 mt-1">{sub}</div> : null}
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {roadmapError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-medium">
                    <AlertCircle className="w-5 h-5" />
                    {roadmapError}
                </div>
            )}

            {/* Top section: greeting + quick stats */}
            <div className="rounded-2xl p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                            Hi, {user?.name || 'Learner'}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">Here is your dashboard.</p>
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary dark:bg-slate-900 border border-border-light dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            🔥 {analytics?.streak || 0} Day Streak
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                            onClick={() => setShowRoleModal(true)}
                            className="soft-button-primary !rounded-2xl !px-5 !py-3 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Roadmap
                        </button>
                        <button
                            onClick={handleDownloadReport}
                            disabled={downloadingReport}
                            className="soft-button-ghost !rounded-2xl !px-5 !py-3 text-sm disabled:opacity-50"
                        >
                            {downloadingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Export
                        </button>
                    </div>
                </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
                <StatCircle icon={BookOpen} label="My Roadmaps" value={roadmaps.length} tone="bg-slate-100 dark:bg-slate-800" />
                <StatCircle icon={Target} label="Finished Modules" value={analytics?.completedModules || 0} tone="bg-slate-100 dark:bg-slate-800" />
                <StatCircle icon={TrendingUp} label="Study Streak" value={`${analytics?.streak || 0}`} sub="days" tone="bg-slate-100 dark:bg-slate-800" />

                <div className="w-full aspect-square sm:w-[160px] sm:h-[160px] max-w-[160px] rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center mx-auto relative transition-colors hover:border-slate-300 dark:hover:border-slate-700 p-2 sm:p-4">
                    <div className="absolute inset-0 flex items-center justify-center scale-75 sm:scale-100">
                        <ProgressRing value={getOverallProgress()} />
                    </div>
                    <div className="relative z-10 flex flex-col items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-2">{getOverallProgress()}%</div>
                        <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">My Progress</div>
                    </div>
                </div>
            </div>

            {/* Middle section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Active Roadmaps List */}
                <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Roadmaps</h3>
                        <button onClick={() => navigate('/roadmap')} className="text-sm font-semibold text-slate-700 hover:underline">See all</button>
                    </div>

                    <div className="space-y-4">
                        {roadmaps.length === 0 ? (
                            <div className="py-10 text-center text-slate-600">
                                No roadmaps yet. Click <span className="font-semibold">Add Roadmap</span> to start.
                            </div>
                        ) : (
                            roadmaps.map((r, i) => (
                                <div key={i} onClick={() => navigate('/roadmap')} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white flex items-center justify-center font-bold">
                                            {r.role?.title?.charAt(0) || 'R'}
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-slate-900">{r.role?.title}</h4>
                                            <p className="text-xs text-slate-600 mt-0.5">{r.roadmap?.length || 0} modules</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowDeleteModal(r._id); }}
                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-secondary rounded-xl transition-colors">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Utilization Chart */}
                <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full min-h-[400px]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Recent Study</h3>
                    <p className="text-sm text-slate-500 mb-6">Your last 7 days (hours studied).</p>
                    <div className="flex-1 w-full min-h-[250px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.3} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Bar dataKey="hours" fill="#F6C547" radius={[8, 8, 8, 8]} barSize={22} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <CalendarIcon className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">No study data yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Skill Gap Analysis Section */}
            {analytics?.skillGap && analytics.skillGap.length > 0 && (
                <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Skill Gap Analysis</h3>
                    <p className="text-sm text-slate-500 mb-6">Skills you need to improve to reach your target roles.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analytics.skillGap.map((gap, i) => (
                            <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{gap.skill}</h4>
                                        <p className="text-xs text-slate-500">{gap.role}</p>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md">
                                        Gap: {gap.gap}%
                                    </span>
                                </div>
                                <div className="mt-auto space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                                        <span>Current: {gap.current}%</span>
                                        <span>Target: {gap.target}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-1000"
                                            style={{ width: `${(gap.current / gap.target) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Next Steps</h3>
                    <p className="text-sm text-slate-500 mt-1">Simple tips to keep you moving.</p>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { title: 'Pick one roadmap', desc: 'Choose 1 goal and focus on it this week.', icon: Compass },
                            { title: 'Study 20 minutes', desc: 'Small daily study is better than long breaks.', icon: Clock },
                            { title: 'Finish one module', desc: 'Complete 1 module and mark it done.', icon: Target },
                            { title: 'Take a quick quiz', desc: 'Short tests help you remember better.', icon: Trophy },
                        ].map((t) => (
                            <div key={t.title} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
                                        <t.icon className="w-5 h-5 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{t.title}</div>
                                        <div className="text-sm text-slate-500 mt-1">{t.desc}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Numbers</h3>
                    <p className="text-sm text-slate-500 mt-1">Small things that matter.</p>
                    <div className="mt-5 space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">🔥 Streak</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{analytics?.streak || 0} days</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">✅ Finished</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{analytics?.completedModules || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">📚 Roadmaps</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{roadmaps.length}</span>
                        </div>
                    </div>
                </div>
            </div>


            {/* Role Modal */}
            <AnimatePresence>
                {showRoleModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRoleModal(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] p-8 relative shadow-2xl overflow-hidden"
                        >
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select Your Goal</h2>
                                <p className="text-slate-500 mt-1">What role are you aiming for? AI will build your path.</p>
                            </div>

                            {loadingRoles ? (
                                <div className="py-20 flex flex-col items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-slate-900 dark:text-white animate-spin" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {roles.map((role) => (
                                        <button
                                            key={role._id}
                                            onClick={() => handleSelectRole(role._id)}
                                            disabled={addingRole}
                                            className="p-6 text-left glass-card border-none ring-1 ring-slate-100 dark:ring-slate-800 hover:ring-slate-900 dark:ring-white hover:bg-slate-100 dark:bg-slate-800 transition-all group disabled:opacity-50"
                                        >
                                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-slate-900 dark:text-white transition-colors">{role.title}</p>
                                            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{role.description}</p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white/70">{role.category}</span>
                                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-slate-900 dark:text-white" />
                                            </div>
                                        </button>
                                    ))}

                                    <div className="col-span-1 sm:col-span-2 mt-4">
                                        {!showCustomInput ? (
                                            <button
                                                onClick={() => setShowCustomInput(true)}
                                                className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:border-slate-900 dark:border-white hover:text-slate-900 dark:text-white transition-all font-bold flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-5 h-5" /> Not in roles? Type your own
                                            </button>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700"
                                            >
                                                <label className="block text-sm font-bold mb-3 text-slate-900 dark:text-white uppercase tracking-tight">Custom Career Path</label>
                                                <div className="flex gap-3">
                                                    <div className="relative flex-1">
                                                        <Lightbulb className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-900 dark:text-white" />
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            placeholder="e.g. AI Researcher, Game Dev..."
                                                            value={customRoleTitle}
                                                            onChange={(e) => setCustomRoleTitle(e.target.value)}
                                                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl outline-none ring-1 ring-slate-300 dark:ring-slate-600 focus:ring-2 focus:ring-slate-900 dark:ring-white shadow-sm"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleSelectRole(null, customRoleTitle)}
                                                        disabled={!customRoleTitle.trim() || addingRole}
                                                        className="px-6 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                                                    >
                                                        Generate
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => setShowCustomInput(false)}
                                                    className="mt-4 text-xs text-slate-500 hover:text-red-500 transition-colors"
                                                >
                                                    Cancel custom role
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {addingRole && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-10">
                                    <Loader2 className="w-12 h-12 text-slate-900 dark:text-white animate-spin mb-4" />
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">LearnBuddyyy AI is working</h3>
                                    <p className="text-sm text-slate-500 mt-2">Analyzing industry standards and generating your custom curriculum...</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteModal(null)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[24px] p-8 relative shadow-2xl"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Trash className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Roadmap?</h3>
                                <p className="text-slate-500 text-sm mb-8">Are you sure you want to delete this roadmap? This action cannot be undone.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setShowDeleteModal(null)}
                                        className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRoadmap(showDeleteModal)}
                                        disabled={roadmapLoading}
                                        className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {roadmapLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardPage;
