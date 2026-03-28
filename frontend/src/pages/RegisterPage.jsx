import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, User, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, error, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register({ name, email, password });
        if (success) navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg glass-card"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-slate-900 dark:text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                    <p className="text-slate-500">Join 10,000+ students optimizing their learning</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-slate-900 dark:ring-white outline-none transition-all"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-slate-900 dark:ring-white outline-none transition-all"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-slate-900 dark:ring-white outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2 text-xs text-slate-500 px-1">
                        By creating an account, you agree to our <Link to="/terms" title="Terms link" className="text-slate-900 dark:text-white hover:underline">Terms of Service</Link> and <Link to="/privacy" title="Privacy link" className="text-slate-900 dark:text-white hover:underline">Privacy Policy</Link>.
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black dark:bg-white hover:bg-black dark:bg-white-dark text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Already have an account? <Link to="/login" className="text-slate-900 dark:text-white font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
