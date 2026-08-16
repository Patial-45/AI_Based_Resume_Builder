import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  generateResume,
  analyzeResume,
  improveSection
} from '../controllers/resumeBuilder.controller.js';

const router = express.Router();

router.post('/generate', protect, generateResume);
router.post('/analyze', protect, analyzeResume);
router.post('/improve-section', protect, improveSection);

export default router;








