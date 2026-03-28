import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, ChevronRight, Briefcase, Search, Sparkles, Plus, Lightbulb,
    GraduationCap, Building2, BookOpen, Trophy, Star
} from 'lucide-react';

const STEPS = ['Academic Profile', 'Select Roles', 'Rate Roles', 'Confirm'];

const ProfileSetupPage = () => {
    const [step, setStep] = useState(0);
    const [roles, setRoles] = useState([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [customRoleTitle, setCustomRoleTitle] = useState('');
    const [isCustomSelected, setIsCustomSelected] = useState(false);
    const [ratings, setRatings] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Academic profile fields
    const [educationLevel, setEducationLevel] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [institutionName, setInstitutionName] = useState('');
    const [yearOfStudy, setYearOfStudy] = useState('');
    const [achievements, setAchievements] = useState('');

    const { getMe } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        // Force light mode on setup page (pre-dashboard)
        document.documentElement.classList.remove('dark');
        const fetchRoles = async () => {
            try {
                const res = await api.get('/roles');
                setRoles(res.data);
            } catch (err) {
                console.error('Failed to fetch roles', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
    }, []);

    const toggleRole = (roleId) => {
        if (isCustomSelected) {
            alert('You cannot select predefined roles while a custom role is active. Deselect it first.');
            return;
        }
        if (selectedRoleIds.length >= 3 && !selectedRoleIds.includes(roleId)) {
            alert('You can select a maximum of 3 roles.');
            return;
        }
        setSelectedRoleIds(prev =>
            prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
        );
    };

    const handleAcademicNext = async () => {
        if (!educationLevel || !fieldOfStudy) {
            alert('Please fill in Education Level and Field of Study.');
            return;
        }
        try {
            await api.put('/profile/academic', { educationLevel, fieldOfStudy, institutionName, yearOfStudy, achievements });
        } catch (err) {
            console.error('Failed to save academic profile', err);
        }
        setStep(1);
    };

    const handleComplete = async () => {
        if (selectedRoleIds.length === 0 && (!isCustomSelected || !customRoleTitle)) return;
        setSubmitting(true);
        try {
            const roleAssessments = selectedRoleIds.map(id => ({
                roleId: id,
                rating: ratings[id] || 3
            }));

            await api.put('/profile/setup', {
                roleIds: selectedRoleIds,
                customRoleTitle: isCustomSelected ? customRoleTitle : null,
                roleAssessments,
                customRoleRating: isCustomSelected ? ratings['custom'] : null
            });
            await getMe();
            navigate('/skill-assessment');
        } catch (err) {
            console.error('Setup failed', err);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRoles = roles.filter(role =>
        role.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full text-sm font-bold mb-6"
                    >
                        <Sparkles className="w-4 h-4" /> Welcome to LearnBuddyyy
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-black dark:bg-white bg-clip-text text-transparent">
                        Set Up Your Profile
                    </h1>
                    <p className="text-slate-500 text-lg">Just a few steps to personalize your AI learning journey.</p>
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`flex items-center gap-2 text-sm font-semibold transition-colors ${i <= step ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? 'bg-violet-600 text-white' : i === step ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-900 dark:ring-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className="hidden sm:block">{s}</span>
                            </div>
                            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 max-w-[80px] transition-colors ${i < step ? 'bg-violet-400' : 'bg-slate-200'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 0: Academic Profile */}
                    {step === 0 && (
                        <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                                <GraduationCap className="w-6 h-6 text-slate-900 dark:text-white" /> Academic Background
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Degree (e.g., B.Tech, B.Sc) *</label>
                                    <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-800 dark:border-slate-200 focus:ring-2 focus:ring-slate-100 dark:ring-slate-800 text-slate-900 text-sm">
                                        <option value="">Select level</option>
                                        <option>High School</option>
                                        <option>Diploma</option>
                                        <option>Undergraduate</option>
                                        <option>Graduate</option>
                                        <option>PhD</option>
                                        <option>Self-taught</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Field of Study *</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="text" placeholder="e.g. Computer Science"
                                            value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-800 dark:border-slate-200 focus:ring-2 focus:ring-slate-100 dark:ring-slate-800 text-slate-900 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Institution Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="text" placeholder="e.g. MIT, BITS Pilani"
                                            value={institutionName} onChange={e => setInstitutionName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-800 dark:border-slate-200 focus:ring-2 focus:ring-slate-100 dark:ring-slate-800 text-slate-900 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Year of completion</label>
                                    <select
                                        value={yearOfStudy}
                                        onChange={e => setYearOfStudy(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-slate-900 text-sm"
                                    >
                                        <option value="">Select Year of Study</option>
                                        <option value="Year 1">Year 1</option>
                                        <option value="Year 2">Year 2</option>
                                        <option value="Year 3">Year 3</option>
                                        <option value="Year 4">Year 4</option>
                                        <option value="Year 5">Year 5</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1"><Trophy className="w-4 h-4 text-amber-500" /> Academic Achievements (optional)</label>
                                    <textarea placeholder="e.g. Dean's List, Hackathon winner, published paper..."
                                        value={achievements} onChange={e => setAchievements(e.target.value)} rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-800 dark:border-slate-200 focus:ring-2 focus:ring-slate-100 dark:ring-slate-800 text-slate-900 text-sm resize-none" />
                                </div>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row justify-end mt-8 gap-4">
                                <motion.button onClick={handleAcademicNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className="w-full sm:w-auto justify-center px-8 py-3.5 bg-black dark:bg-white text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-slate-500/10 hover:shadow-slate-500/20 transition-all min-h-[44px]">
                                    Next: Select Roles <ChevronRight className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Role Selection */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100 mb-6">
                                <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
                                    <div className="relative w-full md:w-96">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input type="text" placeholder="Search roles (e.g. Backend, Data Scientist...)"
                                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900 dark:ring-white transition-all shadow-sm" />
                                    </div>
                                    <div className="text-sm font-medium text-slate-500">
                                        Selected: <span className="text-slate-900 dark:text-white font-bold">{selectedRoleIds.length}</span> / 3 roles
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <AnimatePresence>
                                        {filteredRoles.map((role) => (
                                            <motion.div key={role._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                                onClick={() => toggleRole(role._id)}
                                                className={`relative p-6 rounded-3xl cursor-pointer border-2 transition-all group ${selectedRoleIds.includes(role._id)
                                                    ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-900 shadow-md ring-1 ring-slate-200 dark:ring-slate-700'
                                                    : 'border-transparent bg-slate-100 hover:border-slate-300'}`}>
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${selectedRoleIds.includes(role._id) ? 'bg-violet-600 text-white' : 'bg-white text-slate-500 group-hover:text-slate-900 dark:text-white'}`}>
                                                    <Briefcase className="w-6 h-6" />
                                                </div>
                                                <h3 className="font-bold text-lg mb-1 text-slate-800">{role.title}</h3>
                                                <p className="text-xs text-slate-500 line-clamp-2">{role.description || 'Specialized career track with curated skills.'}</p>
                                                {selectedRoleIds.includes(role._id) && (
                                                    <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                                        <CheckCircle2 className="w-6 h-6 text-slate-900 dark:text-white" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                        {/* Custom role */}
                                        <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                            onClick={() => {
                                                if (!isCustomSelected && selectedRoleIds.length > 0) {
                                                    alert('You cannot add a custom role while predefined roles are selected. Deselect them first.');
                                                    return;
                                                }
                                                setIsCustomSelected(!isCustomSelected);
                                            }}
                                            className={`relative p-6 rounded-3xl cursor-pointer border-2 border-dashed transition-all group ${isCustomSelected ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-900' : 'border-slate-200 hover:border-slate-300 dark:border-slate-600'}`}>
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isCustomSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-slate-900 dark:text-white'}`}>
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-1 text-slate-800">Not in list?</h3>
                                            <p className="text-xs text-slate-500">Add a custom career path you want to pursue.</p>
                                            {isCustomSelected && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                                    className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                                                    <div className="relative">
                                                        <Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900 dark:text-white" />
                                                        <input type="text" placeholder="Enter role title..." value={customRoleTitle}
                                                            onChange={e => setCustomRoleTitle(e.target.value)}
                                                            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl outline-none ring-1 ring-violet-300 focus:ring-2 focus:ring-slate-900 dark:ring-white text-sm" />
                                                    </div>
                                                </motion.div>
                                            )}
                                            {isCustomSelected && <div className="absolute top-4 right-4"><CheckCircle2 className="w-6 h-6 text-slate-900 dark:text-white" /></div>}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4">
                                <button onClick={() => setStep(0)} className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 sm:bg-transparent rounded-2xl sm:rounded-none text-slate-600 hover:text-slate-900 dark:text-white font-semibold transition-colors min-h-[44px]">← Back</button>
                                <motion.button onClick={() => setStep(2)}
                                    disabled={(selectedRoleIds.length === 0 && !isCustomSelected) || (isCustomSelected && !customRoleTitle)}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className={`w-full sm:w-auto justify-center px-10 py-3.5 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all min-h-[44px] ${(selectedRoleIds.length === 0 && !isCustomSelected) || (isCustomSelected && !customRoleTitle)
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-black dark:bg-white text-white shadow-xl shadow-slate-500/10 hover:shadow-slate-500/20'}`}>
                                    Next: Rate Roles <ChevronRight className="w-6 h-6" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Rate Roles */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100 mb-6">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                                    <Star className="w-6 h-6 text-slate-900 dark:text-white" /> Rate Proficiency / Interest (1-5)
                                </h2>
                                <div className="space-y-6">
                                    {selectedRoleIds.map(roleId => {
                                        const role = roles.find(r => r._id === roleId);
                                        return (
                                            <div key={roleId} className="flex justify-between items-center p-4 border rounded-xl">
                                                <span className="font-semibold text-slate-900">{role?.title}</span>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(rating => (
                                                        <button
                                                            key={rating}
                                                            onClick={() => setRatings(prev => ({ ...prev, [roleId]: rating }))}
                                                            className={`w-10 h-10 rounded-full font-bold transition-all ${ratings[roleId] === rating ? 'bg-violet-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                        >
                                                            {rating}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isCustomSelected && customRoleTitle && (
                                        <div className="flex justify-between items-center p-4 border rounded-xl border-violet-200 bg-violet-50">
                                            <span className="font-semibold text-slate-900">{customRoleTitle} <span className="text-xs font-normal text-violet-500">(Custom)</span></span>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(rating => (
                                                    <button
                                                        key={rating}
                                                        onClick={() => setRatings(prev => ({ ...prev, custom: rating }))}
                                                        className={`w-10 h-10 rounded-full font-bold transition-all ${ratings['custom'] === rating ? 'bg-violet-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                    >
                                                        {rating}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8">
                                <button onClick={() => setStep(1)} className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 sm:bg-transparent rounded-2xl sm:rounded-none text-slate-600 hover:text-slate-900 dark:text-white font-semibold transition-colors min-h-[44px]">← Back</button>
                                <motion.button onClick={() => setStep(3)}
                                    disabled={submitting || (selectedRoleIds.some(id => !ratings[id])) || (isCustomSelected && customRoleTitle && !ratings['custom'])}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className={`w-full sm:w-auto justify-center px-10 py-3.5 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all min-h-[44px] ${submitting || (selectedRoleIds.some(id => !ratings[id])) || (isCustomSelected && customRoleTitle && !ratings['custom'])
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-black dark:bg-white text-white shadow-xl shadow-slate-500/10 hover:shadow-slate-500/20'}`}>
                                    Next: Confirm <ChevronRight className="w-6 h-6" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100 mb-6 text-center">
                                <h2 className="text-2xl font-bold mb-4 text-slate-800">
                                    Ready to Begin Your Journey?
                                </h2>
                                <p className="text-slate-600 mb-6">
                                    We will now generate personalized learning roadmaps based on your selection and background. This might take a few moments.
                                </p>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8">
                                <button onClick={() => setStep(2)} className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 sm:bg-transparent rounded-2xl sm:rounded-none text-slate-600 hover:text-slate-900 dark:text-white font-semibold transition-colors min-h-[44px]">← Back</button>
                                <motion.button onClick={handleComplete}
                                    disabled={submitting}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className={`w-full sm:w-auto justify-center px-10 py-3.5 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all min-h-[44px] ${submitting
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-black dark:bg-white text-white shadow-xl shadow-slate-500/10 hover:shadow-slate-500/20'}`}>
                                    {submitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Generating...</>)
                                        : (<>Begin My Journey <ChevronRight className="w-6 h-6" /></>)}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProfileSetupPage;
