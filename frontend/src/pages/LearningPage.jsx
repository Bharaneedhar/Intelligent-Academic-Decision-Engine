import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, Layout, Clock, CheckCircle2, Award, Sparkles, ArrowRight } from 'lucide-react';
import cleanAIText from '../utils/cleanAIText';

const LearningPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { topic, skillName, skillId, moduleTitle, courseId, weekId, moduleId } = location.state || {};

    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!topic || !skillName) {
            navigate('/dashboard');
            return;
        }

        const fetchContent = async () => {
            try {
                const res = await api.post('/learning/generate', { topic, skillName });
                setContent(res.data.content);
            } catch (err) {
                console.error("Failed to fetch learning content", err);
                setError("Unable to generate learning material at this moment. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [topic, skillName, navigate]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-700 border-t-primary rounded-full animate-spin"></div>
                <BookOpen className="absolute inset-0 m-auto w-8 h-8 text-slate-900 dark:text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">AI is Crafting Your Lesson...</h2>
            <p className="text-slate-500">Generating short and understandable material for: <span className="text-slate-900 dark:text-white font-medium">{topic}</span></p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-white transition-colors font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" /> Back
                    </button>
                    <div className="text-center">
                        <h1 className="font-bold text-lg line-clamp-1">{moduleTitle}</h1>
                        <p className="text-xs text-slate-500">{skillName} • {topic}</p>
                    </div>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 pt-12">
                {error ? (
                    <div className="glass-card text-center py-20">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Layout className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
                        <p className="text-slate-500 mb-8">{error}</p>
                        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
                    </div>
                ) : (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card !p-8 md:!p-12 mb-12 shadow-xl shadow-slate-200/50 dark:shadow-none prose dark:prose-invert max-w-none"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <span className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-full text-xs font-bold uppercase tracking-wider">Learning Module</span>
                                <span className="flex items-center gap-1.5 text-xs text-slate-400"><Clock className="w-3 h-3" /> 5-10 min read</span>
                            </div>

                            {/* Clean, readable text (sanitized from markdown symbols) */}
                            <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                                {content
                                    .split('\n')
                                    .map((line) => cleanAIText(line))
                                    .map((line, idx) => {
                                        if (line === '') return <div key={idx} className="h-4" />;
                                        return <p key={idx} className="mb-4">{line}</p>;
                                    })}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-slate-100 dark:bg-slate-800 dark:bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-black text-white dark:bg-white dark:text-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-500/10">
                                <Award className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Ready to test your knowledge?</h3>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                You've completed the learning material. Take a quick quiz to earn progress points and update your analytics!
                            </p>
                            <button
                                onClick={() => navigate('/quiz', {
                                    state: {
                                        skillName,
                                        topics: [topic],
                                        skillId,
                                        moduleTitle,
                                        courseId,
                                        weekId,
                                        moduleId,
                                    }
                                })}
                                className="inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-10 py-4 rounded-2xl font-bold hover:bg-black dark:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-500/10"
                            >
                                Start Assessment <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </>
                )}
            </main>
        </div>
    );
};

export default LearningPage;
