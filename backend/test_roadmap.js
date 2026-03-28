require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { generateAndSaveRoadmap } = require('./services/roadmapService');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // create a dummy user
        let user = await User.findOne({ email: 'test_roadmap@example.com' });
        if (!user) {
            user = await User.create({ name: 'Test User', email: 'test_roadmap@example.com' });
        }

        console.log('Testing custom role: Python Developer');
        const roadmapCustom = await generateAndSaveRoadmap(user._id, null, 'Python Developer');
        console.log('Custom Roadmap result:', JSON.stringify(roadmapCustom, null, 2));

        console.log('Testing predefined role: Java Developer (no skills seeded?)');
        const Role = require('./models/Role');
        const javaRole = await Role.findOne({ title: 'Java Developer' });
        if (javaRole) {
            const roadmapPredefined = await generateAndSaveRoadmap(user._id, javaRole._id);
            console.log('Predefined Roadmap result:', JSON.stringify(roadmapPredefined, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

test();
