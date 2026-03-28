const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Role = require('./models/Role');
const Skill = require('./models/Skill');
const RoleSkill = require('./models/RoleSkill');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const roles = await Role.find();
        console.log(`\nFound ${roles.length} Roles:`);

        for (const role of roles) {
            console.log(`\n--- Role: ${role.title} ---`);
            const roleSkills = await RoleSkill.find({ role: role._id }).populate('skill');
            console.log(`Associated Skills (${roleSkills.length}):`);
            roleSkills.forEach(rs => {
                if (rs.skill) {
                    console.log(` - ${rs.skill.name} (${rs.importance})`);
                } else {
                    console.log(` - [MISSING SKILL REF] (${rs.importance})`);
                }
            });
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error("DB Check Failed:", err);
    }
};

checkDB();
