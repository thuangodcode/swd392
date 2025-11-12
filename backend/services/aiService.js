const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.5 Flash (latest and fastest FREE model)
// Fallback to other models if overloaded
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite'
];

/**
 * Try generating with multiple models (fallback if one is overloaded)
 */
async function generateWithRetry(generateFn) {
  let lastError;
  
  for (const modelName of MODELS) {
    try {
      console.log(`[Gemini] Trying model: ${modelName}`);
      return await generateFn(modelName);
    } catch (error) {
      console.log(`[Gemini] ${modelName} failed: ${error.message.split('\n')[0]}`);
      lastError = error;
      
      // If overloaded (503), try next model
      if (error.status === 503) {
        continue;
      }
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // All models failed
  throw lastError;
}

/**
 * Generate project description using Gemini AI
 * @param {string} projectName - The name of the project
 * @param {string} techStack - Technologies to be used (optional)
 * @param {string} additionalInfo - Any additional context (optional)
 * @returns {Promise<Object>} Generated content
 */
const generateProjectDescription = async (projectName, techStack = '', additionalInfo = '') => {
  try {
    return await generateWithRetry(async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `You are an expert academic advisor helping students create professional project descriptions for their group projects.

Project Name: ${projectName}
${techStack ? `Tech Stack: ${techStack}` : ''}
${additionalInfo ? `Additional Context: ${additionalInfo}` : ''}

Please generate a comprehensive project description that includes:
1. A clear overview of what the project does (2-3 paragraphs)
2. Main objectives (3-5 bullet points)
3. Suggested tech stack improvements if applicable

Format your response as JSON with the following structure:
{
  "description": "The main project description",
  "objectives": "Numbered list of objectives",
  "techStackSuggestions": ["suggestion1", "suggestion2"]
}

Make it professional, concise, and suitable for academic submission. Respond ONLY with valid JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response (Gemini sometimes adds markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return JSON.parse(text);
    });
  } catch (error) {
    console.error('Gemini AI Service Error:', error);
    throw new Error('Failed to generate project description. Please try again.');
  }
};

/**
 * Generate project name suggestions
 * @param {string} keywords - Keywords describing the project
 * @param {number} count - Number of suggestions to generate
 * @returns {Promise<Array>} Array of project name suggestions
 */
const generateProjectNameSuggestions = async (keywords, count = 5) => {
  try {
    return await generateWithRetry(async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Generate ${count} creative and professional project names based on these keywords: "${keywords}".

The project is for a university software engineering course (EXE101).

Requirements:
- Names should be catchy but professional
- Include tech-related terms when appropriate
- Suitable for academic presentation
- Mix of English names

Format as JSON: {"suggestions": ["name1", "name2", ...]}

Respond ONLY with valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.suggestions || [];
    }
    
    const parsed = JSON.parse(text);
    return parsed.suggestions || [];
    });
  } catch (error) {
    console.error('Gemini AI Service Error:', error);
    throw new Error('Failed to generate project name suggestions.');
  }
};

/**
 * Improve existing project description
 * @param {string} currentDescription - The current description
 * @returns {Promise<string>} Improved description
 */
const improveProjectDescription = async (currentDescription) => {
  try {
    return await generateWithRetry(async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Improve the following project description to make it more professional, clear, and comprehensive:

"${currentDescription}"

Enhance it by:
- Making it more structured and professional
- Adding clarity to technical aspects
- Ensuring it's suitable for academic submission
- Keeping the core idea but improving presentation

Return only the improved description as plain text, without any JSON formatting or additional explanations.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    });
  } catch (error) {
    console.error('Gemini AI Service Error:', error);
    throw new Error('Failed to improve project description.');
  }
};

/**
 * Generate project objectives based on description
 * @param {string} projectDescription - The project description
 * @returns {Promise<string>} Generated objectives
 */
const generateObjectives = async (projectDescription) => {
  try {
    return await generateWithRetry(async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Based on this project description, generate 3-5 clear, measurable objectives:

"${projectDescription}"

Format as a numbered list. Each objective should be:
- Specific and measurable
- Achievable for a student group project
- Relevant to the project scope
- Professional and academic-appropriate

Return only the numbered list, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    });
  } catch (error) {
    console.error('Gemini AI Service Error:', error);
    throw new Error('Failed to generate objectives.');
  }
};

/**
 * Check if Gemini AI is configured
 * @returns {boolean}
 */
const isAIEnabled = () => {
  return !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
};

module.exports = {
  generateProjectDescription,
  generateProjectNameSuggestions,
  improveProjectDescription,
  generateObjectives,
  isAIEnabled
};

