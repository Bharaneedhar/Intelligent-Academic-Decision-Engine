const mongoose = require('mongoose');

const ModuleCompletionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
    weekId: { type: Number, required: true },
    moduleId: { type: String, required: true },
    completed: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

ModuleCompletionSchema.index({ userId: 1, courseId: 1, weekId: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model('ModuleCompletion', ModuleCompletionSchema);

