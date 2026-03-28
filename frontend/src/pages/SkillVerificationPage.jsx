import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ChevronRight, Sparkles, Brain } from 'lucide-react';

const SkillVerificationPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const skills = state?.skills || [];

    const [currentSkillIdx, setCurrentSkillIdx] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({}); // { questionId: selectedAnswer }
    const [result, setResult] = useState(null);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [completedSkills, setCompletedSkills] = useState([]); // { skillName, validatedLevel, passed }

    const currentSkillData = skills[currentSkillIdx];

    useEffect(() => {
        document.documentElement.classList.remove('dark');
        if (currentSkillData) {
            loadQuiz(currentSkillData);
        }
    }, [currentSkillIdx]);

    const loadQuiz = async (skillData) => {
        setLoadingQuiz(true);
        setQuestions([]);
        setAnswers({});
        setResult(null);
        try {
            const res = await api.post('/skills/verify/generate', {
                skillId: skillData.skill._id,
                selfRating: skillData.rating,
            });
            setQuestions(res.data.questions || []);
        } catch (err) {
            console.error('Failed to load quiz', err);
            // Skip this skill on error
            handleNextSkill(null);
        } finally {
            setLoadingQuiz(false);
        }
    };

    const selectAnswer = (questionId, answer) => {
        if (result) return; // locked after submit
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        const answeredAll = questions.every(q => answers[q.id]);
        if (!answeredAll) { alert('Please answer all questions.'); return; }

        setSubmitting(true);
        try {
            const formattedAnswers = questions.map(q => ({ id: q.id, selectedAnswer: answers[q.id] }));
            const res = await api.post('/skills/verify/submit', {
                skillId: currentSkillData.skill._id,
                selfRating: currentSkillData.rating,
                answers: formattedAnswers,
                questions: questions.map(q => ({ id: q.id, correctAnswer: q.correctAnswer })),
            });
            setResult(res.data);
        } catch (err) {
            console.error('Submit failed', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleNextSkill = (resultData) => {
        if (resultData) {
            setCompletedSkills(prev => [...prev, {
                skillName: currentSkillData.skill.name,
                validatedLevel: resultData.validatedLevel,
                passed: resultData.passed,
            }]);
        }
        if (currentSkillIdx + 1 < skills.length) {
            setCurrentSkillIdx(i => i + 1);
        } else {
            navigate('/dashboard');
        }
    };

    if (!skills.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <p className="text-slate-500 mb-4">No skills to verify.</p>
                    <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold">Go to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] py-16 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full text-sm font-bold mb-4">
                        <Brain className="w-4 h-4" /> AI Skill Verification
                    </motion.div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Verify Your Skills</h1>
                    <p className="text-slate-500">Skill {currentSkillIdx + 1} of {skills.length}: <strong>{currentSkillData?.skill.name}</strong></p>

                    {/* Progress bar */}
                    <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden max-w-sm mx-auto">
                        <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${((currentSkillIdx) / skills.length) * 100}%` }} />
                    </div>
                </div>

                {/* Completed skills summary */}
                {completedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6 justify-center">
                        {completedSkills.map((s, i) => (
                            <span key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${s.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                {s.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                {s.skillName}: {s.validatedLevel}
                            </span>
                        ))}
                    </div>
                )}

                {/* Quiz card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
                    {loadingQuiz ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                <Sparkles className="w-7 h-7 text-slate-900 dark:text-white animate-pulse" />
                            </div>
                            <p className="text-slate-500 font-medium">Generating questions for <strong>{currentSkillData?.skill.name}</strong>...</p>
                            <Loader2 className="w-6 h-6 text-slate-900 dark:text-white animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {questions.map((q, qi) => (
                                <div key={q.id}>
                                    <p className="font-semibold text-slate-800 mb-3">
                                        <span className="text-slate-900 dark:text-white font-bold">Q{qi + 1}.</span> {q.question}
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {q.options.map((opt, oi) => {
                                            const isSelected = answers[q.id] === opt;
                                            const isCorrect = result && opt === q.correctAnswer;
                                            const isWrong = result && isSelected && opt !== q.correctAnswer;
                                            return (
                                                <button key={oi} onClick={() => selectAnswer(q.id, opt)}
                                                    className={`p-3.5 rounded-xl text-left text-sm font-medium border-2 transition-all ${isCorrect ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                                                        : isWrong ? 'border-red-400 bg-red-50 text-red-800'
                                                            : isSelected ? 'border-slate-800 dark:border-slate-200 bg-slate-100 dark:bg-slate-900 text-violet-900'
                                                                : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-600 text-slate-700'}`}>
                                                    <span className="font-bold mr-2 text-slate-400">
                                                        {String.fromCharCode(65 + oi)}.
                                                    </span>
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Result banner */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                        className={`p-5 rounded-2xl border-2 ${result.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            {result.passed
                                                ? <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                                : <XCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />}
                                            <p className={`font-bold ${result.passed ? 'text-emerald-700' : 'text-orange-700'}`}>
                                                Score: {result.score}% ({result.correct}/{result.total} correct)
                                            </p>
                                        </div>
                                        <p className="text-sm text-slate-600">{result.message}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action buttons */}
                            <div className="flex justify-between items-center">
                                {!result && (
                                    <motion.button onClick={handleSubmit} disabled={submitting || Object.keys(answers).length < questions.length}
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all ml-auto ${Object.keys(answers).length < questions.length || submitting
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            : 'bg-black dark:bg-white text-white shadow-lg shadow-slate-500/10'}`}>
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        {submitting ? 'Evaluating...' : 'Submit Answers'}
                                    </motion.button>
                                )}
                                {result && (
                                    <motion.button onClick={() => handleNextSkill(result)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        className="ml-auto px-8 py-3.5 bg-black dark:bg-white text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-slate-500/10">
                                        {currentSkillIdx + 1 < skills.length ? 'Next Skill' : 'Finish & Go to Dashboard'}
                                        <ChevronRight className="w-5 h-5" />
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillVerificationPage;
