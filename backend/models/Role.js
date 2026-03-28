const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String },
    category: { type: String }, // e.g., Web Development, Data Science
});

module.exports = mongoose.model('Role', RoleSchema);
