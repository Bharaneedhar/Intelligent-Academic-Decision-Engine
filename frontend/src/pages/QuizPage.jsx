import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Loader2, Trophy, Brain } from 'lucide-react';
import api from '../utils/api';
import useProgressStore from '../store/progressStore';

const QuizPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { skillName, topics, skillId, moduleTitle, courseId, weekId, moduleId } = location.state || {};
    const markModuleComplete = useProgressStore(state => state.markModuleComplete);

    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [quizError, setQuizError] = useState(null);

    useEffect(() => {
        if (!skillName || !topics) {
            navigate('/dashboard');
            return;
        }

        const fetchQuiz = async (retries = 2) => {
            try {
                const res = await api.post('/quizzes/generate', { skillName, topics });
                if (res.data.quiz && res.data.quiz.length > 0) {
                    setQuiz(res.data.quiz);
                    setLoading(false);
                } else {
                    throw new Error('Empty quiz returned');
                }
            } catch (err) {
                console.error(`Quiz fetch attempt failed (${retries} retries left):`, err);
                if (retries > 0) {
                    setTimeout(() => fetchQuiz(retries - 1), 1500);
                } else {
                    setLoading(false);
                    setQuizError('Failed to generate quiz after multiple attempts. Please try again.');
                }
            }
        };

        fetchQuiz();
    }, [skillName, topics, navigate]);

    const handleAnswer = (answer) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(answer);
        const isCorrect = answer === quiz[currentQuestion].correctAnswer;

        if (isCorrect) setScore(score + 1);

        setAnswers([...answers, {
            question: quiz[currentQuestion].question,
            userAnswer: answer,
            correctAnswer: quiz[currentQuestion].correctAnswer,
            isCorrect
        }]);

        setTimeout(() => {
            if (currentQuestion < quiz.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
            } else {
                saveResult();
                setShowResults(true);
            }
        }, 1500);
    };

    const saveResult = async () => {
        try {
            await api.post('/quizzes/result', {
                skillId,
                moduleTitle,
                score,
                totalQuestions: quiz.length,
                answers,
                skillName
            });

            // Mark the corresponding learning module as completed for this specific course only
            if (courseId && typeof weekId !== 'undefined' && moduleId) {
                try {
                    await api.post('/modules/complete', {
                        courseId,
                        weekId,
                        moduleId,
                    });
                } catch (e) {
                    console.error('Failed to persist module completion', e);
                }

                // Update local progress store so only this module shows as completed
                markModuleComplete(courseId, weekId, moduleId);
            }
        } catch (err) {
            console.error('Failed to save result', err);
        }
    };

    if (quizError) return (
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-6 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold">Quiz Generation Failed</h2>
            <p className="text-slate-500">{quizError}</p>
            <div className="flex gap-4">
                <button
                    onClick={() => { setQuizError(null); setLoading(true); /* re-trigger */ window.location.reload(); }}
                    className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold hover:scale-105 transition-all"
                >
                    Retry
                </button>
                <button
                    onClick={() => navigate('/roadmap')}
                    className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold hover:scale-105 transition-all"
                >
                    Back to Roadmap
                </button>
            </div>
        </div>
    );

    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-16 h-16 text-slate-900 dark:text-white animate-spin" />
            <div className="text-center">
                <h2 className="text-2xl font-bold">Generating AI Quiz</h2>
                <p className="text-slate-500 mt-2">Personalizing questions based on {skillName} topics...</p>
            </div>
        </div>
    );

    if (showResults) return (
        <div className="max-w-2xl mx-auto py-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card text-center p-12"
            >
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Trophy className="w-12 h-12 text-slate-900 dark:text-white" />
                </div>
                <h2 className="text-4xl font-black mb-2">Quiz Complete!</h2>
                <p className="text-slate-500 mb-8">Great job on finishing the {moduleTitle} assessment.</p>

                <div className="text-6xl font-black text-slate-900 dark:text-white mb-10">
                    {score} <span className="text-2xl text-slate-400">/ {quiz.length}</span>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/roadmap')}
                        className="flex-1 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-bold hover:bg-black dark:bg-white-dark transition-all"
                    >
                        Back to Roadmap
                    </button>
                </div>
            </motion.div>
        </div>
    );

    const question = quiz[currentQuestion];

    return (
        <div className="max-w-3xl mx-auto py-10 space-y-8">
            <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Assessment</p>
                        <h3 className="font-bold">{skillName}</h3>
                    </div>
                </div>
                <div className="text-sm font-bold text-slate-500">
                    Question {currentQuestion + 1} of {quiz.length}
                </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
                    className="h-full bg-black dark:bg-white"
                />
            </div>

            <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-10"
            >
                <h2 className="text-2xl font-bold mb-10 leading-tight">
                    {question.question}
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    {question.options.map((option, i) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === question.correctAnswer;
                        const isWrong = isSelected && !isCorrect;

                        return (
                            <button
                                key={i}
                                onClick={() => handleAnswer(option)}
                                disabled={selectedAnswer !== null}
                                className={`
                                    flex items-center justify-between p-5 rounded-2xl text-left font-medium transition-all border-2
                                    ${!selectedAnswer ? 'border-slate-100 dark:border-slate-800 hover:border-slate-900 dark:border-white hover:bg-slate-100 dark:bg-slate-800' : ''}
                                    ${isSelected && isCorrect ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : ''}
                                    ${isWrong ? 'border-red-500 bg-red-500/10 text-red-600' : ''}
                                    ${selectedAnswer && isCorrect ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : ''}
                                `}
                            >
                                <span>{option}</span>
                                {selectedAnswer && isCorrect && <CheckCircle className="w-5 h-5" />}
                                {isWrong && <XCircle className="w-5 h-5" />}
                            </button>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

export default QuizPage;
