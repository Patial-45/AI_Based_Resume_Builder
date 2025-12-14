// server.js (top)
import 'dotenv/config'; // <<< MUST be first to load env vars before any other import
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import matchRoutes from './routes/match.routes.js';
import jobRoutes from './routes/job.routes.js';
import resumeBuilderRoutes from './routes/resumeBuilder.routes.js';

// dotenv already loaded above, no need to call dotenv.config() here

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resume-builder', resumeBuilderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    env: {
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasMongoURI: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// MongoDB Connection
connectDB().then(() => {
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);
  });
}).catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

export default app;
