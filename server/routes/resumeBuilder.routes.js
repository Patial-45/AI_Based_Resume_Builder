import { resumeMutation } from '../middleware/resumeLimits.js';
import { validateIdentifiers } from '../middleware/validation.js';
import { expensiveOperation, rateLimit, userKey } from '../middleware/limits.js';
import { HttpError } from '../middleware/errors.js';
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  generateResume,
  analyzeResume,
  improveSection
} from '../controllers/resumeBuilder.controller.js';

const router = express.Router();

router.post('/generate', protect, validateIdentifiers, rateLimit('ai-user', 20, 3600000, userKey), expensiveOperation, resumeMutation, generateResume);
router.post('/analyze', protect, validateIdentifiers, rateLimit('ai-user', 20, 3600000, userKey), expensiveOperation, resumeMutation, analyzeResume);
router.post('/improve-section', protect, validateIdentifiers, rateLimit('ai-user', 20, 3600000, userKey), expensiveOperation, resumeMutation, improveSection);

export default router;
