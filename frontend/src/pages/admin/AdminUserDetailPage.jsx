import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Map, Target, TrendingUp, Award, AlertTriangle, BookOpen, BrainCircuit, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';

const AdminUserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get(`/admin/users/${id}`);
                setUser(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900">User not found</h2>
                <button onClick={() => navigate('/admin/users')} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg">Go Back</button>
            </div>
        );
    }

    const quizData = (user.quizHistory || [])
        .slice()
        .reverse()
        .map((q) => ({
            name: new Date(q.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: q.percent,
            moduleTitle: q.moduleTitle,
        }));

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
            <div className="p-2 bg-slate-100 rounded-lg">
                <Icon className="w-5 h-5 text-slate-900" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold shadow-md">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                        <p className="text-slate-500 font-medium mt-1">{user.email} &bull; Joined {new Date(user.joined).toLocaleDateString()}</p>
                        {user.academicProfile?.educationLevel && (
                            <p className="text-sm font-bold text-slate-700 mt-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-violet-600" /> 
                                {user.academicProfile.educationLevel} {user.academicProfile.fieldOfStudy ? `in ${user.academicProfile.fieldOfStudy}` : ''} {user.academicProfile.yearOfStudy ? `(${user.academicProfile.yearOfStudy})` : ''}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Overall Progress', value: `${user.overallProgress}%`, icon: TrendingUp },
                    { label: 'Quizzes Taken', value: user.quizzesTaken, icon: Award },
                    { label: 'Average Score', value: `${user.avgScore}%`, icon: Activity },
                    { label: 'Skill Gaps', value: user.skillGaps, icon: AlertTriangle },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <stat.icon className="w-6 h-6 text-slate-900" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Roles & Learning Roadmap */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <SectionHeader icon={Map} title="Active AI Roadmap" />
                        <div className="mb-6 flex flex-wrap gap-2">
                            {user.roleAssessments && user.roleAssessments.length > 0 ? user.roleAssessments.map((ra, index) => (
                                <div key={index} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
                                    {ra.roleId?.title || 'Role'} 
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs text-amber-300">★ {ra.rating}/5</span>
                                </div>
                            )) : user.roles.map(r => (
                                <span key={r} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-sm">
                                    {r}
                                </span>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-slate-900 text-white">
                                        1
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">Roadmap Progress</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {user.modulesCompleted ?? 0} completed out of {user.totalModules ?? 0} modules
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700">
                                    {user.overallProgress ?? 0}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Performance Chart */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <SectionHeader icon={Activity} title="Quiz Performance" />
                        <div className="h-64 w-full">
                            {quizData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={quizData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                    <Bar dataKey="score" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500 text-sm italic bg-slate-50 rounded-xl border border-slate-100">
                                    No quiz history yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Skill Ratings & Gaps */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <SectionHeader icon={Target} title="Skill Gaps" />
                        {user.skillGaps > 0 ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-slate-900">Critical Gap Identified</p>
                                        <p className="text-xs text-slate-600 mt-1">Learner is missing core competencies required for <strong>{user.roles && user.roles.length > 0 ? user.roles[0] : 'their selected role'}</strong>.</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 border-b border-slate-100">
                                    <span className="font-bold text-slate-700 text-sm">React State Management</span>
                                    <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">High Priority</span>
                                </div>
                                <div className="flex items-center justify-between p-3 border-b border-slate-100">
                                    <span className="font-bold text-slate-700 text-sm">Advanced API Integration</span>
                                    <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">Medium</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <p className="font-bold text-slate-900">No Critical Gaps</p>
                                <p className="text-xs text-slate-500 mt-1">Learner is maintaining standard progression.</p>
                            </div>
                        )}
                    </div>

                    {/* AI Full Profile Assessment */}
                    <div className="bg-slate-900 p-8 rounded-2xl shadow-lg relative overflow-hidden">
                        <BrainCircuit className="absolute -right-6 -bottom-6 w-40 h-40 text-white opacity-5 rotate-12" />
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5" /> AI Profile Analysis
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                {user.name} is demonstrating {user.overallProgress > 50 ? 'above-average' : 'baseline'} engagement. Quiz accuracy ({user.avgScore}%) indicates solid retention, but {user.skillGaps} identified skill gaps suggest theoretical knowledge over practical application.
                            </p>
                            <p className="text-sm font-bold text-white">Recommended Admin Action:</p>
                            <p className="text-sm text-slate-400 mt-1">Observe progress in next phase. No direct intervention required.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailPage;
