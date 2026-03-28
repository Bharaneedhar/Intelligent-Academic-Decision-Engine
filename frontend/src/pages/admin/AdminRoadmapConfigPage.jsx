import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Loader2, Check, Save } from 'lucide-react';

const emptyWeek = () => ({ week: '', topic: '', description: '', resources: '' });

const AdminRoadmapConfigPage = () => {
    const [roles, setRoles] = useState([]);
    const [fallbackMaps, setFallbackMaps] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [weeks, setWeeks] = useState([emptyWeek()]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        Promise.all([
            api.get('/admin/roles').then(r => setRoles(r.data)),
            api.get('/admin/fallback-roadmaps').then(r => setFallbackMaps(r.data)),
        ]).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleRoleChange = (roleId) => {
        setSelectedRole(roleId);
        setSaved(false);
        const existing = fallbackMaps.find(f => f.role?._id === roleId);
        if (existing) {
            setWeeks(existing.weeks.map(w => ({ ...w, resources: (w.resources || []).join(', ') })));
        } else {
            setWeeks([emptyWeek()]);
        }
    };

    const addWeek = () => setWeeks(prev => [...prev, { ...emptyWeek(), week: prev.length + 1 }]);
    const removeWeek = (i) => setWeeks(prev => prev.filter((_, idx) => idx !== i));
    const updateWeek = (i, key, val) => setWeeks(prev => prev.map((w, idx) => idx === i ? { ...w, [key]: val } : w));

    const handleSave = async () => {
        if (!selectedRole) { alert('Please select a role first.'); return; }
        setSaving(true);
        try {
            const payload = {
                roleId: selectedRole,
                weeks: weeks.map((w, i) => ({
                    week: parseInt(w.week) || i + 1,
                    topic: w.topic,
                    description: w.description,
                    resources: w.resources ? w.resources.split(',').map(r => r.trim()).filter(Boolean) : [],
                })),
            };
            const res = await api.post('/admin/fallback-roadmaps', payload);
            // Update local list
            setFallbackMaps(prev => {
                const idx = prev.findIndex(f => f.role?._id === selectedRole);
                if (idx >= 0) { const next = [...prev]; next[idx] = res.data; return next; }
                return [...prev, res.data];
            });
            setSaved(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this fallback roadmap?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/admin/fallback-roadmaps/${id}`);
            setFallbackMaps(prev => prev.filter(f => f._id !== id));
            if (fallbackMaps.find(f => f._id === id)?.role?._id === selectedRole) {
                setWeeks([emptyWeek()]); setSaved(false);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
        } finally { setDeletingId(null); }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-slate-900 dark:text-slate-900 animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Fallback Roadmap Configuration</h1>
                <p className="text-slate-500 mt-1">Define week-by-week roadmaps used when AI generation fails</p>
            </div>

            {/* Existing fallback roadmaps */}
            {fallbackMaps.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Configured Fallbacks</h3>
                    {fallbackMaps.map(f => (
                        <div key={f._id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                            <div>
                                <p className="font-semibold text-slate-900 text-sm">{f.role?.title || 'Unknown Role'}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{f.weeks?.length || 0} weeks configured</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleRoleChange(f.role?._id)}
                                    className="px-3 py-1.5 bg-slate-700 hover:bg-black text-white text-slate-300 hover:text-slate-900 rounded-lg text-xs font-semibold transition-colors">Edit</button>
                                <button onClick={() => handleDelete(f._id)} disabled={deletingId === f._id}
                                    className="p-1.5 hover:bg-red-950/40 rounded-lg text-slate-500 hover:text-red-400 transition-colors">
                                    {deletingId === f._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="mb-6">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Select Role</label>
                    <select value={selectedRole} onChange={e => handleRoleChange(e.target.value)}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 w-full max-w-xs">
                        <option value="">-- Choose a role --</option>
                        {roles.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
                    </select>
                </div>

                <div className="space-y-4">
                    {weeks.map((w, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-white/60 border border-slate-200 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Week {i + 1}</span>
                                {weeks.length > 1 && (
                                    <button onClick={() => removeWeek(i)} className="p-1 hover:bg-red-950/40 rounded-lg text-slate-500 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input placeholder="Topic (e.g. Introduction to HTML)" value={w.topic} onChange={e => updateWeek(i, 'topic', e.target.value)}
                                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" />
                                <input placeholder="Resources (comma-separated URLs)" value={w.resources} onChange={e => updateWeek(i, 'resources', e.target.value)}
                                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" />
                                <textarea placeholder="Description" value={w.description} onChange={e => updateWeek(i, 'description', e.target.value)} rows={2}
                                    className="md:col-span-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 resize-none" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex items-center gap-3 mt-5">
                    <button onClick={addWeek}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-600 text-slate-500 hover:text-slate-900 hover:border-violet-600 rounded-xl text-sm font-semibold transition-colors">
                        <Plus className="w-4 h-4" /> Add Week
                    </button>
                    <button onClick={handleSave} disabled={!selectedRole || saving}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${!selectedRole || saving ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-black text-white hover:bg-slate-100 dark:bg-white0 text-slate-900'}`}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Roadmap'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminRoadmapConfigPage;
