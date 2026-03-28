const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    moduleTitle: { type: String },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    answers: [{
        question: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean
    }],
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);
