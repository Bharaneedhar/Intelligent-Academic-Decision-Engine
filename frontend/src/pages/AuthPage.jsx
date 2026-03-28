import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useSessionStore from '../store/sessionStore';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, register, error, loading, user } = useAuthStore();
    const navigate = useNavigate();

    // Force light mode on this page always
    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let success;
        if (mode === 'login') {
            success = await login({ email, password });
        } else {
            success = await register({ name, email, password });
        }
        if (success) {
            // Start the learning session timer
            useSessionStore.getState().startSessionTimer();
            // Route admin users to /admin, regular users to /dashboard
            const currentUser = useAuthStore.getState().user;
            if (currentUser?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }
    };

    const switchMode = (next) => {
        setMode(next);
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                {/* Brand header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30 mb-4">
                        <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">LearnBuddyyy</h1>
                    <p className="text-gray-500 text-sm mt-1">AI-powered personalized learning paths</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 border border-gray-100 overflow-hidden">
                    {/* Tab toggle */}
                    <div className="flex border-b border-gray-100">
                        {['login', 'register'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => switchMode(tab)}
                                className={`flex-1 py-4 text-sm font-bold transition-all duration-200 ${mode === tab
                                    ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {/* Error message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence>
                                {mode === 'register' && (
                                    <motion.div
                                        key="name-field"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                id="auth-name"
                                                type="text"
                                                required={mode === 'register'}
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-slate-900 dark:border-white focus:ring-2 focus:ring-slate-900 dark:ring-white/20 transition-all text-sm"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        id="auth-email"
                                        type="email"
                                        required
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-slate-900 dark:border-white focus:ring-2 focus:ring-slate-900 dark:ring-white/20 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        id="auth-password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-slate-900 dark:border-white focus:ring-2 focus:ring-slate-900 dark:ring-white/20 transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full py-3.5 bg-black dark:bg-white hover:bg-black dark:bg-white-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {mode === 'register' && (
                            <p className="text-center text-gray-400 text-xs mt-5">
                                By creating an account you agree to our Terms of Service and Privacy Policy.
                            </p>
                        )}
                    </div>
                </div>

                <p className="text-center text-gray-400 text-xs mt-6">
                    LearnBuddyyy — Build your career with AI-powered learning
                </p>
            </motion.div>
        </div>
    );
};

export default AuthPage;
