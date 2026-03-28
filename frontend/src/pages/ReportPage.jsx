import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User as UserIcon,
    Calendar,
    Target,
    Zap,
    Clock,
    TrendingUp,
    Download,
    ArrowLeft,
    Loader2,
    FileText,
    CheckCircle2,
    BookOpen,
    AlertTriangle,
    BrainCircuit,
    Award
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useRoadmapStore from '../store/roadmapStore';
import api from '../utils/api';

const ReportPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const { roadmaps, fetchRoadmaps } = useRoadmapStore();

    const [reportDate, setReportDate] = useState(location.state?.date || new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloadingReport, setDownloadingReport] = useState(false);

    useEffect(() => {
        fetchRoadmaps();
    }, [fetchRoadmaps]);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [reportRes, analyticsRes] = await Promise.all([
                    api.get(`/reports/daily?date=${reportDate}`),
                    api.get('/analytics')
                ]);
                setReportData(reportRes.data);
                setAnalyticsData(analyticsRes.data);
            } catch (err) {
                console.error("Failed to fetch report data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [reportDate]);

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
            alert('Failed to download report. Please try again.');
        } finally {
            setDownloadingReport(false);
        }
    };

    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />
            <p className="text-slate-500 font-medium">Compiling comprehensive academic report...</p>
        </div>
    );

    const activeRoadmap = roadmaps && roadmaps.length > 0 ? roadmaps[0] : null;
    const skills = analyticsData?.skillDistribution || [];
    const quizzes = analyticsData?.recentQuizzes || [];

    // Derive skill gaps from roadmap
    const gaps = activeRoadmap ? activeRoadmap.roadmap.slice(0, 3).map(item => ({
        skill: item.skill,
        priority: 'High',
        status: 'Critical'
    })) : [];

    const learningMinutes = (() => {
        const seconds =
            reportData?.sessionDurationToday ??
            reportData?.learningTimeToday ??
            reportData?.learningSeconds ??
            0;
        const mins = Math.round(Number(seconds) / 60);
        return Number.isFinite(mins) ? mins : 0;
    })();

    const quizPerformance = Number(reportData?.averageQuizScore || 0) || 0;
    const roadmapProgress = Number(reportData?.overallProgress || 0) || 0;
    const dailyModuleGoalPercent = Number(reportData?.dailyModuleGoalProgress || 0) || 0;

    const activityData = [
        { name: 'Completed Modules', value: reportData?.modulesCompletedToday || 0 },
        { name: 'Avg Quiz Score', value: reportData?.averageQuizScore || 0 }
    ];

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Icon className="w-5 h-5 text-slate-900 dark:text-slate-100" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header / Controls */}
            <div className="report-card p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div className="flex items-center gap-4 min-w-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex-shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">Comprehensive Progress Report</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">AI-Generated Academic Evaluation</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <input
                            type="date"
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            className="soft-input !py-3 !px-4 !rounded-xl !font-bold sm:w-[200px]"
                        />
                        <button
                            onClick={handleDownloadReport}
                            disabled={downloadingReport}
                            className="soft-button-primary !rounded-xl !px-6 !py-3 disabled:opacity-50"
                        >
                            {downloadingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                            Export PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* 1. User Information & Selected Role */}
            <div className="report-grid">
                <div className="report-card p-8">
                    <SectionHeader icon={UserIcon} title="User Information" />
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Full Name</span>
                            <span className="text-slate-900 dark:text-slate-100 font-bold">{reportData?.userName || user?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Report Date</span>
                            <span className="text-slate-900 dark:text-slate-100 font-bold">{new Date(reportDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Email Address</span>
                            <span className="text-slate-900 dark:text-slate-100 font-bold">{user?.email}</span>
                        </div>
                    </div>
                </div>

                <div className="report-card p-8">
                    <SectionHeader icon={Target} title="Selected Role" />
                    {activeRoadmap ? (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{activeRoadmap.role?.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                {activeRoadmap.role?.description || 'Your custom generated career path objective.'}
                            </p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm font-bold mt-2">
                                <TrendingUp className="w-4 h-4" />
                                Roadmap Progress: {reportData?.overallProgress || 0}%
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 italic py-4">No active role selected yet.</p>
                    )}
                </div>
            </div>

            {/* Quick report cards (aligned) */}
            <div className="report-grid">
                <div className="report-card p-6 flex flex-col justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Learning Time Invested</p>
                    <div className="mt-4">
                        <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{learningMinutes} minutes</p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Time spent learning today.</p>
                    </div>
                </div>

                {/* Progress Visualization */}
<div className="report-card p-6 col-span-1 md:col-span-2">

<p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">
    Progress Visualization
</p>

<div className="space-y-6">

    {/* Daily Module Goal */}
    <div className="grid grid-cols-[1fr_auto] items-center gap-6">

        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${Math.max(0, Math.min(100, dailyModuleGoalPercent))}%` }}
            />
        </div>

        <div className="text-right min-w-[150px]">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Daily Module Goal
            </p>

            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {dailyModuleGoalPercent}%
            </p>
        </div>

    </div>


    {/* Quiz Performance */}
    <div className="grid grid-cols-[1fr_auto] items-center gap-6">

        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${Math.max(0, Math.min(100, quizPerformance))}%` }}
            />
        </div>

        <div className="text-right min-w-[150px]">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Quiz Performance
            </p>

            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {quizPerformance}%
            </p>
        </div>

    </div>


    {/* Roadmap Progress */}
    <div className="grid grid-cols-[1fr_auto] items-center gap-6">

        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
                className="h-full rounded-full bg-sky-500 transition-all duration-700"
                style={{ width: `${Math.max(0, Math.min(100, roadmapProgress))}%` }}
            />
        </div>

        <div className="text-right min-w-[150px]">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Roadmap Progress
            </p>

            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {roadmapProgress}%
            </p>
        </div>

    </div>

</div>

</div>
            </div>

            {/* 2. Skill Assessment Summary */}
            <div className="report-card p-8">
                <SectionHeader icon={BookOpen} title="Skill Assessment Summary" />
                {skills.length > 0 ? (
                    <div className="report-grid">
                        {skills.map((skill, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{skill.name}</span>
                                    <span className="text-xs font-bold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-600 dark:text-slate-300">
                                        Level {skill.mastery || 1}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${skill.level}%` }}
                                    />
                                </div>
                                <p className="text-right text-xs mt-1 font-bold text-slate-500 dark:text-slate-400">{skill.level}% Mastery</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic">No skills assessed yet. Please complete self-assessment.</p>
                )}
            </div>

            {/* 3. Skill Gap Analysis & 4. Quiz Results Row */}
            <div className="report-grid">
                <div className="report-card p-8">
                    <SectionHeader icon={AlertTriangle} title="Skill Gap Analysis" />
                    {gaps.length > 0 ? (
                        <div className="space-y-4">
                            {gaps.map((gap, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-slate-900 dark:bg-slate-100 rounded-full" />
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{gap.skill}</span>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                                        {gap.priority} Priority
                                    </span>
                                </div>
                            ))}
                            <p className="text-sm text-slate-500 dark:text-slate-400 pt-2 italic">These competencies need your focus right now.</p>
                        </div>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 italic">No skill gaps identified yet.</p>
                    )}
                </div>

                <div className="report-card p-8">
                    <SectionHeader icon={Award} title="Quiz Results" />
                    {quizzes.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex-1 text-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest mb-1">Avg Score</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{reportData?.averageQuizScore || 0}%</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex-1 text-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest mb-1">Taken Today</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{reportData?.quizAttemptsToday || 0}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Recent Quizzes</p>
                                {quizzes.slice(0, 3).map((q, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{q.skill?.name || 'General Assessment'}</span>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{q.score}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 italic">No quizzes taken recently.</p>
                    )}
                </div>
            </div>

            {/* 5. AI Feedback */}
            <div className="bg-slate-900 p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <BrainCircuit className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-5 rotate-12" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <BrainCircuit className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">AI Feedback</h2>
                    </div>
                    <div className="space-y-4 text-slate-300 leading-relaxed text-sm md:text-base pr-8">
                        <p>
                            Based on your goal to become a {activeRoadmap?.role?.title || 'Professional'} and your current progress of {reportData?.overallProgress || 0}%, you are making consistent strides.
                        </p>
                        <p>
                            Your recent quiz performance indicates {reportData?.averageQuizScore > 75 ? 'strong comprehension of core concepts' : 'that fundamental review is necessary before proceeding to advanced modules'}. We recommend focusing your immediate attention on {gaps[0]?.skill || 'foundational skills'} to bridge the primary knowledge gap.
                        </p>
                        <p>
                            Maintain your current learning routine and ensure all daily module tasks are fully completed for optimal trajectory.
                        </p>
                    </div>
                </div>
            </div>

            {/* 6. Learning Roadmap */}
            <div className="report-card p-8">
                <SectionHeader icon={Calendar} title="Learning Roadmap" />
                {activeRoadmap ? (
                    <div className="space-y-6">
                        {activeRoadmap.roadmap.map((phase, idx) => (
                            <div key={idx} className="relative pl-6 pb-6 border-l-2 border-slate-100 dark:border-slate-800 last:border-transparent last:pb-0">
                                <div className="absolute left-[-9px] top-0 w-4 h-4 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-full" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 -mt-1">{phase.skill}</h3>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">{phase.duration || '2 weeks'}</p>

                            <div
                                className="grid gap-3"
                                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
                            >
                                    {phase.modules.map((m, midx) => (
                                        <div key={midx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                                            {m.completed ? (
                                                <CheckCircle2 className="w-5 h-5 text-slate-900 dark:text-slate-100 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <div className="w-5 h-5 border-2 border-slate-300 rounded-full flex-shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                <p className={`text-sm font-bold ${m.completed ? 'text-slate-900 dark:text-slate-100 line-through opacity-70' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {m.title}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.description?.substring(0, 60)}...</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic">No roadmap available.</p>
                )}
            </div>

            {/* Footer Branding */}
            <div className="pt-10 flex flex-col items-center gap-2 opacity-40 grayscale pointer-events-none">
                <FileText className="w-10 h-10 text-slate-900 dark:text-slate-100" />
                <p className="text-sm font-black tracking-widest uppercase text-slate-900 dark:text-slate-100">Intelligent Academic Decision Engine</p>
                <div className="h-px w-20 bg-slate-400" />
            </div>
        </div>
    );
};

export default ReportPage;
