// Load env FIRST
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Role = require('./models/Role');
const Skill = require('./models/Skill');
const RoleSkill = require('./models/RoleSkill');

const emergingRoles = [
    // ── AI & Machine Learning ──────────────────────────────────────────────
    {
        title: "AI/ML Engineer",
        description: "Build, train, and deploy machine learning models for production systems.",
        category: "Data Science & AI",
        skills: [
            { name: "Python", importance: "Required" },
            { name: "TensorFlow", importance: "Required" },
            { name: "Scikit-learn", importance: "Required" },
            { name: "MLOps", importance: "Recommended" },
            { name: "Feature Engineering", importance: "Recommended" }
        ]
    },
    {
        title: "Generative AI Engineer",
        description: "Design and build applications using LLMs, diffusion models, and multimodal AI.",
        category: "Data Science & AI",
        skills: [
            { name: "Prompt Engineering", importance: "Required" },
            { name: "LangChain", importance: "Required" },
            { name: "OpenAI API", importance: "Required" },
            { name: "Fine-tuning LLMs", importance: "Recommended" },
            { name: "Vector Databases", importance: "Recommended" }
        ]
    },
    {
        title: "AI Product Manager",
        description: "Lead AI-powered product development by bridging business goals and ML capabilities.",
        category: "Data Science & AI",
        skills: [
            { name: "Machine Learning Basics", importance: "Required" },
            { name: "Product Roadmapping", importance: "Required" },
            { name: "A/B Testing", importance: "Recommended" },
            { name: "Stakeholder Management", importance: "Required" },
            { name: "Data-Driven Decision Making", importance: "Required" }
        ]
    },
    {
        title: "MLOps Engineer",
        description: "Operationalize ML models with CI/CD pipelines, monitoring, and model versioning.",
        category: "Data Science & AI",
        skills: [
            { name: "Kubeflow", importance: "Required" },
            { name: "MLflow", importance: "Required" },
            { name: "Docker", importance: "Required" },
            { name: "Kubernetes", importance: "Recommended" },
            { name: "Python", importance: "Required" }
        ]
    },
    {
        title: "Computer Vision Engineer",
        description: "Build systems that interpret images and video using deep learning.",
        category: "Data Science & AI",
        skills: [
            { name: "OpenCV", importance: "Required" },
            { name: "PyTorch", importance: "Required" },
            { name: "Image Segmentation", importance: "Recommended" },
            { name: "Object Detection", importance: "Required" },
            { name: "YOLO", importance: "Recommended" }
        ]
    },
    {
        title: "NLP Engineer",
        description: "Build language-based AI systems like chatbots, search engines, and sentiment tools.",
        category: "Data Science & AI",
        skills: [
            { name: "Transformers (HuggingFace)", importance: "Required" },
            { name: "BERT / GPT", importance: "Required" },
            { name: "Text Preprocessing", importance: "Required" },
            { name: "Named Entity Recognition", importance: "Recommended" },
            { name: "Python", importance: "Required" }
        ]
    },
    // ── Cloud & Infrastructure ─────────────────────────────────────────────
    {
        title: "Cloud Architect",
        description: "Design and oversee enterprise cloud infrastructure on AWS, Azure, or GCP.",
        category: "Cloud & Infrastructure",
        skills: [
            { name: "AWS", importance: "Required" },
            { name: "Azure", importance: "Recommended" },
            { name: "Google Cloud Platform", importance: "Recommended" },
            { name: "Infrastructure as Code", importance: "Required" },
            { name: "Cost Optimization", importance: "Recommended" }
        ]
    },
    {
        title: "Site Reliability Engineer (SRE)",
        description: "Ensure reliability, availability, and performance of large-scale software systems.",
        category: "Cloud & Infrastructure",
        skills: [
            { name: "Linux", importance: "Required" },
            { name: "Prometheus & Grafana", importance: "Required" },
            { name: "On-Call Incident Management", importance: "Required" },
            { name: "Kubernetes", importance: "Recommended" },
            { name: "Go", importance: "Optional" }
        ]
    },
    {
        title: "Platform Engineer",
        description: "Build internal developer platforms to improve developer experience and productivity.",
        category: "Cloud & Infrastructure",
        skills: [
            { name: "Kubernetes", importance: "Required" },
            { name: "Terraform", importance: "Required" },
            { name: "CI/CD Pipelines", importance: "Required" },
            { name: "Internal Developer Portals", importance: "Recommended" },
            { name: "Backstage.io", importance: "Optional" }
        ]
    },
    {
        title: "FinOps Engineer",
        description: "Optimize cloud spending and align engineering decisions with cost efficiency.",
        category: "Cloud & Infrastructure",
        skills: [
            { name: "AWS Cost Explorer", importance: "Required" },
            { name: "Cloud Billing Analysis", importance: "Required" },
            { name: "Tagging Strategies", importance: "Recommended" },
            { name: "Reserved Instances", importance: "Recommended" },
            { name: "Terraform", importance: "Optional" }
        ]
    },
    // ── Cybersecurity ──────────────────────────────────────────────────────
    {
        title: "Penetration Tester",
        description: "Simulate cyberattacks to find vulnerabilities before real attackers do.",
        category: "Security",
        skills: [
            { name: "Kali Linux", importance: "Required" },
            { name: "Metasploit", importance: "Required" },
            { name: "OWASP Top 10", importance: "Required" },
            { name: "Burp Suite", importance: "Required" },
            { name: "Network Analysis", importance: "Recommended" }
        ]
    },
    {
        title: "Application Security Engineer",
        description: "Embed security into the software development lifecycle (SSDLC).",
        category: "Security",
        skills: [
            { name: "SAST/DAST Tools", importance: "Required" },
            { name: "Secure Code Review", importance: "Required" },
            { name: "Threat Modeling", importance: "Required" },
            { name: "OWASP", importance: "Required" },
            { name: "DevSecOps", importance: "Recommended" }
        ]
    },
    {
        title: "Cloud Security Engineer",
        description: "Secure cloud environments and workloads across AWS, Azure, and GCP.",
        category: "Security",
        skills: [
            { name: "IAM Policies", importance: "Required" },
            { name: "Cloud Security Posture Management", importance: "Required" },
            { name: "Zero Trust Architecture", importance: "Recommended" },
            { name: "AWS Security Hub", importance: "Recommended" },
            { name: "Encryption", importance: "Required" }
        ]
    },
    // ── Web & Full Stack ───────────────────────────────────────────────────
    {
        title: "Full Stack Developer",
        description: "Build end-to-end web applications covering both frontend and backend systems.",
        category: "Web Development",
        skills: [
            { name: "React", importance: "Required" },
            { name: "Node.js", importance: "Required" },
            { name: "REST APIs", importance: "Required" },
            { name: "MongoDB", importance: "Recommended" },
            { name: "TypeScript", importance: "Recommended" }
        ]
    },
    {
        title: "Frontend Developer",
        description: "Build fast, accessible, and beautiful user interfaces for the web.",
        category: "Web Development",
        skills: [
            { name: "React", importance: "Required" },
            { name: "TypeScript", importance: "Required" },
            { name: "CSS / Tailwind", importance: "Required" },
            { name: "Performance Optimization", importance: "Recommended" },
            { name: "Next.js", importance: "Recommended" }
        ]
    },
    {
        title: "Backend Developer",
        description: "Design APIs, microservices, and data pipelines that power web applications.",
        category: "Web Development",
        skills: [
            { name: "Node.js", importance: "Required" },
            { name: "PostgreSQL", importance: "Required" },
            { name: "REST API Design", importance: "Required" },
            { name: "GraphQL", importance: "Optional" },
            { name: "Caching (Redis)", importance: "Recommended" }
        ]
    },
    {
        title: "Web3 / DApp Developer",
        description: "Build decentralized applications on blockchain networks.",
        category: "Web3",
        skills: [
            { name: "Solidity", importance: "Required" },
            { name: "Ethers.js", importance: "Required" },
            { name: "IPFS", importance: "Recommended" },
            { name: "Hardhat", importance: "Required" },
            { name: "NFT Standards (ERC-721)", importance: "Recommended" }
        ]
    },
    // ── Data ───────────────────────────────────────────────────────────────
    {
        title: "Data Engineer",
        description: "Build pipelines that collect, process, and store large datasets for analytics.",
        category: "Data Science & AI",
        skills: [
            { name: "Apache Spark", importance: "Required" },
            { name: "Airflow", importance: "Required" },
            { name: "SQL", importance: "Required" },
            { name: "dbt", importance: "Recommended" },
            { name: "Snowflake", importance: "Recommended" }
        ]
    },
    {
        title: "Data Analyst",
        description: "Analyze data to uncover actionable business insights using BI tools.",
        category: "Data Science & AI",
        skills: [
            { name: "SQL", importance: "Required" },
            { name: "Power BI / Tableau", importance: "Required" },
            { name: "Python / Pandas", importance: "Recommended" },
            { name: "Excel", importance: "Required" },
            { name: "Statistical Analysis", importance: "Recommended" }
        ]
    },
    {
        title: "Data Scientist",
        description: "Use statistics and machine learning to derive insights and build predictive models.",
        category: "Data Science & AI",
        skills: [
            { name: "Python", importance: "Required" },
            { name: "Machine Learning Algorithms", importance: "Required" },
            { name: "Statistics & Probability", importance: "Required" },
            { name: "Jupyter Notebooks", importance: "Required" },
            { name: "Data Visualization", importance: "Recommended" }
        ]
    },
    // ── Emerging & Specialized ─────────────────────────────────────────────
    {
        title: "Low-Code / No-Code Developer",
        description: "Build applications using platforms like Bubble, Webflow, and Power Apps.",
        category: "Web Development",
        skills: [
            { name: "Bubble.io", importance: "Required" },
            { name: "Webflow", importance: "Recommended" },
            { name: "Zapier / Make", importance: "Recommended" },
            { name: "API Integrations", importance: "Required" },
            { name: "UI/UX Thinking", importance: "Recommended" }
        ]
    },
    {
        title: "AR/VR Developer",
        description: "Build immersive Augmented and Virtual Reality experiences.",
        category: "Extended Reality",
        skills: [
            { name: "Unity", importance: "Required" },
            { name: "Unreal Engine", importance: "Optional" },
            { name: "C#", importance: "Required" },
            { name: "3D Modeling", importance: "Recommended" },
            { name: "ARKit / ARCore", importance: "Recommended" }
        ]
    },
    {
        title: "IoT Engineer",
        description: "Design connected devices and networks for smart homes, cities, and industries.",
        category: "Internet of Things",
        skills: [
            { name: "Embedded C", importance: "Required" },
            { name: "MQTT Protocol", importance: "Required" },
            { name: "Arduino / Raspberry Pi", importance: "Required" },
            { name: "Cloud IoT (AWS IoT)", importance: "Recommended" },
            { name: "Edge Computing", importance: "Optional" }
        ]
    },
    {
        title: "Robotics Engineer",
        description: "Design, build, and program robots for automation and real-world tasks.",
        category: "Robotics & Automation",
        skills: [
            { name: "ROS (Robot Operating System)", importance: "Required" },
            { name: "Python / C++", importance: "Required" },
            { name: "Kinematics", importance: "Required" },
            { name: "Sensor Integration", importance: "Recommended" },
            { name: "Computer Vision", importance: "Optional" }
        ]
    },
    {
        title: "Quantum Computing Researcher",
        description: "Research and develop algorithms for quantum computers.",
        category: "Quantum Computing",
        skills: [
            { name: "Qiskit", importance: "Required" },
            { name: "Linear Algebra", importance: "Required" },
            { name: "Quantum Gates", importance: "Required" },
            { name: "Python", importance: "Required" },
            { name: "Quantum Cryptography", importance: "Recommended" }
        ]
    },
    {
        title: "Prompt Engineer",
        description: "Craft and optimize AI prompts to get the best results from LLMs.",
        category: "Data Science & AI",
        skills: [
            { name: "Prompt Design Techniques", importance: "Required" },
            { name: "Chain-of-Thought Prompting", importance: "Required" },
            { name: "LLM APIs", importance: "Required" },
            { name: "RAG (Retrieval Augmented Generation)", importance: "Recommended" },
            { name: "Evaluation Frameworks", importance: "Optional" }
        ]
    },
    {
        title: "AI Ethics & Governance Specialist",
        description: "Ensure AI systems are fair, transparent, and compliant with regulations.",
        category: "Data Science & AI",
        skills: [
            { name: "Responsible AI Frameworks", importance: "Required" },
            { name: "Bias Detection", importance: "Required" },
            { name: "EU AI Act / Regulations", importance: "Required" },
            { name: "Explainability (XAI)", importance: "Recommended" },
            { name: "Risk Management", importance: "Required" }
        ]
    },
    {
        title: "Digital Marketing Analyst",
        description: "Analyze campaigns, SEO, and digital channels to optimize marketing ROI.",
        category: "Business",
        skills: [
            { name: "Google Analytics", importance: "Required" },
            { name: "SEO / SEM", importance: "Required" },
            { name: "A/B Testing", importance: "Recommended" },
            { name: "Social Media Analytics", importance: "Recommended" },
            { name: "CRM Tools", importance: "Optional" }
        ]
    },
    {
        title: "Technical Writer",
        description: "Create clear documentation, API guides, and tutorials for technical products.",
        category: "Business",
        skills: [
            { name: "Markdown / Docs as Code", importance: "Required" },
            { name: "API Documentation", importance: "Required" },
            { name: "Technical Communication", importance: "Required" },
            { name: "Diagramming Tools", importance: "Recommended" },
            { name: "Version Control (Git)", importance: "Recommended" }
        ]
    },
    {
        title: "Game Developer",
        description: "Design and develop immersive games for mobile, console, and PC platforms.",
        category: "Game Development",
        skills: [
            { name: "Unity", importance: "Required" },
            { name: "C#", importance: "Required" },
            { name: "Game Physics", importance: "Required" },
            { name: "Shader Programming", importance: "Optional" },
            { name: "Multiplayer Networking", importance: "Recommended" }
        ]
    },
    {
        title: "Android Developer",
        description: "Build native Android applications using Kotlin and Android SDK.",
        category: "Mobile Development",
        skills: [
            { name: "Kotlin", importance: "Required" },
            { name: "Jetpack Compose", importance: "Required" },
            { name: "Android SDK", importance: "Required" },
            { name: "REST API Integration", importance: "Required" },
            { name: "Firebase", importance: "Recommended" }
        ]
    },
    {
        title: "iOS Developer",
        description: "Build native iOS applications for Apple devices using Swift.",
        category: "Mobile Development",
        skills: [
            { name: "Swift", importance: "Required" },
            { name: "SwiftUI", importance: "Required" },
            { name: "Xcode", importance: "Required" },
            { name: "Core Data", importance: "Recommended" },
            { name: "App Store Deployment", importance: "Required" }
        ]
    },
    {
        title: "Database Administrator",
        description: "Manage, optimize, and secure relational and NoSQL databases.",
        category: "Web Development",
        skills: [
            { name: "SQL", importance: "Required" },
            { name: "PostgreSQL", importance: "Required" },
            { name: "MongoDB", importance: "Recommended" },
            { name: "Query Optimization", importance: "Required" },
            { name: "Backup & Recovery", importance: "Required" }
        ]
    },
    {
        title: "Scrum Master / Agile Coach",
        description: "Facilitate agile ceremonies and coach teams to improve delivery and processes.",
        category: "Business",
        skills: [
            { name: "Scrum Framework", importance: "Required" },
            { name: "Jira", importance: "Required" },
            { name: "Team Facilitation", importance: "Required" },
            { name: "Conflict Resolution", importance: "Recommended" },
            { name: "Kanban", importance: "Optional" }
        ]
    },
];

const seedEmergingRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB...\n");

        let created = 0, skipped = 0, skillsAdded = 0;

        for (const r of emergingRoles) {
            let role = await Role.findOne({ title: r.title });
            if (!role) {
                role = await Role.create({ title: r.title, description: r.description, category: r.category });
                console.log(`✅ Created Role: ${r.title}`);
                created++;
            } else {
                console.log(`⏭️  Skipped (exists): ${r.title}`);
                skipped++;
            }

            for (const s of r.skills) {
                let skill = await Skill.findOne({ name: s.name });
                if (!skill) {
                    skill = await Skill.create({ name: s.name, category: r.category, description: `Essential for ${r.title}` });
                    console.log(`   + Skill: ${s.name}`);
                    skillsAdded++;
                }

                const exists = await RoleSkill.findOne({ role: role._id, skill: skill._id });
                if (!exists) {
                    await RoleSkill.create({ role: role._id, skill: skill._id, importance: s.importance });
                }
            }
        }

        console.log(`\n🎉 Done! ${created} roles created, ${skipped} already existed, ${skillsAdded} new skills added.`);
        await mongoose.connection.close();
    } catch (err) {
        console.error("❌ Seeding Failed:", err.message);
        process.exit(1);
    }
};

seedEmergingRoles();
