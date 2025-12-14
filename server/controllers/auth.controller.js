import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Please set it in your .env file.');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('Registration attempt:', { name, email: email?.substring(0, 5) + '...', hasPassword: !!password });

    // Validate input
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    console.log('User created successfully:', user._id);

    // Check JWT_SECRET before generating token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ 
        message: 'Server configuration error. Please contact support.' 
      });
    }

    const token = generateToken(user._id);
    console.log('Token generated successfully');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      console.error('Duplicate key error - user already exists');
      return res.status(400).json({ 
        message: 'User with this email already exists',
        error: 'DUPLICATE_EMAIL'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Validation error:', messages);
      return res.status(400).json({ 
        message: messages[0] || 'Validation error',
        errors: messages,
        error: 'VALIDATION_ERROR'
      });
    }
    
    // Handle JWT errors
    if (error.message && error.message.includes('JWT_SECRET')) {
      console.error('JWT_SECRET missing');
      return res.status(500).json({ 
        message: 'Server configuration error. Please contact support.',
        error: 'CONFIG_ERROR'
      });
    }
    
    // Handle MongoDB connection errors
    if (error.name === 'MongoServerError' || error.message?.includes('Mongo')) {
      console.error('MongoDB error');
      return res.status(500).json({ 
        message: 'Database connection error. Please try again later.',
        error: 'DATABASE_ERROR'
      });
    }
    
    console.error('Unknown error type');
    res.status(500).json({ 
      message: error.message || 'Registration failed. Please try again.',
      error: 'UNKNOWN_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed. Please try again.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, preferences },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

