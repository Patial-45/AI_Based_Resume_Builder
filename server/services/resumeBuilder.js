import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate ATS-friendly resume based on job description
export const generateATSResume = async (jobDescription, userInfo = {}, existingResume = null) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) resume writer. Create an ATS-friendly resume optimized for the following job description.

JOB DESCRIPTION:
${jobDescription}

USER INFORMATION:
${JSON.stringify(userInfo, null, 2)}

${existingResume ? `EXISTING RESUME (use as reference but optimize for the job):
${existingResume}` : ''}

Create a complete, ATS-friendly resume with the following sections:

1. **Professional Summary** (2-3 sentences)
   - Highlight relevant experience and key skills
   - Include job title and years of experience
   - Use keywords from the job description

2. **Professional Experience** (3-5 entries)
   - Use bullet points with quantifiable achievements
   - Start each bullet with action verbs (Developed, Implemented, Managed, etc.)
   - Include metrics and numbers where possible
   - Match keywords from job description
   - Use present tense for current role, past tense for previous roles

3. **Skills** (Technical and Soft Skills)
   - List all relevant technical skills from job description
   - Include proficiency levels if applicable
   - Group by category (Programming Languages, Frameworks, Tools, etc.)

4. **Education**
   - Degree, institution, graduation year
   - Relevant coursework or achievements

5. **Certifications** (if applicable)
   - Relevant professional certifications

6. **Projects** (if applicable, especially for tech roles)
   - Brief description with technologies used

IMPORTANT ATS OPTIMIZATION RULES:
- Use standard section headings: "Professional Summary", "Experience", "Skills", "Education"
- Include keywords from job description naturally
- Use standard date formats (MM/YYYY or Month YYYY)
- Avoid graphics, tables, or complex formatting
- Use standard fonts (Arial, Calibri, Times New Roman)
- Keep formatting simple and clean
- Use bullet points, not paragraphs
- Quantify achievements with numbers

Return the resume in JSON format:
{
  "summary": "Professional summary text here",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "MM/YYYY - Present",
      "achievements": [
        "Achievement 1 with metrics",
        "Achievement 2 with metrics"
      ]
    }
  ],
  "skills": {
    "technical": ["Skill1", "Skill2"],
    "soft": ["Skill1", "Skill2"],
    "tools": ["Tool1", "Tool2"]
  },
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "YYYY",
      "details": "Optional details"
    }
  ],
  "certifications": ["Certification 1", "Certification 2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "atsScore": 85,
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert ATS resume writer. Always return valid JSON. Focus on keyword optimization and quantifiable achievements.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const resumeData = JSON.parse(content);
    
    // Validate and structure the response
    return {
      summary: resumeData.summary || '',
      experience: resumeData.experience || [],
      skills: resumeData.skills || { technical: [], soft: [], tools: [] },
      education: resumeData.education || [],
      certifications: resumeData.certifications || [],
      projects: resumeData.projects || [],
      keywords: resumeData.keywords || [],
      atsScore: resumeData.atsScore || 0,
      recommendations: resumeData.recommendations || []
    };
  } catch (error) {
    console.error('Error generating ATS resume:', error);
    throw new Error(`Failed to generate ATS resume: ${error.message}`);
  }
};

// Analyze resume and provide real-time improvement suggestions
export const analyzeResumeForJob = async (resumeText, jobDescription, resumeSections) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `Analyze this resume against the job description and provide detailed, actionable recommendations to improve the match score.

RESUME TEXT:
${resumeText}

RESUME SECTIONS:
${JSON.stringify(resumeSections, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Provide a detailed analysis in JSON format:
{
  "currentScore": 75,
  "targetScore": 90,
  "sectionAnalysis": {
    "summary": {
      "score": 70,
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "suggestions": [
        {
          "action": "Add keyword 'React'",
          "location": "Professional Summary",
          "impact": "high",
          "expectedScoreIncrease": 5,
          "example": "Add: 'Experienced React developer with...'"
        }
      ],
      "beforeAfter": {
        "before": "Current summary text",
        "after": "Improved summary text with suggestions"
      }
    },
    "experience": {
      "score": 75,
      "strengths": ["Strength 1"],
      "weaknesses": ["Weakness 1"],
      "suggestions": [
        {
          "action": "Add metrics to achievement",
          "location": "Experience section, first bullet",
          "impact": "high",
          "expectedScoreIncrease": 3,
          "example": "Change 'Developed web application' to 'Developed web application serving 10,000+ users'"
        }
      ],
      "beforeAfter": [
        {
          "before": "Original bullet point",
          "after": "Improved bullet point with metrics"
        }
      ]
    },
    "skills": {
      "score": 80,
      "missingKeywords": ["React", "TypeScript"],
      "suggestions": [
        {
          "action": "Add missing skill",
          "skill": "React",
          "impact": "high",
          "expectedScoreIncrease": 4,
          "whereToAdd": "Skills section, Technical Skills"
        }
      ]
    },
    "education": {
      "score": 85,
      "suggestions": []
    }
  },
  "keywordAnalysis": {
    "matchedKeywords": ["keyword1", "keyword2"],
    "missingKeywords": [
      {
        "keyword": "React",
        "importance": "high",
        "frequency": 5,
        "suggestedLocations": ["Skills", "Experience", "Summary"]
      }
    ],
    "keywordDensity": {
      "optimal": 2.5,
      "current": 1.8
    }
  },
  "priorityActions": [
    {
      "priority": 1,
      "action": "Add 'React' to skills section",
      "impact": "high",
      "expectedScoreIncrease": 5,
      "timeToImplement": "2 minutes"
    }
  ],
  "estimatedScoreAfterImprovements": 88
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert resume analyzer. Provide detailed, actionable recommendations. Always return valid JSON.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(content);
    
    // Validate structure
    return {
      currentScore: analysis.currentScore || 0,
      targetScore: analysis.targetScore || 100,
      sectionAnalysis: analysis.sectionAnalysis || {},
      keywordAnalysis: analysis.keywordAnalysis || {},
      priorityActions: analysis.priorityActions || [],
      estimatedScoreAfterImprovements: analysis.estimatedScoreAfterImprovements || 0
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error(`Failed to analyze resume: ${error.message}`);
  }
};

// Generate improved resume section based on suggestions
export const improveResumeSection = async (sectionName, currentContent, jobDescription, suggestions) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `Improve the following resume section based on the job description and suggestions.

SECTION: ${sectionName}
CURRENT CONTENT:
${currentContent}

JOB DESCRIPTION:
${jobDescription}

SUGGESTIONS:
${JSON.stringify(suggestions, null, 2)}

Provide an improved version that:
1. Incorporates all suggestions
2. Maintains the original meaning and truthfulness
3. Adds relevant keywords naturally
4. Improves ATS compatibility
5. Uses quantifiable achievements where possible

Return ONLY the improved content, not JSON.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert resume writer. Improve the content while maintaining accuracy and truthfulness.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5
    });

    return response.choices[0]?.message?.content || currentContent;
  } catch (error) {
    console.error('Error improving resume section:', error);
    throw new Error(`Failed to improve resume section: ${error.message}`);
  }
};








