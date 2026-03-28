import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, CheckCircle, ArrowRight, BrainCircuit, Loader2, Map } from 'lucide-react';
import useRoadmapStore from '../store/roadmapStore';
import { useNavigate } from 'react-router-dom';

const SkillGapPage = () => {
    const { roadmaps, fetchRoadmaps, loading } = useRoadmapStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchRoadmaps();
    }, [fetchRoadmaps]);

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-slate-900 dark:text-white animate-spin" />
        </div>
    );

    const activeRoadmap = roadmaps[0];

    if (!activeRoadmap) return (
        <div className="flex flex-col items-center justify-center p-20 glass-card">
            <Map className="w-20 h-20 text-slate-300 mb-6" />
            <h2 className="text-2xl font-bold mb-2">No analysis data yet</h2>
            <p className="text-slate-500 mb-8 max-w-md text-center">We need to generate a roadmap first to analyze your skill gaps vs industry requirements.</p>
            <button
                onClick={() => navigate('/dashboard')}
                className="bg-black text-white dark:bg-white dark:text-black px-8 py-3 rounded-xl font-bold"
            >
                Generate First Roadmap
            </button>
        </div>
    );

    // Derive gap data from roadmap
    const gaps = activeRoadmap.roadmap.map(item => ({
        skill: item.skill,
        current: 0, // In a real scenario, this would come from user's actual profile
        target: 100,
        status: 'Critical',
        priority: 'High',
        reason: `Required for the ${activeRoadmap.role?.title} role.`
    }));

    return (
        <div className="space-y-10 animate-in zoom-in-95 duration-500">
            <div>
                <h1 className="text-3xl font-bold">Skill Gap Analysis</h1>
                <p className="text-slate-500 mt-2">AI-identified missing competencies for: <span className="text-slate-900 dark:text-white font-bold">{activeRoadmap.role?.title}</span></p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {gaps.map((gap, idx) => (
                        <motion.div
                            key={gap.skill}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card group"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold">{gap.skill}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                       ${gap.status === 'Critical' ? 'bg-red-100 text-red-600' :
                                                gap.status === 'Improving' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}
                    `}>
                                            {gap.status}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-slate-500 font-medium">Mastery Progress</span>
                                                <span className="font-bold">{gap.current}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${gap.current}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut' }}
                                                    className={`h-full rounded-full ${gap.status === 'Critical' ? 'bg-red-500' : gap.status === 'Improving' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 leading-relaxed italic border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                                            " {gap.reason} "
                                        </p>
                                    </div>
                                </div>

                                <div className="md:w-48 flex flex-col justify-center gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Priority</p>
                                        <p className={`font-bold ${gap.priority === 'High' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{gap.priority}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/roadmap')}
                                        className="flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold group-hover:bg-black dark:bg-white group-hover:text-white transition-all"
                                    >
                                        View Roadmap
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="space-y-8">
                    <div className="glass-card bg-black text-white dark:bg-white dark:text-black border-none relative overflow-hidden">
                        <BrainCircuit className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                        <h4 className="text-lg font-bold mb-4 relative z-10">AI Insight</h4>
                        <p className="text-sm text-slate-900 dark:text-white-light/90 leading-relaxed relative z-10">
                            Based on your goal to become a {activeRoadmap.role?.title}, you have {gaps.length} major skill gaps to address. We've prioritized them in your roadmap.
                        </p>
                    </div>

                    <div className="glass-card">
                        <h4 className="font-bold mb-6">Mastery Distribution</h4>
                        <div className="space-y-4">
                            {[
                                { label: 'Beginner', val: 100, color: 'bg-slate-400' },
                                { label: 'Intermediate', val: 0, color: 'bg-black dark:bg-white' },
                                { label: 'Advanced', val: 0, color: 'bg-emerald-500' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                    <div className="flex-1 text-sm font-medium">{item.label}</div>
                                    <div className="text-sm font-bold">{item.val}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillGapPage;
