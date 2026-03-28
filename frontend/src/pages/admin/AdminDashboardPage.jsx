import React, { useEffect, useState } from 'react';
import { Users, Activity, BarChart2, CheckCircle2, XCircle, Clock, Briefcase, ChevronRight, Target } from 'lucide-react';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-slate-900" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{value ?? '—'}</p>
        </div>
    </motion.div>
);

const AdminDashboardPage = () => {
    const [data, setData] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            api.get('/admin/analytics'),
            api.get('/admin/users'),
            api.get('/admin/dashboard'),
        ])
            .then(([analyticsRes, usersRes, dashboardRes]) => {
                setData({
                    ...analyticsRes.data,
                    ...dashboardRes.data,
                });
                const sortedUsers = usersRes.data.sort((a, b) => new Date(b.joined) - new Date(a.joined));
                setRecentUsers(sortedUsers.slice(0, 4));
            })
            .catch(err => setError(err.response?.data?.message || 'Failed to load dashboard data'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500 mt-1">System overview for LearnBuddyyy</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Users" value={data?.totalUsers} />
                <StatCard icon={Activity} label="Active Users" value={data?.activeUsers} />
                <StatCard icon={BarChart2} label="Courses In Progress" value={data?.coursesInProgress} />
                <StatCard icon={CheckCircle2} label="Modules Completed" value={data?.modulesCompleted} />
            </div>

            {/* Skill verification breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-slate-900" /> Skill Verification Stats
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Verified', value: data?.skillVerification?.verified, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Failed', value: data?.skillVerification?.failed, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
                            { label: 'Pending', value: data?.skillVerification?.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${bg}`}>
                                        <Icon className={`w-4 h-4 ${color}`} />
                                    </div>
                                    <span className="text-slate-600 text-sm font-medium">{label}</span>
                                </div>
                                <span className="font-bold text-sm text-slate-900">{value ?? 0}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-5 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-slate-900" /> Most Popular Roles</span>
                    </h3>
                    {data?.topRoles?.length > 0 ? (
                        <div className="space-y-3">
                            {data.topRoles.map((r, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shadow-sm">{i + 1}</span>
                                        <span className="text-slate-700 text-sm font-medium">{r.role}</span>
                                    </div>
                                    <span className="text-slate-900 font-bold text-sm bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{r.count} users</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm text-center py-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">No role data available yet.</p>
                    )}
                </div>

                {data?.systemSkillGap && data.systemSkillGap.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
                        <h3 className="font-bold text-slate-900 mb-5 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Target className="w-5 h-5 text-slate-900" /> Platform Skill Gaps</span>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Aggregated</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.systemSkillGap.map((gap, i) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col hover:border-slate-300 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-900">{gap.name}</h4>
                                        <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">{gap.userCount} users</span>
                                    </div>
                                    <div className="mt-auto pt-2">
                                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                                            <span>Avg Progress</span>
                                            <span className={gap.avgProgress < 50 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>{gap.avgProgress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${gap.avgProgress < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${gap.avgProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-900" /> Recent Learners
                        </h3>
                        <button onClick={() => navigate('/admin/users')} className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
                            View All <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentUsers.length > 0 ? recentUsers.map((user) => (
                            <div key={user.id} onClick={() => navigate(`/admin/users/${user.id}`)} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                                        {user.name ? user.name.charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 group-hover:text-black transition-colors">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.roles && user.roles.length > 0 ? user.roles[0] : 'Unassigned'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900">{user.overallProgress}%</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Progress</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 italic p-4">No recent learners found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
