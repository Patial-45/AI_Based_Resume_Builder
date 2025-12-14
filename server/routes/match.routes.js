import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  matchResumeWithJDController,
  getMatches,
  getMatchById,
  getKeywordSuggestions
} from '../controllers/match.controller.js';

const router = express.Router();

router.post('/', protect, matchResumeWithJDController);
router.get('/', protect, getMatches);
router.get('/suggestions/:matchId', protect, getKeywordSuggestions);
router.get('/:id', protect, getMatchById);

export default router;

