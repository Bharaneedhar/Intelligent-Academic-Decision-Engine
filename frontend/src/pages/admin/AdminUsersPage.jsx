import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, ArrowRight, Shield, BookOpen, Target, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AdminUsersPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/admin/users');
                setUsers(res.data);
            } catch (error) {
                console.error('Failed to fetch users', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u => {
        const name = u?.name || 'Unknown User';
        const email = u?.email || '';
        const term = searchTerm.toLowerCase();
        return name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500 mt-1">View all learners, their active roles, and academic progress.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search learners..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <Users className="w-5 h-5 text-slate-900" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Learner Directory</h2>
                </div>

                <div className="overflow-hidden">
                    <table className="w-full text-left border-collapse block md:table">
                        <thead className="hidden md:table-header-group">
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold block md:table-row">
                                <th className="p-4 pl-6">Learner</th>
                                <th className="p-4">Active Roles</th>
                                <th className="p-4">Progress</th>
                                <th className="p-4">Quizzes / Avg</th>
                                <th className="p-4 text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 block md:table-row-group">
                            {filteredUsers.length > 0 ? filteredUsers.map((u, idx) => {
                                const displayName = u?.name || 'Unknown User';
                                const firstLetter = displayName.charAt(0).toUpperCase();
                                return (
                                    <motion.tr
                                        key={u.id || u._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-slate-50 transition-colors group cursor-pointer block md:table-row p-4 md:p-0 border-b border-slate-200 md:border-none"
                                        onClick={() => navigate(`/admin/users/${u.id || u._id}`)}
                                    >
                                        <td className="block md:table-cell p-2 md:p-4 md:pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex flex-shrink-0 items-center justify-center font-bold text-slate-700">
                                                    {firstLetter}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{displayName}</p>
                                                    <p className="text-xs text-slate-500">{u.email || 'No email'}</p>
                                                    {u.academicProfile?.educationLevel && (
                                                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">🎓 {u.academicProfile.educationLevel} {u.academicProfile.fieldOfStudy ? `in ${u.academicProfile.fieldOfStudy}` : ''}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="block md:table-cell p-2 md:p-4">
                                            <div className="md:hidden text-xs font-bold text-slate-400 uppercase mb-1">Active Roles</div>
                                            <div className="flex flex-wrap gap-1">
                                                {u.roleAssessments && u.roleAssessments.length > 0 ? u.roleAssessments.map((ra, index) => (
                                                    <span key={index} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                                        {ra.roleId?.title || 'Role'} <span className="text-violet-600 font-black">★{ra.rating}</span>
                                                    </span>
                                                )) : u.roles?.map(r => (
                                                    <span key={r} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-bold text-slate-600">
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="block md:table-cell p-2 md:p-4">
                                            <div className="md:hidden text-xs font-bold text-slate-400 uppercase mb-1">Progress</div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 md:w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-slate-900 h-full rounded-full" style={{ width: `${u.overallProgress}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{u.overallProgress}%</span>
                                            </div>
                                        </td>
                                        <td className="block md:table-cell p-2 md:p-4">
                                            <div className="md:hidden text-xs font-bold text-slate-400 uppercase mb-1">Quizzes / Avg</div>
                                            <span className="text-sm font-bold text-slate-900">{u.quizzesTaken}</span>
                                            <span className="text-xs text-slate-500 mx-1">/</span>
                                            <span className="text-sm font-bold text-emerald-600">{u.avgScore}%</span>
                                        </td>
                                        <td className="block md:table-cell p-2 md:p-4 md:text-right md:pr-6 mt-2 md:mt-0">
                                            <button
                                                className="w-full md:w-auto justify-center px-4 py-3 md:py-2 bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white rounded-xl md:rounded-lg text-sm md:text-xs font-bold transition-all inline-flex items-center gap-2 text-slate-700 shadow-sm md:shadow-none"
                                            >
                                                Drill Down <ChevronRight className="w-4 h-4 md:w-3 md:h-3" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            }) : (
                                <tr className="block md:table-row">
                                    <td colSpan="5" className="p-8 text-center text-slate-500 italic block md:table-cell">
                                        No learners found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;
