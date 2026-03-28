const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('../models/Role');
const Skill = require('../models/Skill');
const RoleSkill = require('../models/RoleSkill');

dotenv.config();

const roles = [
    { title: 'Frontend Developer', description: 'Build beautiful user interfaces using modern web technologies.', category: 'Web Development' },
    { title: 'Backend Developer', description: 'Architect scalable server-side systems and databases.', category: 'Web Development' },
    { title: 'Data Scientist', description: 'Unlock insights from complex datasets using AI/ML.', category: 'Data & AI' },
];

const skills = [
    // Frontend
    { name: 'React', category: 'Frontend', description: 'Components, Hooks, Context API' },
    { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first styling' },
    { name: 'TypeScript', category: 'Frontend', description: 'Type safety' },
    { name: 'Redux', category: 'Frontend', description: 'State management' },
    { name: 'Next.js', category: 'Frontend', description: 'SSR and Static site generation' },

    // Backend
    { name: 'Node.js', category: 'Backend', description: 'Runtime server environment' },
    { name: 'Express.js', category: 'Backend', description: 'Web framework for Node' },
    { name: 'MongoDB', category: 'Backend', description: 'NoSQL database' },
    { name: 'PostgreSQL', category: 'Backend', description: 'Relational database' },
    { name: 'GraphQL', category: 'Backend', description: 'API query language' },

    // Data Science
    { name: 'Python', category: 'Data Science', description: 'Primary DS language' },
    { name: 'Pandas', category: 'Data Science', description: 'Data manipulation' },
    { name: 'Scikit-learn', category: 'Data Science', description: 'Machine learning library' },
    { name: 'TensorFlow', category: 'Data Science', description: 'Neural networks' },
    { name: 'SQL', category: 'General', description: 'Database querying' },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Role.deleteMany({});
        await Skill.deleteMany({});
        await RoleSkill.deleteMany({});

        // Insert Skills
        const createdSkills = await Skill.insertMany(skills);
        console.log('Skills seeded!');

        // Insert Roles
        const createdRoles = await Role.insertMany(roles);
        console.log('Roles seeded!');

        // Helper to find skill ID
        const s = (name) => createdSkills.find(sk => sk.name === name)._id;

        // Link Skills to Roles
        const frontend = createdRoles.find(r => r.title === 'Frontend Developer')._id;
        const backend = createdRoles.find(r => r.title === 'Backend Developer')._id;
        const ds = createdRoles.find(r => r.title === 'Data Scientist')._id;

        await RoleSkill.create([
            // Frontend
            { role: frontend, skill: s('React'), importance: 'Required' },
            { role: frontend, skill: s('Tailwind CSS'), importance: 'Required' },
            { role: frontend, skill: s('TypeScript'), importance: 'Recommended' },
            { role: frontend, skill: s('Next.js'), importance: 'Recommended' },
            { role: frontend, skill: s('Redux'), importance: 'Optional' },

            // Backend
            { role: backend, skill: s('Node.js'), importance: 'Required' },
            { role: backend, skill: s('Express.js'), importance: 'Required' },
            { role: backend, skill: s('MongoDB'), importance: 'Required' },
            { role: backend, skill: s('PostgreSQL'), importance: 'Recommended' },
            { role: backend, skill: s('GraphQL'), importance: 'Optional' },

            // Data Science
            { role: ds, skill: s('Python'), importance: 'Required' },
            { role: ds, skill: s('Pandas'), importance: 'Required' },
            { role: ds, skill: s('Scikit-learn'), importance: 'Required' },
            { role: ds, skill: s('TensorFlow'), importance: 'Recommended' },
            { role: ds, skill: s('SQL'), importance: 'Recommended' },
        ]);

        console.log('Seeding complete! 🚀');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
