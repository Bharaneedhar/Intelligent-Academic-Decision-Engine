const mongoose = require('mongoose');

const UserRoleSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    status: { type: String, enum: ['In Progress', 'Completed'], default: 'In Progress' },
    progress: { type: Number, default: 0 },
});

module.exports = mongoose.model('UserRole', UserRoleSchema);
