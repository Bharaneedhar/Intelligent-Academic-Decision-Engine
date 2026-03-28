const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./models/Role');

dotenv.config();

const rolesToSeed = [
    { title: "Software Developer", description: "AI-generated path for Software Developer", category: "Other" },
    { title: "Product Development", description: "AI-generated path for Product Development", category: "Other" },
    { title: "MEAN stack", description: "AI-generated path for MEAN stack", category: "Other" },
    { title: "Network Engineer", description: "AI-generated path for Network Engineer", category: "Other" },
    { title: "Java Developer", description: "This ensure the core Java Fundamentals and Advanced logical thinking", category: "Web Development" }
];

const seedPredefinedRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Create or update roles based on title
        for (const roleData of rolesToSeed) {
            const roleExists = await Role.findOne({ title: roleData.title });
            if (!roleExists) {
                await Role.create(roleData);
                console.log(`Created new role: ${roleData.title}`);
            } else {
                console.log(`Role ${roleData.title} already exists.`);
            }
        }

        console.log('Predefined roles are successfully seeded!');
        process.exit();
    } catch (error) {
        console.error('Error with data import', error);
        process.exit(1);
    }
};

seedPredefinedRoles();
