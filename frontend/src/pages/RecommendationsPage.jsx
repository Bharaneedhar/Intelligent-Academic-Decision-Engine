import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Briefcase, BookOpen, Flame, Lightbulb, Award, RefreshCw, BriefcaseBusiness, ExternalLink } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { fetchJobs } from '../services/jobService';

const LiveJobsCard = ({ jobs, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-none ring-1 ring-slate-200 dark:ring-slate-800 lg:col-span-3 mt-6"
    >
        <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <BriefcaseBusiness className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-lg font-bold">Live Remote Jobs</h2>
                <p className="text-xs text-slate-500">Real-time matching from global job boards</p>
            </div>
            {loading && <div className="ml-auto animate-spin w-4 h-4 border-2 border-slate-300 border-t-slate-800 rounded-full" />}
        </div>
        
        {jobs && jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                {jobs.map((job) => (
                    <a 
                        key={job.id} 
                        href={job.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex flex-col justify-between group h-full"
                    >
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">{job.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                {job.company_name}
                            </p>
                            <div className="flex gap-2 mt-3 flex-wrap">
                                <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded uppercase font-bold tracking-wider">{job.job_type || 'Remote'}</span>
                                {job.category && <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded uppercase font-bold tracking-wider">{job.category}</span>}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                            <span>{new Date(job.publication_date).toLocaleDateString()}</span>
                            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                        </div>
                    </a>
                ))}
            </div>
        ) : (
            <p className="text-sm text-slate-400 italic mt-4">{loading ? 'Searching for live jobs...' : 'No active live job suggestions at this moment.'}</p>
        )}
    </motion.div>
);

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
    
    // Live Jobs State
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);

    const fetchRecommendations = async (forceRefresh = false) => {
        if (!user?._id) return;
        try {
            setLoading(!data || forceRefresh);
            setRefreshing(!!data && forceRefresh);
            setError(null);

            const res = await api.get(`/recommendations/${user._id}`);
            setData(res.data);
            
            // Try fetching live remote jobs via external API
            setJobsLoading(true);
            try {
                const liveJobs = await fetchJobs(res.data?.role);
                setJobs(liveJobs);
            } catch (je) {
                console.error('Job fetch error', je);
                setJobs([]);
            } finally {
                setJobsLoading(false);
            }
            
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
                
                {/* Dynamic Jobs Section */}
                <LiveJobsCard jobs={jobs} loading={jobsLoading} />
            </div>
        </div>
    );
};

export default RecommendationsPage;

