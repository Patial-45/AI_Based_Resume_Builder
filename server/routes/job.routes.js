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

router.post('/scan', protect, scanJobs);
router.get('/recommended', protect, getRecommendedJobs);
router.get('/saved', protect, getSavedJobs);
router.get('/:id', protect, getJobById);
router.post('/:id/save', protect, saveJob);
router.post('/:id/apply', protect, markJobAsApplied);
router.post('/:id/ignore', protect, ignoreJob);

export default router;

