import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login({ email, password });
        if (success) navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md glass-card"
            >
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                    <p className="text-slate-500">Enter your details to access your dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-slate-900 dark:ring-white outline-none transition-all"
                                placeholder="name@example.com"
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

                    <div className="flex items-center justify-between text-sm px-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-slate-900 dark:text-white focus:ring-slate-900 dark:ring-white" />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" title="Forgot password link" className="text-slate-900 dark:text-white hover:underline">Forgot password?</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black dark:bg-white hover:bg-black dark:bg-white-dark text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-slate-500 text-sm">
                        Don't have an account? <Link to="/register" className="text-slate-900 dark:text-white font-semibold hover:underline">Sign up</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
