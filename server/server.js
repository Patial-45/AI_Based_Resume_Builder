import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { loadConfig } from './config/environment.js';
import connectDB from './config/database.js';
import Session from './models/Session.js';
import RateBucket from './models/RateBucket.js';
import OperationLease from './models/OperationLease.js';
import User from './models/User.js';
import Resume from './models/Resume.js';
try {
  const config = loadConfig();
  await connectDB(config);
  await Promise.all([User.init(), Session.init(), RateBucket.init(), OperationLease.init(), Resume.init()]);
  const app = createApp({ config });
  const server = app.listen(config.port, () => console.log('Resume Builder API listening on port ' + config.port));
  server.requestTimeout = 120000;
  server.headersTimeout = 15000;
  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    const timer = setTimeout(() => process.exit(1), 15000); timer.unref();
    server.close(async () => { await mongoose.disconnect(); clearTimeout(timer); process.exit(0); });
  };
  process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
} catch {
  console.error(JSON.stringify({ level: 'error', code: 'STARTUP_FAILED', message: 'Check required configuration and database connectivity.' }));
  await mongoose.disconnect();
  process.exitCode = 1;
}
