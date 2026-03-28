import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Briefcase, BookOpen, Flame, Lightbulb, Award, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const SectionCard = ({ title, icon: Icon, items, emptyText }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-none ring-1 ring-slate-200 dark:ring-slate-800"
    >
        <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center">
                <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">{title}</h2>
        </div>
        {items && items.length > 0 ? (
            <ul className="space-y-3">
                {items.map((item, idx) => (
                    <li
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-300"
                    >
                        {item}
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-sm text-slate-400 italic">{emptyText}</p>
        )}
    </motion.div>
);

const RecommendationsPage = () => {
    const user = useAuthStore(state => state.user);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRecommendations = async (forceRefresh = false) => {
        if (!user?._id) return;
        try {
            setLoading(!data || forceRefresh);
            setRefreshing(!!data && forceRefresh);
            setError(null);

            const res = await api.get(`/recommendations/${user._id}`);
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch recommendations', err);
            setError('Unable to load recommendations right now. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRecommendations(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id]);

    if (loading && !data) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
                    <Sparkles className="w-6 h-6 text-slate-900 dark:text-white absolute inset-0 m-auto" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Asking the AI mentor...</p>
                    <p className="text-xs text-slate-500 mt-1">Generating personalized opportunities based on your role and progress.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <p className="text-sm text-red-500">{error}</p>
                <button
                    onClick={() => fetchRecommendations(true)}
                    className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm font-bold"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-3">
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Suggestions
                    </div>
                    <h1 className="text-3xl font-bold">Your Learning Recommendations</h1>
                    <p className="text-slate-500 mt-1">
                        Curated internships, certifications, technologies, courses, and project ideas for your journey
                        {data?.role ? ` as a ${data.role}` : ''}.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-xs text-slate-400">
                        <p className="font-semibold uppercase tracking-widest">Last Updated</p>
                        <p>
                            {data?.updatedAt
                                ? new Date(data.updatedAt).toLocaleString()
                                : 'Just now'}
                        </p>
                    </div>
                    <button
                        onClick={() => fetchRecommendations(true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:border-slate-900 dark:hover:border-white transition-all disabled:opacity-60"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SectionCard
                    title="Internships"
                    icon={Briefcase}
                    items={data?.internships || []}
                    emptyText="No specific internship suggestions yet. Complete more modules to unlock tailored matches."
                />
                <SectionCard
                    title="Certifications"
                    icon={Award}
                    items={data?.certifications || []}
                    emptyText="No certifications recommended yet. As your skills grow, we’ll suggest relevant credentials."
                />
                <SectionCard
                    title="Trending Technologies"
                    icon={Flame}
                    items={data?.technologies || []}
                    emptyText="No tech picks yet. Keep learning and we’ll highlight tools aligned with your role."
                />
                <SectionCard
                    title="Courses"
                    icon={BookOpen}
                    items={data?.courses || []}
                    emptyText="No course suggestions yet. Once your roadmap is active, we’ll map courses to your gaps."
                />
                <SectionCard
                    title="Project Ideas"
                    icon={Lightbulb}
                    items={data?.projectIdeas || []}
                    emptyText="No project ideas yet. Finish a few modules and we’ll propose hands-on projects."
                />
            </div>
        </div>
    );
};

export default RecommendationsPage;
