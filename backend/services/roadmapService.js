const Roadmap = require('../models/Roadmap');
const UserSkill = require('../models/UserSkill');
const RoleSkill = require('../models/RoleSkill');
const Role = require('../models/Role');
const Skill = require('../models/Skill');
const { generateSkillGapAnalysis, generateRoadmap, generateRoleSkills } = require('./aiService');

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};


/**
 * Generates and saves a roadmap for a specific role and user.
 * @param {string} userId - ID of the user.
 * @param {string} roleId - ID of the role (optional if customTitle provided).
 * @param {string} customTitle - Custom role title (optional).
 * @returns {Promise<Object>} - The generated and populated roadmap.
 */
const generateAndSaveRoadmap = async (userId, roleId, customTitle = null) => {
    try {
        let activeRoleId = roleId;
        let roleName = "";

        if (roleId) {
            const tempRole = await Role.findById(roleId);
            if (tempRole) roleName = tempRole.title;
        }

        // 1. Handle Custom Role if provided
        if (customTitle && !roleId) {
            // Check if role already exists by title
            let existingRole = await Role.findOne({ title: { $regex: new RegExp(`^${escapeRegExp(customTitle.trim())}$`, "i") } });

            if (existingRole) {
                activeRoleId = existingRole._id;
                roleName = existingRole.title;
            } else {
                // Create new role using AI
                console.log(`AI: Generating skills for new role: ${customTitle}`);
                const aiSkills = await generateRoleSkills(customTitle);

                const newRole = await Role.create({
                    title: customTitle.trim(),
                    description: `AI-generated path for ${customTitle}`,
                    category: "Other"
                });

                activeRoleId = newRole._id;
                roleName = newRole.title;

                // Create Skills and RoleSkills
                for (const s of aiSkills.skills) {
                    let skill = await Skill.findOne({ name: { $regex: new RegExp(`^${escapeRegExp(s.name.trim())}$`, "i") } });
                    if (!skill) {
                        skill = await Skill.create({
                            name: s.name.trim(),
                            category: s.category || "Tech",
                            description: `Required for ${customTitle}`
                        });
                    }

                    await RoleSkill.create({
                        role: activeRoleId,
                        skill: skill._id,
                        importance: s.importance || "Required"
                    });
                }
            }
        }

        // 2. Get required skills for the role
        let roleSkills = await RoleSkill.find({ role: activeRoleId }).populate('skill');

        if (roleSkills.length === 0) {
            console.log(`AI: Generating missing skills for predefined role: ${roleName || 'Unknown Role'}`);
            // Fallback for predefined roles that have no skills seeded yet
            const aiSkills = await generateRoleSkills(roleName || 'Software Role');
            for (const s of aiSkills.skills) {
                let skill = await Skill.findOne({ name: { $regex: new RegExp(`^${escapeRegExp(s.name.trim())}$`, "i") } });
                if (!skill) {
                    skill = await Skill.create({
                        name: s.name.trim(),
                        category: s.category || "Tech",
                        description: `Required for ${roleName || 'the role'}`
                    });
                }
                await RoleSkill.create({
                    role: activeRoleId,
                    skill: skill._id,
                    importance: s.importance || "Required"
                });
            }
            // Fetch anew
            roleSkills = await RoleSkill.find({ role: activeRoleId }).populate('skill');
        }
        const requiredSkills = roleSkills.map(rs => ({
            name: rs.skill.name,
            importance: rs.importance
        }));

        // 3. Get user's current skills
        const userSkills = await UserSkill.find({ user: userId }).populate('skill');
        const userSkillData = userSkills.map(us => ({
            name: us.skill.name,
            masteryLevel: us.masteryLevel
        }));

        // 4. AI Gap Analysis
        const gapAnalysis = await generateSkillGapAnalysis(userSkillData, requiredSkills);

        if (!gapAnalysis.missingSkills || gapAnalysis.missingSkills.length === 0) {
            return {
                noGap: true,
                message: `You already have all the skills required for ${roleName || 'this role'}! Great job!`,
                roadmap: []
            };
        }

        // 5. AI Roadmap Generation
        const roadmapData = await generateRoadmap(gapAnalysis.missingSkills, "Beginner");

        // 6. Save Roadmap to DB
        const newRoadmap = await Roadmap.create({
            user: userId,
            role: activeRoleId,
            estimatedDurationWeeks: roadmapData.estimatedDurationWeeks,
            roadmap: roadmapData.roadmap
        });

        // Populate role for response
        return await Roadmap.findById(newRoadmap._id).populate('role');
    } catch (error) {
        console.error("Roadmap Service Error:", error);
        throw error;
    }
};

module.exports = {
    generateAndSaveRoadmap
};
