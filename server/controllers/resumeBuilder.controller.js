import { HttpError } from '../middleware/errors.js';
import { generateATSResume, analyzeResumeForJob, improveResumeSection } from '../services/resumeBuilder.js';
import Resume from '../models/Resume.js';
import JobDescription from '../models/JobDescription.js';

export const generateResume = async (req, res, next) => {
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
      const resume = await Resume.findOne({ isActive: true,
        _id: existingResumeId,
        userId: req.user._id
      });
      if (!resume) throw new HttpError(404, 'NOT_FOUND', 'Resume not found.');
      if (resume.reviewStatus !== 'ready') throw new HttpError(409, 'REVIEW_REQUIRED', 'Review and save this resume in your library first.');
      existingResume = resume.extractedText;
    }

    const atsResume = await generateATSResume(
      jobDescription,
      userInfo || {},
      existingResume
    );

    res.json(atsResume);
  } catch (error) {
    /* Provider payloads and account data must not be logged. */
    next(error);
  }
};

export const analyzeResume = async (req, res, next) => {
  try {
    const { resumeId, jobDescriptionId, jdText } = req.body;

    if (!resumeId) {
      return res.status(400).json({ message: 'Resume ID is required' });
    }

    const resume = await Resume.findOne({ isActive: true,
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    if (resume.reviewStatus !== 'ready') throw new HttpError(409, 'REVIEW_REQUIRED', 'Open this resume in your library and save reviewed content before using it for analysis.');

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
    /* Provider payloads and account data must not be logged. */
    next(error);
  }
};

export const improveSection = async (req, res, next) => {
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
    /* Provider payloads and account data must not be logged. */
    next(error);
  }
};
