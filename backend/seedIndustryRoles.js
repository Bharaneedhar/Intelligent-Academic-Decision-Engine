const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./models/Role'); // Adjusted for running in backend folder

dotenv.config();

const industryRoles = [
    { title: "Frontend Developer", description: "Specializes in building the client-side of web applications, focusing on React, Vue, or Angular.", category: "Web Development" },
    { title: "Backend Developer", description: "Architects and implements server-side logic, APIs, and database interactions.", category: "Web Development" },
    { title: "Full Stack Developer", description: "Proficient natively in both backend server logics and frontend user interfaces.", category: "Web Development" },
    { title: "Data Scientist", description: "Analyzes and interprets complex data sets to help organizations make data-driven decisions.", category: "Data Science" },
    { title: "Data Analyst", description: "Transforms raw data into meaningful insights using tools like SQL, Excel, and BI interfaces.", category: "Data Science" },
    { title: "Machine Learning Engineer", description: "Designs and deploys scalable machine learning models and predictive algorithms.", category: "Artificial Intelligence" },
    { title: "DevOps Engineer", description: "Bridges the gap between development and operations, focusing on CI/CD and cloud infrastructure.", category: "Infrastructure" },
    { title: "Cloud Architect", description: "Designs cloud adoption strategies, cloud application design, and cloud management/monitoring.", category: "Infrastructure" },
    { title: "Cybersecurity Analyst", description: "Protects IT infrastructure (including networks, hardware and software) from a range of criminal activity.", category: "Security" },
    { title: "UI/UX Designer", description: "Designs intuitive and engaging user interfaces and optimizes the overall user experience.", category: "Design" },
    { title: "Product Manager", description: "Oversees the development of products from conceptualization to launch.", category: "Management" },
    { title: "Quality Assurance (QA) Engineer", description: "Tests software to ensure it behaves precisely as expected before going to production.", category: "Testing" },
    { title: "Database Administrator (DBA)", description: "Responsible for the performance, integrity, and security of a database.", category: "Infrastructure" },
    { title: "Mobile App Developer", description: "Develops applications natively for mobile devices such as iOS or Android.", category: "Mobile Development" },
    { title: "Systems Administrator", description: "Manages the operation of computer systems/networks and guarantees their availability.", category: "Infrastructure" },
    { title: "IT Support Specialist", description: "Provides technical assistance and support for incoming queries and issues related to computer systems.", category: "Support" },
    { title: "Business Analyst", description: "Helps businesses implement technology solutions in a cost-effective way by determining the requirements of a project or program.", category: "Management" },
    { title: "Site Reliability Engineer (SRE)", description: "Applies software engineering workflows to operations/infrastructure tasks.", category: "Infrastructure" },
    { title: "Blockchain Developer", description: "Develops decentralized applications (dApps) and smart contracts.", category: "Emerging Tech" },
    { title: "AI Researcher", description: "Pioneers new algorithms and artificial intelligence methodologies.", category: "Artificial Intelligence" }
];

const seedIndustryRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding industry roles...');

        for (const roleData of industryRoles) {
            const roleExists = await Role.findOne({ title: roleData.title });
            if (!roleExists) {
                await Role.create(roleData);
                console.log(`Created new role: ${roleData.title}`);
            } else {
                console.log(`Role already exists: ${roleData.title}`);
            }
        }

        console.log('15-20 Industry roles successfully seeded!');
        process.exit();
    } catch (error) {
        console.error('Error importing roles:', error);
        process.exit(1);
    }
};

seedIndustryRoles();
