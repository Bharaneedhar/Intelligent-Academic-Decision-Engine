import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2, Briefcase, Check } from 'lucide-react';

const AdminRolesPage = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', category: '' });
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchRoles = async () => {
        try {
            const res = await api.get('/admin/roles');
            setRoles(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRoles(); }, []);

    const openCreate = () => { setEditing(null); setForm({ title: '', description: '', category: '' }); setShowModal(true); };
    const openEdit = (role) => { setEditing(role); setForm({ title: role.title, description: role.description || '', category: role.category || '' }); setShowModal(true); };

    const handleSave = async () => {
        if (!form.title) return;
        setSaving(true);
        try {
            if (editing) {
                await api.put(`/admin/roles/${editing._id}`, form);
            } else {
                await api.post('/admin/roles', form);
            }
            await fetchRoles();
            setShowModal(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this role?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/admin/roles/${id}`);
            setRoles(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Role Management</h1>
                    <p className="text-slate-500 mt-1">Create, edit, and delete career roles</p>
                </div>
                <motion.button onClick={openCreate} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white hover:bg-slate-100 dark:bg-white0 text-slate-900 font-semibold rounded-xl transition-colors text-sm">
                    <Plus className="w-4 h-4" /> New Role
                </motion.button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-slate-900 dark:text-slate-900 animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map(role => (
                        <motion.div key={role._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-slate-200 rounded-2xl p-5 group hover:border-slate-900 transition-all">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Briefcase className="w-5 h-5 text-slate-600" />
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(role)}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(role._id)} disabled={deletingId === role._id}
                                        className="p-1.5 hover:bg-red-950/40 rounded-lg text-slate-500 hover:text-red-400 transition-colors">
                                        {deletingId === role._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">{role.title}</h3>
                            {role.category && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{role.category}</span>}
                            {role.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{role.description}</p>}
                        </motion.div>
                    ))}
                    {roles.length === 0 && (
                        <p className="col-span-3 text-center text-slate-500 py-20">No roles yet. Click "New Role" to create one.</p>
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="relative bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 p-1.5 hover:bg-slate-50 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
                            <h2 className="text-xl font-bold text-slate-900 mb-6">{editing ? 'Edit Role' : 'New Role'}</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Role Title *</label>
                                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="e.g. Frontend Developer" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
                                    <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="e.g. Web Development" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Description</label>
                                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 resize-none" placeholder="Brief description of this role..." />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={!form.title || saving}
                                    className="flex-1 py-2.5 bg-black text-white hover:bg-slate-100 dark:bg-white0 disabled:opacity-50 text-slate-900 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {saving ? 'Saving...' : 'Save Role'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminRolesPage;
