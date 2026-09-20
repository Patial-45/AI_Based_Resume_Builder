import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import { loadConfig } from './config/environment.js';
import { HttpError, errorHandler, requestContext } from './middleware/errors.js';
import { rateLimit } from './middleware/limits.js';
import authRoutes from './routes/auth.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import matchRoutes from './routes/match.routes.js';
import jobRoutes from './routes/job.routes.js';
import builderRoutes from './routes/resumeBuilder.routes.js';
export function createApp({ config = loadConfig(), logger = record => console.error(JSON.stringify(record)), readiness = () => mongoose.connection.readyState === 1 } = {}) {
  const app = express();
  app.locals.config = config; app.locals.logger = logger;
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(requestContext);
  app.use(helmet({ strictTransportSecurity: config.production ? undefined : false }));
  app.use(cors({
    origin(origin, done) { done(origin && origin !== config.origin ? new HttpError(403, 'ORIGIN_REJECTED', 'Request origin is not allowed.') : null, origin === config.origin); },
    credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token']
  }));
  app.use((req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('Sec-Fetch-Site') === 'cross-site') return next(new HttpError(403, 'ORIGIN_REJECTED', 'Cross-site request rejected.'));
    next();
  });
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/ready', (req, res) => res.status(readiness() ? 200 : 503).json({ status: readiness() ? 'ready' : 'unavailable' }));
  app.use('/api', rateLimit('api-ip', 150, 60000));
  app.use(express.json({ limit: '128kb' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/resumes', resumeRoutes);
  app.use('/api/match', matchRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/resume-builder', builderRoutes);
  // No public upload static mount. Unknown routes always return JSON.
  app.use((req, res, next) => next(new HttpError(404, 'NOT_FOUND', 'This endpoint was not found.')));
  app.use(errorHandler);
  return app;
}

