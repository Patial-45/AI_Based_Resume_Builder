import OpenAI from 'openai';
import Groq from 'groq-sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Get embeddings using OpenAI
export const getEmbedding = async (text) => {
  // Guard: empty text
  if (!text || !text.trim()) {
    console.warn("⚠️ getEmbedding called with empty text. Returning null.");
    return null;
  }

  // Guard: missing API key
  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️ OPENAI_API_KEY is missing. Skipping embedding generation.");
    return null; // or throw new Error("OPENAI_API_KEY is missing");
  }

  try {
    // Optional: truncate very large text to avoid token limits / huge cost
    const safeText = text.length > 8000 ? text.slice(0, 8000) : text;

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: safeText,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("❌ Error getting embedding:");
    console.error("Message:", error.message);
    console.error("Response data:", error.response?.data);
    // Instead of killing the whole request, just return null
    return null;
    // If you *want* to fail hard, use:
    // throw new Error("Failed to generate embedding");
  }
};



// Calculate cosine similarity
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB)) {
    throw new Error('Both vectors must be arrays');
  }
  
  if (vecA.length !== vecB.length) {
    throw new Error(`Vectors must have the same length. Got ${vecA.length} and ${vecB.length}`);
  }

  if (vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i] || 0;
    const b = vecB[i] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
};

// Match resume with job description using OpenAI
export const matchResumeWithJD = async (resumeText, jdText, resumeSections) => {
  // Guard: missing API key
  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️ OPENAI_API_KEY is missing. Cannot perform AI matching.");
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.');
  }

  // Guard: empty inputs
  if (!resumeText || !resumeText.trim()) {
    throw new Error('Resume text is required');
  }
  if (!jdText || !jdText.trim()) {
    throw new Error('Job description text is required');
  }

  try {
    const prompt = `You are an expert resume analyzer. Analyze the match between a resume and a job description.

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jdText}

RESUME SECTIONS:
${JSON.stringify(resumeSections, null, 2)}

Please provide:
1. Overall match score (0-100)
2. Score breakdown:
   - Semantic Match (0-100): How well the experience and skills align
   - Keyword Match (0-100): How many keywords from JD are present in resume
   - Role Alignment (0-100): How well the role matches career progression
3. Missing keywords (array of objects with: keyword, category, importance: high/medium/low, suggestion)
4. Recommendations (array of objects with: section, suggestion, priority: high/medium/low)
5. Strengths (array of strings)
6. Weaknesses (array of strings)

Return ONLY valid JSON in this format:
{
  "overallScore": 75,
  "scoreBreakdown": {
    "semanticMatch": 80,
    "keywordMatch": 70,
    "roleAlignment": 75
  },
  "missingKeywords": [
    {
      "keyword": "React",
      "category": "Technical Skills",
      "importance": "high",
      "suggestion": "Add React to your skills section and mention it in relevant projects"
    }
  ],
  "recommendations": [
    {
      "section": "Experience",
      "suggestion": "Quantify achievements with metrics",
      "priority": "high"
    }
  ],
  "strengths": ["Strong backend experience", "Relevant certifications"],
  "weaknesses": ["Missing some required technologies", "Could use more quantifiable achievements"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are an expert resume analyzer. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      const result = JSON.parse(content);
      
      // Validate result structure
      if (!result.overallScore && result.overallScore !== 0) {
        throw new Error('Invalid response format: missing overallScore');
      }
      
      // Ensure all required fields exist
      return {
        overallScore: result.overallScore || 0,
        scoreBreakdown: {
          semanticMatch: result.scoreBreakdown?.semanticMatch || 0,
          keywordMatch: result.scoreBreakdown?.keywordMatch || 0,
          roleAlignment: result.scoreBreakdown?.roleAlignment || 0
        },
        missingKeywords: result.missingKeywords || [],
        recommendations: result.recommendations || [],
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || []
      };
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Response content:', content);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  } catch (error) {
    console.error('Error matching resume with JD:', error);
    
    // Provide more specific error messages
    if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    } else if (error.response?.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to match resume with job description. Please try again.');
    }
  }
};

// Find jobs using Llama (Groq) for job portal scanning
export const findRelevantJobs = async (resumeText, resumeSections, userPreferences = {}) => {
  try {
    const prompt = `Based on the following resume, help identify the best job search queries and keywords to find relevant jobs on job portals like Naukri, LinkedIn, Glassdoor, iimjobs, Indeed, Unstop, Foundit, and other major job platforms.

RESUME TEXT:
${resumeText}

RESUME SECTIONS:
${JSON.stringify(resumeSections, null, 2)}

USER PREFERENCES:
${JSON.stringify(userPreferences, null, 2)}

Please provide:
1. Job title suggestions (array of 5-10 relevant job titles)
2. Key skills to search for (array of 10-15 skills)
3. Industry keywords (array of 5-8 keywords)
4. Search queries (array of 3-5 search query strings optimized for job portals including Indian platforms like Naukri, iimjobs, Unstop, and Foundit)

Note: For Indian job portals (Naukri, iimjobs, Foundit), consider using common Indian job titles and terminology. For platforms like Unstop, focus on entry-level and fresher positions.

Return ONLY valid JSON in this format:
{
  "jobTitles": ["Software Engineer", "Full Stack Developer"],
  "keySkills": ["JavaScript", "React", "Node.js"],
  "industryKeywords": ["Tech", "SaaS", "E-commerce"],
  "searchQueries": [
    "software engineer javascript react",
    "full stack developer node.js",
    "frontend developer react typescript"
  ]
}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a job search expert. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Error finding relevant jobs:', error);
    throw new Error('Failed to find relevant jobs');
  }
};

// Generate keyword suggestions using OpenAI
export const generateKeywordSuggestions = async (resumeText, jdText) => {
  try {
    const prompt = `Analyze the job description and resume to suggest keywords that should be added to the resume to improve match score.

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jdText}

Provide an array of keyword suggestions with:
- keyword: the keyword to add
- category: Technical Skills, Soft Skills, Tools, Certifications, etc.
- importance: high, medium, or low
- whereToAdd: specific section suggestion
- example: example of how to incorporate it

Return ONLY valid JSON array:
[
  {
    "keyword": "Docker",
    "category": "Tools",
    "importance": "high",
    "whereToAdd": "Skills section and Experience section",
    "example": "Managed containerized applications using Docker in production environment"
  }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a career advisor. Always return valid JSON array.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return Array.isArray(result) ? result : result.suggestions || [];
  } catch (error) {
    console.error('Error generating keyword suggestions:', error);
    throw new Error('Failed to generate keyword suggestions');
  }
};

