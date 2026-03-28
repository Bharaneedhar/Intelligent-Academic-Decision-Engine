const dotenv = require('dotenv');
dotenv.config();

const { generateSkillGapAnalysis, generateRoadmap } = require('./services/aiService');

const testBackend = async () => {
    const requiredSkills = [
        { name: 'Node.js', importance: 'Required' },
        { name: 'Express.js', importance: 'Required' }
    ];
    const userSkills = [];

    try {
        console.log("Testing Backend with gemini-2.5-flash...");
        const gap = await generateSkillGapAnalysis(userSkills, requiredSkills);
        console.log("Gap Analysis Success!");

        const roadmap = await generateRoadmap(gap.missingSkills, "Beginner");
        console.log("Roadmap Success! Weeks:", roadmap.estimatedDurationWeeks);
        console.log("✅ MODEL gemini-2.5-flash IS WORKING");
    } catch (err) {
        console.error("❌ MODEL FAILURE:", err.message);
        console.log("Recommendation: Check if model name gemini-2.5-flash is valid or if you have exceeded quota.");
    }
};

testBackend();
