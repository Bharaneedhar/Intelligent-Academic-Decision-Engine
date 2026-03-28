const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const testModel = async (modelName) => {
    console.log(`Testing ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello!");
        console.log(`✅ ${modelName} is available.`);
    } catch (err) {
        console.error(`❌ ${modelName} failed:`, err.message);
    }
};

const run = async () => {
    await testModel("gemini-flash-latest");
    await testModel("gemini-pro");
    await testModel("gemini-2.5-flash"); // Test this again too
};

run();
