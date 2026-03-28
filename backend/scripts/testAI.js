const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const testRoadmap = async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const missingSkills = [{ skill: "React.js", priority: "High", explanation: "Core frontend library" }];
    const userLevel = "Beginner";

    const prompt = `
    Generate a personalized learning roadmap for the following missing skills.
    Missing Skills: ${JSON.stringify(missingSkills)}
    User Current Level: ${userLevel}

    Return a JSON object in this format:
    {
      "estimatedDurationWeeks": 12,
      "roadmap": [
        {
          "skill": "Skill Name",
          "durationWeeks": 2,
          "modules": [
            { "week": 1, "topics": ["Topic A", "Topic B"], "practiceFocus": "Hands-on project X" }
          ]
        }
      ]
    }
    ONLY return the JSON object.
  `;

    try {
        console.log("Sending complex roadmap prompt to gemini-2.5-flash...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Raw Response received.");
        console.log("--- START RAW ---");
        console.log(text);
        console.log("--- END RAW ---");

        // Robust JSON extraction
        let jsonStr = text;
        if (text.includes("```json")) {
            jsonStr = text.split("```json")[1].split("```")[0];
        } else if (text.includes("```")) {
            jsonStr = text.split("```")[1].split("```")[0];
        }

        console.log("Extracted string:", jsonStr.trim());

        try {
            const parsed = JSON.parse(jsonStr.trim());
            console.log("✅ PARSE SUCCESSFUL");
            console.log("Parsed keys:", Object.keys(parsed));
            if (parsed.roadmap && parsed.roadmap.length > 0) {
                console.log("Roadmap is valid.");
            } else {
                console.log("Roadmap is empty!");
            }
        } catch (pe) {
            console.error("❌ PARSE FAILED:", pe.message);
        }

    } catch (error) {
        console.error("❌ API ERROR:", error.message);
    }
};

testRoadmap();
