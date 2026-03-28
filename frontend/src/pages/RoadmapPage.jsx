import React, { useEffect, useState } from 'react';
import useRoadmapStore from '../store/roadmapStore';
import useProgressStore from '../store/progressStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, CheckCircle2, Clock, Map, ChevronDown } from 'lucide-react';

const RoadmapPage = () => {
    const { roadmaps, fetchRoadmaps, loading } = useRoadmapStore();
    const isModuleCompleted = useProgressStore(state => state.isModuleCompleted);
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showSelector, setShowSelector] = useState(false);

    useEffect(() => {
        fetchRoadmaps();
    }, [fetchRoadmaps]);

    // When roadmaps load or roleId in state changes, find the matching roadmap
    useEffect(() => {
        if (roadmaps.length === 0) return;
        const roleId = location.state?.roleId;
        if (roleId) {
            const idx = roadmaps.findIndex(r => {
                const rId = r.role?._id || r.role;
                return rId === roleId || rId?.toString() === roleId?.toString();
            });
            if (idx !== -1) setSelectedIndex(idx);
        }
    }, [roadmaps, location.state?.roleId]);

    const roadmap = roadmaps[selectedIndex] || roadmaps[0];

    // Helper to check if a module is unlocked based on DAG structure
    const isModuleUnlocked = (pIdx, mIdx) => {
        if (!roadmap || !roadmap.roadmap) return true;
        
        for (let i = 0; i <= pIdx; i++) {
            const phase = roadmap.roadmap[i];
            const maxMIdx = (i === pIdx) ? mIdx - 1 : phase.modules.length - 1;
            
            for (let j = 0; j <= maxMIdx; j++) {
                const prevModule = phase.modules[j];
                const prevCourseId = roadmap.role?._id || roadmap.role;
                const prevWeekId = prevModule.week;
                const prevModuleId = prevModule._id || `${i}-${j}`;
                
                const isPrevCompleted = prevModule.completed || isModuleCompleted(prevCourseId, prevWeekId, prevModuleId);
                
                if (!isPrevCompleted) {
                    return false;
                }
            }
        }
        return true;
    };

    if (loading) return <div className="p-10 text-center">Loading your roadmap...</div>;

    if (!roadmap) return (
        <div className="flex flex-col items-center justify-center p-20 glass-card">
            <Map className="w-20 h-20 text-slate-300 mb-6" />
            <h2 className="text-2xl font-bold mb-2">No active roadmap found</h2>
            <p className="text-slate-500 mb-8">Select a role in the dashboard to generate your AI learning path.</p>
            <button onClick={() => navigate('/dashboard')} className="bg-black text-white dark:bg-white dark:text-black px-8 py-3 rounded-xl font-bold">Choose Role</button>
        </div>
    );

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 text-slate-900 dark:text-white mb-2">
                        <Calendar className="w-5 h-5" />
                        <span className="text-sm font-semibold uppercase tracking-wider">{roadmap.estimatedDurationWeeks} Weeks Program</span>
                    </div>
                    <h1 className="text-4xl font-bold">Your Personalized Roadmap</h1>
                    <p className="text-slate-500 mt-2">Target Role: {roadmap.role?.title || 'Selected Role'}</p>
                </div>

                {/* Role Switcher */}
                {roadmaps.length > 1 && (
                    <div className="relative">
                        <button
                            onClick={() => setShowSelector(!showSelector)}
                            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-slate-900 dark:ring-white transition-all font-medium text-sm"
                        >
                            <span className="text-slate-500">Viewing:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{roadmap.role?.title}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showSelector ? 'rotate-180' : ''}`} />
                        </button>
                        {showSelector && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 p-2 min-w-[240px] z-20"
                            >
                                {roadmaps.map((r, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setSelectedIndex(i); setShowSelector(false); }}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${i === selectedIndex
                                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        {r.role?.title || `Roadmap ${i + 1}`}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            <div className="relative">
                <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

                <div className="space-y-12">
                    {roadmap.noGap ? (
                        <div className="flex flex-col items-center justify-center p-20 glass-card text-center">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">You're Already an Expert!</h2>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                {roadmap.message || "You already possess all the required skills for this role. There's no gap to bridge—keep up the amazing work!"}
                            </p>
                            <button onClick={() => navigate('/dashboard')} className="bg-black text-white dark:bg-white dark:text-black px-8 py-3 rounded-xl font-bold">
                                Explore Other Roles
                            </button>
                        </div>
                    ) : roadmap.roadmap?.length > 0 ? (
                        roadmap.roadmap.map((phase, pIdx) => (
                            <motion.div
                                key={`${selectedIndex}-${pIdx}`}
                                className="relative pl-20"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: pIdx * 0.1 }}
                            >
                                <div className="absolute left-0 top-1 w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center z-10 shadow-lg">
                                    <span className="font-bold text-slate-900 dark:text-white">{pIdx + 1}</span>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <h3 className="text-2xl font-bold">{phase.skill || 'Learning Phase'}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {phase.durationWeeks || '?'} Weeks</span>
                                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">In Progress</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {phase.modules?.map((module, mIdx) => {
                                            const moduleId = module._id || `${pIdx}-${mIdx}`;
                                            const courseId = roadmap.role?._id || roadmap.role;
                                            const weekId = module.week;
                                            const isActualCompleted = module.completed || isModuleCompleted(courseId, weekId, moduleId);
                                            const isUnlocked = isModuleUnlocked(pIdx, mIdx);
                                            
                                            return (
                                                <motion.div
                                                    key={moduleId}
                                                    whileHover={isUnlocked ? { scale: 1.02 } : {}}
                                                    className={`glass-card !p-0 overflow-hidden group border-none ring-1 ring-slate-200 dark:ring-slate-800 ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}
                                                >
                                                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                                                        <span className="text-xs font-bold text-slate-400 uppercase">Week {module.week} {isActualCompleted ? '(Completed)' : !isUnlocked ? '(Locked)' : ''}</span>
                                                        {isActualCompleted ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                        ) : !isUnlocked ? (
                                                            <div className="w-5 h-5 flex items-center justify-center text-slate-400">🔒</div>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700" />
                                                        )}
                                                    </div>
                                                    <div className="p-6">
                                                        <h4 className="font-bold mb-3 group-hover:text-slate-900 dark:text-white transition-colors">Core Topics</h4>
                                                        <ul className="space-y-2 mb-6">
                                                            {module.topics?.map((topic, tIdx) => (
                                                                <li key={tIdx} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white/40"></div>
                                                                    {topic}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                                            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Practice Focus</p>
                                                            <p className="text-sm italic text-slate-500">{module.practiceFocus || 'Hands-on application'}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        disabled={!isUnlocked}
                                                        onClick={() => {
                                                            if (isUnlocked) {
                                                                navigate('/learning', {
                                                                    state: {
                                                                        topic: module.topics?.[0] || 'Overview',
                                                                        skillName: phase.skill,
                                                                        skillId: courseId,
                                                                        moduleTitle: `Week ${module.week}: ${module.topics?.[0] || 'Module Overview'}`,
                                                                        courseId,
                                                                        weekId,
                                                                        moduleId,
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                        className={`w-full py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${isUnlocked ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-100 text-slate-900 dark:text-slate-100 hover:text-white dark:hover:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                                                    >
                                                        {isUnlocked ? (
                                                            <>Start Learning <ChevronRight className="w-4 h-4" /></>
                                                        ) : (
                                                            <>Prerequisites incomplete</>
                                                        )}
                                                    </button>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-slate-500 italic">
                            The AI is still processing your detailed curriculum. Please refresh in a moment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoadmapPage;
