import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';

export const parseResume = async (filePath, mimeType) => {
  try {
    let extractedText = '';

    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else {
      throw new Error('Unsupported file type');
    }

    // Clean and structure the text
    const sections = extractSections(extractedText);

    return {
      extractedText,
      sections
    };
  } catch (error) {
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
};

const extractSections = (text) => {
  const sections = {
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: []
  };

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let currentSection = null;
  let currentExperience = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    // Detect section headers
    if (line.match(/^(summary|profile|objective|about)/)) {
      currentSection = 'summary';
      sections.summary = lines[i + 1] || '';
      continue;
    }

    if (line.match(/^(experience|work experience|employment|professional experience)/)) {
      currentSection = 'experience';
      continue;
    }

    if (line.match(/^(education|academic)/)) {
      currentSection = 'education';
      continue;
    }

    if (line.match(/^(skills|technical skills|core competencies)/)) {
      currentSection = 'skills';
      continue;
    }

    if (line.match(/^(certifications|certificates)/)) {
      currentSection = 'certifications';
      continue;
    }

    // Parse experience entries (basic pattern matching)
    if (currentSection === 'experience') {
      // Look for job title patterns
      if (line.match(/\b(software engineer|developer|manager|analyst|consultant|director|lead|senior|junior)\b/i)) {
        if (currentExperience) {
          sections.experience.push(currentExperience);
        }
        currentExperience = {
          title: lines[i],
          company: '',
          duration: '',
          description: ''
        };
      } else if (currentExperience && line.match(/^\d{4}|\w+\s+\d{4}/)) {
        currentExperience.duration = lines[i];
      } else if (currentExperience && lines[i].length > 10) {
        currentExperience.description += (currentExperience.description ? ' ' : '') + lines[i];
      }
    }

    // Parse skills (comma-separated or bullet points)
    if (currentSection === 'skills') {
      const skills = lines[i].split(/[,;•\-\*]/).map(s => s.trim()).filter(s => s.length > 0);
      sections.skills.push(...skills);
    }

    // Parse education
    if (currentSection === 'education') {
      if (line.match(/\b(bachelor|master|phd|degree|diploma|certificate)\b/i)) {
        sections.education.push({
          degree: lines[i],
          institution: lines[i + 1] || '',
          year: lines[i + 2] || ''
        });
      }
    }
  }

  // Add last experience entry
  if (currentExperience) {
    sections.experience.push(currentExperience);
  }

  return sections;
};

