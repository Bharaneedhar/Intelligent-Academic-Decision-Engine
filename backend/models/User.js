const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profileComplete: { type: Boolean, default: false },
    profileImage: { type: String, default: '' },
    selectedRoles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    roleAssessments: [{
        roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
        rating: { type: Number, min: 1, max: 5 }
    }],
    academicProfile: {
        educationLevel: { type: String }, // e.g. Undergraduate, Graduate, High School
        fieldOfStudy: { type: String },
        institutionName: { type: String },
        yearOfStudy: { type: String },
        achievements: { type: String },
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
