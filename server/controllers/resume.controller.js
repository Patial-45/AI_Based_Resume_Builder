import Resume from '../models/Resume.js';
import { parseResume } from '../services/resumeParser.js';
import { getEmbedding } from '../services/aiService.js';
import fs from 'fs';

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { extractedText, sections } = await parseResume(
      req.file.path,
      req.file.mimetype
    );

    // Generate embedding, but don't let it break upload
    let embedding = null;
    try {
      embedding = await getEmbedding(extractedText);
    } catch (embedErr) {
      console.error('⚠️ Embedding generation threw an error (should be rare now):', embedErr.message);
      // keep embedding = null and continue
    }

    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      extractedText,
      sections,
      embedding    // can be null
    });

    res.status(201).json(resume);
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('❌ Error in uploadResume:', error);
    res.status(500).json({ message: error.message || 'Failed to upload resume' });
  }
};


export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 })
      .select('-embedding');
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('-embedding');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Delete file
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    // Soft delete
    resume.isActive = false;
    await resume.save();

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).select('-embedding');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

