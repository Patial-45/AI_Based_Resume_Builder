import { validateIdentifiers } from '../middleware/validation.js';
import { expensiveOperation, rateLimit, userKey } from '../middleware/limits.js';
import { HttpError } from '../middleware/errors.js';
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  scanJobs,
  getRecommendedJobs,
  getJobById,
  saveJob,
  getSavedJobs,
  markJobAsApplied,
  ignoreJob
} from '../controllers/job.controller.js';

const router = express.Router();

router.post('/scan', protect, validateIdentifiers, (req, res, next) => next(new HttpError(503, 'SCANNER_UNAVAILABLE', 'Job scanning is being upgraded. Saved job activity remains available.')));
router.get('/recommended', protect, validateIdentifiers, getRecommendedJobs);
router.get('/saved', protect, validateIdentifiers, getSavedJobs);
router.get('/:id', protect, validateIdentifiers, getJobById);
router.post('/:id/save', protect, validateIdentifiers, saveJob);
router.post('/:id/apply', protect, validateIdentifiers, markJobAsApplied);
router.post('/:id/ignore', protect, validateIdentifiers, ignoreJob);

export default router;
