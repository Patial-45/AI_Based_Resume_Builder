import { resumeMutation } from '../middleware/resumeLimits.js';
import { validateIdentifiers } from '../middleware/validation.js';
import { expensiveOperation, rateLimit, userKey } from '../middleware/limits.js';
import { HttpError } from '../middleware/errors.js';
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  matchResumeWithJDController,
  getMatches,
  getMatchById,
  getKeywordSuggestions
} from '../controllers/match.controller.js';

const router = express.Router();

router.post('/', protect, validateIdentifiers, rateLimit('ai-user', 20, 3600000, userKey), expensiveOperation, resumeMutation, matchResumeWithJDController);
router.get('/', protect, validateIdentifiers, getMatches);
router.get('/suggestions/:matchId', protect, validateIdentifiers, rateLimit('ai-user', 20, 3600000, userKey), expensiveOperation, resumeMutation, getKeywordSuggestions);
router.get('/:id', protect, validateIdentifiers, getMatchById);

export default router;
