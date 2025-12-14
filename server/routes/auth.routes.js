import express from 'express';
import { body, validationResult } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }
    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    next();
  }
};

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Test endpoint to check if route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working', timestamp: new Date().toISOString() });
});

// Debug middleware to log request
router.post('/register', (req, res, next) => {
  console.log('=== REGISTER REQUEST ===');
  console.log('Body:', { 
    name: req.body?.name, 
    email: req.body?.email, 
    hasPassword: !!req.body?.password 
  });
  console.log('Headers:', req.headers);
  next();
}, registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;

