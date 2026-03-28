import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Filter, Play, Clock, Star, Loader2, Award, CheckCircle2 } from 'lucide-react';
import useRoadmapStore from '../store/roadmapStore';
import useProgressStore from '../store/progressStore';
import { useNavigate } from 'react-router-dom';

const CoursesPage = () => {
    const { roadmaps, fetchRoadmaps } = useRoadmapStore();
    const isModuleCompleted = useProgressStore(state => state.isModuleCompleted);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            await fetchRoadmaps();
            setLoading(false);
        };
        load();
    }, [fetchRoadmaps]);

    // Extract all modules from all roadmaps
    const allModules = [];
    roadmaps.forEach((r, rIdx) => {
        r.roadmap.forEach((phase, pIdx) => {
            phase.modules.forEach((m, mIdx) => {
                const moduleId = m._id || `${pIdx}-${mIdx}`;
                allModules.push({
                    ...m,
                    skillName: phase.skill,
                    roleTitle: r.role?.title,
                    roleId: r.role?._id || r.role,
                    moduleId,
                    weekId: m.week,
                });
            });
        });
    });

    const filteredModules = allModules.filter(m =>
        m.topics?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.skillName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-slate-900 dark:text-white animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold">Your Learning Modules</h1>
                    <p className="text-slate-500 mt-1">Direct access to curriculum from your active career paths.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 dark:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search topics or skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-slate-900 dark:ring-white w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            {filteredModules.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredModules.map((module, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="glass-card !p-0 overflow-hidden group border-none ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm"
                        >
                            <div className={`h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative flex items-center justify-center`}>
                                <div className="absolute inset-0 bg-black/5"></div>
                                <div className="w-12 h-12 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-black dark:bg-white/80 transition-all">
                                    <BookOpen className="w-6 h-6 text-slate-900 dark:text-slate-900 group-hover:text-white group-hover:dark:text-white" />
                                </div>
                                <span className="absolute top-4 left-4 px-3 py-1 bg-white/40 backdrop-blur-lg rounded-full text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-widest">
                                    {module.skillName}
                                </span>
                                {isModuleCompleted(module.roleId, module.weekId, module.moduleId) && (
                                    <span className="absolute top-4 right-4 p-1.5 bg-emerald-500 rounded-full text-white shadow-lg">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </span>
                                )}
                            </div>
                            <div className="p-6">
                                <p className="text-[10px] font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Week {module.week} • {module.roleTitle}</p>
                                <h3 className="text-lg font-bold mb-4 group-hover:text-slate-900 dark:text-white transition-colors line-clamp-2 min-h-[3.5rem]">
                                    {module.topics?.[0] || 'Module Overview'}
                                </h3>

                                <button
                                    onClick={() => navigate('/learning', {
                                        state: {
                                            topic: module.topics?.[0],
                                            skillName: module.skillName,
                                            skillId: module.roleId,
                                            moduleTitle: `Week ${module.week}: ${module.topics?.[0] || 'Overview'}`,
                                            courseId: module.roleId,
                                            weekId: module.weekId,
                                            moduleId: module.moduleId,
                                        }
                                    })}
                                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-100 text-slate-900 dark:text-slate-100 hover:text-white dark:hover:text-slate-900 transition-all text-sm font-bold rounded-xl flex items-center justify-center gap-2"
                                >
                                    {module.completed ? 'Review Material' : 'Start Learning'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center glass-card border-dashed">
                    <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">No modules found</h3>
                    <p className="text-slate-500">Go to your roadmap and start a career path to see modules here.</p>
                </div>
            )}
        </div>
    );
};

export default CoursesPage;
