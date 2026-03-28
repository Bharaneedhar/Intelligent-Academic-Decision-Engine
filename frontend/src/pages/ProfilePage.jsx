import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Camera, Settings, LogOut, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

const ProfilePage = () => {
    const { user, logout, updateUser } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [loadingPhoto, setLoadingPhoto] = useState(false);
    const [loadingName, setLoadingName] = useState(false);
    const fileInputRef = useRef(null);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setLoadingPhoto(true);
        try {
            const res = await api.post('/profile/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser({ profileImage: res.data.profileImage });
        } catch (err) {
            console.error('Failed to upload photo', err);
            alert('Failed to upload photo');
        } finally {
            setLoadingPhoto(false);
        }
    };

    const handleSaveName = async (e) => {
        e.preventDefault();
        if (name === user?.name) return;

        setLoadingName(true);
        try {
            const res = await api.put('/profile/update-name', { name });
            updateUser({ name: res.data.name });
            alert('Settings saved successfully!');
        } catch (err) {
            console.error('Failed to update name', err);
            alert('Failed to update name');
        } finally {
            setLoadingName(false);
        }
    };

    const avatarUrl = user?.profileImage
        ? `http://localhost:5000${user.profileImage}`
        : `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random&size=128`;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Account Profile</h1>
                    <p className="text-slate-500 mt-1">Manage your personal information and account settings.</p>
                </div>
                <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <div className="glass-card text-center flex flex-col items-center relative">
                        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary p-1 mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className={`w-full h-full rounded-[20px] border-4 border-white dark:border-slate-800 object-cover ${loadingPhoto ? 'opacity-50' : ''}`}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-[20px] m-1">
                                {loadingPhoto ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                            />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                        <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mt-1">
                            {user?.role === 'admin' ? 'Administrator' : 'Student'}
                        </p>
                    </div>

                    <div className="glass-card">
                        <h3 className="font-bold mb-4 text-sm text-slate-900 dark:text-white">Learning Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Joined</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{new Date(user?.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Roles Active</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{user?.selectedRoles?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="glass-card">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                            <Settings className="w-5 h-5 text-slate-900 dark:text-white" />
                            Personal Information
                        </h3>
                        <form className="space-y-6" onSubmit={handleSaveName}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-slate-900 dark:ring-white transition-all text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        disabled
                                        value={user?.email || ''}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none ring-1 ring-slate-200 dark:ring-slate-800 opacity-60 cursor-not-allowed text-slate-900 dark:text-slate-300"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 ml-1">Joined Date</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none ring-1 ring-slate-200 dark:ring-slate-800 opacity-60 cursor-not-allowed text-slate-900 dark:text-slate-300"
                                    />
                                </div>
                                <div className="hidden sm:block" />
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loadingName}
                                    className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold hover:bg-black dark:bg-white-dark transition-all flex items-center gap-2"
                                >
                                    {loadingName ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="glass-card">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                            <Shield className="w-5 h-5 text-secondary" />
                            Account Security
                        </h3>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Password</p>
                                <p className="text-xs text-slate-500 mt-1">Manage your secure password</p>
                            </div>
                            <button className="text-sm font-bold text-slate-900 dark:text-white hover:underline">Change Password</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
