import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Star, ChevronRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

const StarRating = ({ value, onChange }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => onChange(n)}
                className={`transition-colors ${n <= value ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}>
                <Star className="w-5 h-5 fill-current" />
            </button>
        ))}
    </div>
);

const LEVEL_LABELS = { 1: 'Novice', 2: 'Beginner', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' };
const LEVEL_COLORS = { 1: 'bg-red-100 text-red-600', 2: 'bg-orange-100 text-orange-600', 3: 'bg-yellow-100 text-yellow-700', 4: 'bg-blue-100 text-blue-700', 5: 'bg-emerald-100 text-emerald-700' };

const SkillAssessmentPage = () => {
    const [allSkills, setAllSkills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]); // { skill: {_id, name}, rating }
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.classList.remove('dark');
        api.get('/skills').then(res => setAllSkills(res.data)).catch(console.error);
    }, []);

    const filteredSkills = allSkills.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedSkills.find(sel => sel.skill._id === s._id)
    );

    const addSkill = (skill) => {
        setSelectedSkills(prev => [...prev, { skill, rating: 3 }]);
        setSearchTerm('');
    };

    const removeSkill = (skillId) => {
        setSelectedSkills(prev => prev.filter(s => s.skill._id !== skillId));
    };

    const updateRating = (skillId, rating) => {
        setSelectedSkills(prev => prev.map(s => s.skill._id === skillId ? { ...s, rating } : s));
    };

    const handleSkipOrContinue = async () => {
        if (selectedSkills.length === 0) {
            navigate('/dashboard');
            return;
        }
        setSaving(true);
        try {
            // Save all selected skills with ratings
            await Promise.all(selectedSkills.map(({ skill, rating }) =>
                api.post('/skills/assess', { skillId: skill._id, selfRating: rating })
            ));
            // Navigate to verification
            navigate('/skill-verification', { state: { skills: selectedSkills } });
        } catch (err) {
            console.error('Failed to save skills', err);
            alert('Failed to save skills. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full text-sm font-bold mb-6">
                        <Sparkles className="w-4 h-4" /> Step 2 — Skill Self Assessment
                    </motion.div>
                    <h1 className="text-4xl font-extrabold mb-3 bg-black dark:bg-white bg-clip-text text-transparent">
                        Rate Your Skills
                    </h1>
                    <p className="text-slate-500 text-lg">Add skills you already know and rate your proficiency (1–5).</p>
                    <p className="text-slate-400 text-sm mt-2">AI will verify your ratings with a short quiz.</p>
                </div>

                {/* Skill search */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 mb-6">
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search skills (e.g. JavaScript, Python, SQL...)"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-800 dark:border-slate-200 focus:ring-2 focus:ring-slate-100 dark:ring-slate-800 text-slate-900 text-sm"
                        />
                    </div>
                    {/* Dropdown results */}
                    <AnimatePresence>
                        {searchTerm.length > 0 && filteredSkills.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                {filteredSkills.slice(0, 8).map(skill => (
                                    <button key={skill._id} onClick={() => addSkill(skill)}
                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-100 dark:bg-slate-900 transition-colors text-left border-b border-slate-100 last:border-0">
                                        <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                                        {skill.category && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{skill.category}</span>}
                                        <Plus className="w-4 h-4 text-slate-900 dark:text-white ml-2 flex-shrink-0" />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                        {searchTerm.length > 0 && filteredSkills.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-3">No matching skills found. Try a different search.</p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Selected skills with ratings */}
                {selectedSkills.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 mb-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-slate-900 dark:text-white" /> Your Skills ({selectedSkills.length})
                        </h3>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {selectedSkills.map(({ skill, rating }) => (
                                    <motion.div key={skill._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-900 dark:text-white font-bold text-sm flex-shrink-0">
                                                {skill.name[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-800 text-sm">{skill.name}</p>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[rating]}`}>
                                                    {LEVEL_LABELS[rating]}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <StarRating value={rating} onChange={(r) => updateRating(skill._id, r)} />
                                            <button onClick={() => removeSkill(skill._id)}
                                                className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-700 font-semibold text-sm transition-colors px-4 py-2">
                        Skip for now →
                    </button>
                    <motion.button onClick={handleSkipOrContinue} disabled={saving}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className={`px-10 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all ${selectedSkills.length === 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-black dark:bg-white text-white shadow-slate-500/10 hover:shadow-slate-500/20'}`}>
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        {saving ? 'Saving...' : `Verify with AI (${selectedSkills.length} skill${selectedSkills.length !== 1 ? 's' : ''})`}
                        {!saving && <ChevronRight className="w-5 h-5" />}
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default SkillAssessmentPage;
