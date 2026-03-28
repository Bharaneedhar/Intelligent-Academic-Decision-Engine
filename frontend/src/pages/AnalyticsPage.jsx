import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { Info, BarChart3, TrendingUp, Loader2, FileText } from 'lucide-react';
import api from '../utils/api';

const AnalyticsPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingReport, setDownloadingReport] = useState(false);
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/quizzes/history');
                setHistory(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

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

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-slate-900 dark:text-white animate-spin" />
        </div>
    );

    // Process mastery data from history
    const skillGroups = history.reduce((acc, curr) => {
        const skillName = curr.skill?.name || 'General';
        if (!acc[skillName]) acc[skillName] = { total: 0, count: 0 };
        acc[skillName].total += (curr.score / curr.totalQuestions) * 100;
        acc[skillName].count += 1;
        return acc;
    }, {});

    const masteryData = Object.keys(skillGroups).map(name => ({
        subject: name,
        level: Math.round(skillGroups[name].total / skillGroups[name].count)
    }));

    // Daily activity data (simplified for last 7 days)
    const learningData = [
        { name: 'Mon', hours: 2, modules: 3 },
        { name: 'Tue', hours: 4, modules: 5 },
        { name: 'Wed', hours: 1, modules: 2 },
        { name: 'Thu', hours: 5, modules: 6 },
        { name: 'Fri', hours: 3, modules: 4 },
        { name: 'Sat', hours: 0, modules: 0 },
        { name: 'Sun', hours: 0, modules: 0 },
    ];

    const avgRetention = history.length > 0
        ? Math.round(history.reduce((a, b) => a + (b.score / b.totalQuestions), 0) / history.length * 100)
        : 0;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Learning Analytics</h1>
                    <p className="text-slate-500 mt-1">Detailed breakdown of your academic progress and performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold p-3 rounded-xl text-slate-600 dark:text-slate-300 shadow-sm"
                    />
                    <button
                        onClick={handleDownloadReport}
                        disabled={downloadingReport}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {downloadingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5 text-slate-900 dark:text-white" />}
                        Download Daily Report
                    </button>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="glass-card p-20 text-center">
                    <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold">No data yet</h2>
                    <p className="text-slate-500">Take your first quiz in the Roadmap section to see your analytics.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-card">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-slate-900 dark:text-white" />
                                    Mocked Activity (Hours)
                                </h3>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={learningData}>
                                        <defs>
                                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: '1px solid rgba(148, 163, 184, 0.25)',
                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.18)',
                                                backgroundColor: document.documentElement.classList.contains('dark')
                                                    ? 'rgba(2, 6, 23, 0.92)'
                                                    : 'rgba(255,255,255,0.92)',
                                                color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
                                            }}
                                        />
                                        <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-secondary" />
                                    Real Skill Mastery Level (%)
                                </h3>
                                <Info className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={masteryData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                                        <XAxis type="number" hide domain={[0, 100]} />
                                        <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} width={80} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="level" fill="#0ea5e9" radius={[0, 10, 10, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card">
                        <h3 className="font-bold mb-8">AI Performance Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            {[
                                { label: 'Avg Mastery', val: `${avgRetention}%`, status: avgRetention > 70 ? 'Excellent' : 'Improving' },
                                { label: 'Quizzes Taken', val: history.length, status: 'Active' },
                                { label: 'Concept Clarity', val: avgRetention > 60 ? 'High' : 'Moderate', status: 'On Track' },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                                    <h4 className="text-3xl font-black mb-2">{item.val}</h4>
                                    <p className={`text-xs font-bold ${item.status === 'Requires Review' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{item.status}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsPage;
