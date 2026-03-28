const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Role = require('./models/Role');
const Skill = require('./models/Skill');
const RoleSkill = require('./models/RoleSkill');

const rolesData = [
    {
        title: "DevOps Engineer",
        description: "Focus on CI/CD, automation, and infrastructure management.",
        category: "Cloud & Infrastructure",
        skills: [
            { name: "Docker", importance: "Required" },
            { name: "Kubernetes", importance: "Required" },
            { name: "AWS", importance: "Recommended" },
            { name: "Terraform", importance: "Recommended" },
            { name: "Jenkins", importance: "Required" }
        ]
    },
    {
        title: "Cybersecurity Analyst",
        description: "Protect systems and networks from digital attacks.",
        category: "Security",
        skills: [
            { name: "Network Security", importance: "Required" },
            { name: "Ethical Hacking", importance: "Recommended" },
            { name: "Encryption", importance: "Required" },
            { name: "Risk Assessment", importance: "Recommended" },
            { name: "Incident Response", importance: "Required" }
        ]
    },
    {
        title: "Mobile Developer (React Native)",
        description: "Build cross-platform mobile apps for iOS and Android.",
        category: "Mobile Development",
        skills: [
            { name: "React Native", importance: "Required" },
            { name: "JavaScript", importance: "Required" },
            { name: "Mobile UI Design", importance: "Recommended" },
            { name: "Redux", importance: "Recommended" },
            { name: "Native Modules", importance: "Optional" }
        ]
    },
    {
        title: "UI/UX Designer",
        description: "Create beautiful and user-friendly digital interfaces.",
        category: "Design",
        skills: [
            { name: "Figma", importance: "Required" },
            { name: "Design Systems", importance: "Required" },
            { name: "User Research", importance: "Recommended" },
            { name: "Prototyping", importance: "Recommended" },
            { name: "Accessibility", importance: "Required" }
        ]
    },
    {
        title: "Product Manager",
        description: "Define the product vision and lead cross-functional teams.",
        category: "Business",
        skills: [
            { name: "Agile/Scrum", importance: "Required" },
            { name: "Product Strategy", importance: "Required" },
            { name: "User Stories", importance: "Required" },
            { name: "Data Analytics", importance: "Recommended" },
            { name: "Communication", importance: "Required" }
        ]
    },
    {
        title: "Machine Learning Engineer",
        description: "Design and implement AI models and algorithms.",
        category: "Data Science & AI",
        skills: [
            { name: "Python", importance: "Required" },
            { name: "PyTorch", importance: "Recommended" },
            { name: "Model Deployment", importance: "Required" },
            { name: "Natural Language Processing", importance: "Optional" },
            { name: "Mathematics for ML", importance: "Required" }
        ]
    },
    {
        title: "Blockchain Developer",
        description: "Develop decentralized applications and smart contracts.",
        category: "Web3",
        skills: [
            { name: "Solidity", importance: "Required" },
            { name: "Ethereum", importance: "Required" },
            { name: "Smart Contracts", importance: "Required" },
            { name: "Web3.js", importance: "Recommended" },
            { name: "Cryptography", importance: "Required" }
        ]
    }
];

const seedMoreRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        for (const r of rolesData) {
            let role = await Role.findOne({ title: r.title });
            if (!role) {
                role = await Role.create({
                    title: r.title,
                    description: r.description,
                    category: r.category
                });
                console.log(`Created Role: ${r.title}`);
            }

            for (const s of r.skills) {
                let skill = await Skill.findOne({ name: s.name });
                if (!skill) {
                    skill = await Skill.create({
                        name: s.name,
                        category: r.category,
                        description: `Essential for ${r.title}`
                    });
                    console.log(`  Created Skill: ${s.name}`);
                }

                const existingLink = await RoleSkill.findOne({ role: role._id, skill: skill._id });
                if (!existingLink) {
                    await RoleSkill.create({
                        role: role._id,
                        skill: skill._id,
                        importance: s.importance
                    });
                    console.log(`    Linked ${s.name} to ${r.title}`);
                }
            }
        }

        console.log("\nSeeding complete!");
        await mongoose.connection.close();
    } catch (err) {
        console.error("Seeding Failed:", err);
    }
};

seedMoreRoles();
