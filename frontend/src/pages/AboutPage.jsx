import React from 'react';
import { motion } from 'framer-motion';
import { Info, Brain, Zap, Target, Globe, Github } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black">About LearnBuddyyy</h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                    Intelligent Academic Decision Engine - Empowering learners through AI-driven personalization.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold">Our Mission</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        LearnBuddyyy as born from the realization that modern learning paths are often overwhelming. With thousands of resources available, knowing *where to start* and *what to focus on* is the biggest hurdle for students today.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        We use advanced AI (Google Gemini) to analyze industry requirements and bridge your personal skill gaps with tailored, high-impact learning roadmaps.
                    </p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold uppercase tracking-widest">
                            <Brain className="w-4 h-4 text-slate-900 dark:text-white" />
                            AI Driven
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest">
                            <Target className="w-4 h-4" />
                            Personalized
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="aspect-square bg-gradient-to-tr from-primary to-secondary rounded-[40px] rotate-6 opacity-20 absolute inset-0 blur-3xl"></div>
                    <div className="relative glass-card aspect-square flex items-center justify-center border-4 border-white dark:border-slate-800 rotate-0 hover:rotate-2 transition-transform duration-500">
                        <Brain className="w-32 h-32 text-slate-900 dark:text-white animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                <h2 className="text-3xl font-bold text-center">Core Methodology</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[
                        { title: 'Data Analysis', desc: 'We scan thousands of job descriptions to understand what skills industry leads actually value.', icon: Globe },
                        { title: 'Gap Mapping', desc: 'Our AI compares your current profile against target roles to find high-priority gaps.', icon: Zap },
                        { title: 'Dynamic Learning', desc: 'Roadmaps adapt as you progress, ensuring you stay on the most efficient path.', icon: Target },
                    ].map((item, i) => (
                        <div key={i} className="glass-card hover:border-slate-900 dark:border-white/50 transition-all p-8 text-center group">
                            <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all">
                                <item.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card text-center p-12 space-y-6">
                <h2 className="text-2xl font-bold">Open Source & Community</h2>
                <p className="text-slate-500 max-w-xl mx-auto">
                    IADE is built with the latest MERN stack technologies and is open for community contributions.
                </p>
                <div className="pt-4">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 transition-all">
                        <Github className="w-5 h-5" />
                        View on GitHub
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
