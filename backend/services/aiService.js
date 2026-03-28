const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = ["gemini-2.5-flash", "gemini-flash-latest"];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for robust JSON extraction
const extractJSON = (text) => {
  try {
    let jsonStr = text;
    if (text.includes("```json")) {
      jsonStr = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
      jsonStr = text.split("```")[1].split("```")[0];
    } else {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        jsonStr = text.substring(start, end + 1);
      }
    }

    // Remove trailing commas which break JSON.parse
    const cleanedStr = jsonStr.trim().replace(/,(\s*[\]}])/g, '$1');
    return JSON.parse(cleanedStr);
  } catch (err) {
    console.error("JSON Extraction Error:", err);
    console.error("Raw Text was:", text);
    throw new Error("Failed to parse AI response into JSON");
  }
};

// Wrapper for model fallback
const generateWithFallback = async (prompt) => {
  let lastError = null;

  for (let i = 0; i < MODELS.length; i++) {
    const modelName = MODELS[i];
    try {
      console.log(`AI: Attempting generation with ${modelName}...`);
      const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return extractJSON(text);
    } catch (error) {
      lastError = error;
      console.warn(`AI: Model ${modelName} failed or returned invalid JSON. Error: ${error.message}`);
      if (i < MODELS.length - 1) {
        console.log('AI: Waiting 1s before trying next model...');
        await delay(1000);
      }
    }
  }

  throw new Error(`AI Generation totally failed after trying all models: ${lastError?.message}`);
};

// Wrapper for text-based model fallback
const generateTextWithFallback = async (prompt) => {
  let lastError = null;

  for (const modelName of MODELS) {
    try {
      console.log(`AI (Text): Attempting generation with ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      lastError = error;
      console.warn(`AI (Text): Model ${modelName} failed. Error: ${error.message}`);
    }
  }

  throw new Error(`AI Text Generation failed after trying all models: ${lastError?.message}`);
};

const generateSkillGapAnalysis = async (userSkills, requiredSkills) => {
  const prompt = `
    Compare the following user skills with the required skills for the role.
    User Skills: ${JSON.stringify(userSkills)}
    Required Skills: ${JSON.stringify(requiredSkills)}

    Return a JSON object in this format:
    {
      "missingSkills": [
        { "skill": "Skill Name", "priority": "High/Medium/Low", "explanation": "Why this is needed" }
      ],
      "aiSummary": "A brief overview of the skill gap."
    }
    ONLY return the JSON object.
  `;
  return generateWithFallback(prompt);
};

const generateRoadmap = async (missingSkills, userLevel) => {
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
  return generateWithFallback(prompt);
};

const generateLearningMaterial = async (topic, skillName) => {
  const prompt = `
    Provide concise, high-quality learning material for the following topic.
    Skill: ${skillName}
    Topic: ${topic}

    The content should be:
    - Short and nicely understandable (approx 300-500 words).
    - Use Markdown for formatting (headers, bold text, bullet points).
    - Practical and focused on core concepts.
    - End with a "Key Takeaway" section.
    
    ONLY return the markdown content.
    `;
  return generateTextWithFallback(prompt);
};

const generateQuiz = async (skillName, moduleTopics) => {
  const prompt = `
    Generate a 5-question multiple choice quiz for the following skill and topics.
    Skill: ${skillName}
    Topics: ${JSON.stringify(moduleTopics)}

    IMPORTANT: You MUST return ONLY a valid JSON object, no markdown, no explanation.
    The correctAnswer MUST be the exact full text of one of the options.

    Format:
    {
      "quiz": [
        {
          "question": "What is...?",
          "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
          "correctAnswer": "Option A text"
        }
      ]
    }
  `;
  return generateWithFallback(prompt);
};

const generateRoleSkills = async (roleTitle) => {
  const prompt = `
    Identify the top 5-7 technical skills required for the career role: "${roleTitle}".
    
    Return a JSON object in this format:
    {
      "skills": [
        { "name": "Skill Name", "importance": "Required/Recommended/Optional", "category": "Tech Stack Category" }
      ]
    }
    ONLY return the JSON object.
  `;
  return generateWithFallback(prompt);
};

const generateRecommendations = async ({ role, skills, completedModules, progress }) => {
  const prompt = `
    You are an AI learning mentor for an edtech platform.
    
    Based on the following learner profile, recommend tailored opportunities and next steps:
    - Target Role: ${role || 'Not specified'}
    - Completed Skills: ${JSON.stringify(skills || [])}
    - Completed Modules: ${JSON.stringify(completedModules || [])}
    - Overall Learning Progress: ${typeof progress === 'number' ? progress : 'Not available'}%

    Return a JSON object in the EXACT format below (no markdown, no extra text):
    {
      "internships": ["title at organization - short justification"],
      "certifications": ["certification name - provider"],
      "technologies": ["technology or tool - why relevant"],
      "courses": ["course title - platform"],
      "projectIdeas": ["project idea - brief description"]
    }

    - Each array should contain 3-5 high quality, concise items.
    - Keep recommendations relevant to the role and skills.
    - Do NOT add any additional fields.
  `;

  return generateWithFallback(prompt);
};

module.exports = {
  generateSkillGapAnalysis,
  generateRoadmap,
  generateLearningMaterial,
  generateQuiz,
  generateRoleSkills,
  generateRecommendations,
};
