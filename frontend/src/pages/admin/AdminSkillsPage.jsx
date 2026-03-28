import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2, BookOpen, Check } from 'lucide-react';

const AdminSkillsPage = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', category: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchSkills = async () => {
        try {
            const res = await api.get('/admin/skills');
            setSkills(res.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchSkills(); }, []);

    const openCreate = () => { setEditing(null); setForm({ name: '', category: '', description: '' }); setShowModal(true); };
    const openEdit = (skill) => { setEditing(skill); setForm({ name: skill.name, category: skill.category || '', description: skill.description || '' }); setShowModal(true); };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            if (editing) await api.put(`/admin/skills/${editing._id}`, form);
            else await api.post('/admin/skills', form);
            await fetchSkills();
            setShowModal(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this skill?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/admin/skills/${id}`);
            setSkills(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
        } finally { setDeletingId(null); }
    };

    const categories = [...new Set(skills.map(s => s.category).filter(Boolean))];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Skill Management</h1>
                    <p className="text-slate-500 mt-1">Manage the global skills database</p>
                </div>
                <motion.button onClick={openCreate} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white hover:bg-slate-100 dark:bg-white0 text-slate-900 font-semibold rounded-xl transition-colors text-sm">
                    <Plus className="w-4 h-4" /> Add Skill
                </motion.button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-slate-900 dark:text-slate-900 animate-spin" /></div>
            ) : (
                <div>
                    {categories.map(cat => (
                        <div key={cat} className="mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">{cat}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {skills.filter(s => s.category === cat).map(skill => (
                                    <SkillCard key={skill._id} skill={skill} onEdit={openEdit} onDelete={handleDelete} deletingId={deletingId} />
                                ))}
                            </div>
                        </div>
                    ))}
                    {skills.filter(s => !s.category).length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Uncategorized</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {skills.filter(s => !s.category).map(skill => (
                                    <SkillCard key={skill._id} skill={skill} onEdit={openEdit} onDelete={handleDelete} deletingId={deletingId} />
                                ))}
                            </div>
                        </div>
                    )}
                    {skills.length === 0 && (
                        <p className="text-center text-slate-500 py-20">No skills yet. Click "Add Skill" to start.</p>
                    )}
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="relative bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 p-1.5 hover:bg-slate-50 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
                            <h2 className="text-xl font-bold text-slate-900 mb-6">{editing ? 'Edit Skill' : 'New Skill'}</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Skill Name *</label>
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="e.g. JavaScript" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
                                    <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" placeholder="e.g. Frontend, Backend, Data Science" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Description</label>
                                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 resize-none" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={!form.name.trim() || saving}
                                    className="flex-1 py-2.5 bg-black text-white hover:bg-slate-100 dark:bg-white0 disabled:opacity-50 text-slate-900 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {saving ? 'Saving...' : 'Save Skill'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SkillCard = ({ skill, onEdit, onDelete, deletingId }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between group hover:border-slate-900 transition-all">
        <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-slate-600" />
            </div>
            <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{skill.name}</p>
                {skill.description && <p className="text-xs text-slate-500 truncate mt-0.5">{skill.description}</p>}
            </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
            <button onClick={() => onEdit(skill)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={() => onDelete(skill._id)} disabled={deletingId === skill._id} className="p-1.5 hover:bg-red-950/40 rounded-lg text-slate-500 hover:text-red-400 transition-colors">
                {deletingId === skill._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
        </div>
    </motion.div>
);

export default AdminSkillsPage;
