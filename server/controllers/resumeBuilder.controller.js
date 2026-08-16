import { generateATSResume, analyzeResumeForJob, improveResumeSection } from '../services/resumeBuilder.js';
import Resume from '../models/Resume.js';
import JobDescription from '../models/JobDescription.js';

export const generateResume = async (req, res) => {
  try {
    const { jobDescriptionId, jdText, userInfo, existingResumeId } = req.body;

    if (!jdText && !jobDescriptionId) {
      return res.status(400).json({ message: 'Job description is required' });
    }

    let jobDescription = '';
    if (jobDescriptionId) {
      const jd = await JobDescription.findOne({
        _id: jobDescriptionId,
        userId: req.user._id
      });
      if (!jd) {
        return res.status(404).json({ message: 'Job description not found' });
      }
      jobDescription = jd.description;
    } else {
      jobDescription = jdText;
    }

    let existingResume = null;
    if (existingResumeId) {
      const resume = await Resume.findOne({
        _id: existingResumeId,
        userId: req.user._id
      });
      if (resume) {
        existingResume = resume.extractedText;
      }
    }

    const atsResume = await generateATSResume(
      jobDescription,
      userInfo || {},
      existingResume
    );

    res.json(atsResume);
  } catch (error) {
    console.error('Error generating resume:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate resume' 
    });
  }
};

export const analyzeResume = async (req, res) => {
  try {
    const { resumeId, jobDescriptionId, jdText } = req.body;

    if (!resumeId) {
      return res.status(400).json({ message: 'Resume ID is required' });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    let jobDescription = '';
    if (jobDescriptionId) {
      const jd = await JobDescription.findOne({
        _id: jobDescriptionId,
        userId: req.user._id
      });
      if (!jd) {
        return res.status(404).json({ message: 'Job description not found' });
      }
      jobDescription = jd.description;
    } else if (jdText) {
      jobDescription = jdText;
    } else {
      return res.status(400).json({ message: 'Job description is required' });
    }

    const analysis = await analyzeResumeForJob(
      resume.extractedText,
      jobDescription,
      resume.sections || {}
    );

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to analyze resume' 
    });
  }
};

export const improveSection = async (req, res) => {
  try {
    const { sectionName, currentContent, jobDescriptionId, jdText, suggestions } = req.body;

    if (!sectionName || !currentContent) {
      return res.status(400).json({ message: 'Section name and content are required' });
    }

    let jobDescription = '';
    if (jobDescriptionId) {
      const jd = await JobDescription.findOne({
        _id: jobDescriptionId,
        userId: req.user._id
      });
      if (jd) {
        jobDescription = jd.description;
      }
    } else if (jdText) {
      jobDescription = jdText;
    }

    const improvedContent = await improveResumeSection(
      sectionName,
      currentContent,
      jobDescription,
      suggestions || []
    );

    res.json({ 
      improvedContent,
      sectionName 
    });
  } catch (error) {
    console.error('Error improving section:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to improve section' 
    });
  }
};








