import express from 'express';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
  updateResume
} from '../controllers/resume.controller.js';

const router = express.Router();

router.post('/', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getResumes);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);
router.put('/:id', protect, updateResume);

export default router;

