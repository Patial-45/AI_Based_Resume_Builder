import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../app.js';
import { loadConfig } from '../config/environment.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import RateBucket from '../models/RateBucket.js';
import OperationLease from '../models/OperationLease.js';
import Resume from '../models/Resume.js';
delete process.env.OPENAI_API_KEY; delete process.env.GROQ_API_KEY;
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-browser-test-'));
// Cold Windows starts can exceed the library's 10-second default. This is a
// test-process startup allowance, not a relaxation of application deadlines.
const mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 }, binary: { downloadDir: fileURLToPath(new URL('../node_modules/.cache/mongodb-memory-server/', import.meta.url)) } });
const config = loadConfig({ NODE_ENV: 'test', JWT_SECRET: '7fbdcd019a55475a949cdd2c3beea4c1ab17462b3e4a42fa9b7ed1714179fc71', MONGODB_URI: mongo.getUri(), UPLOAD_PATH: root, CLIENT_URL: 'http://localhost:5178' });
await mongoose.connect(config.mongoUri);
await Promise.all([User.init(), Session.init(), RateBucket.init(), OperationLease.init(), Resume.init()]);
const fixture = express();
if (process.env.M1_DIAGNOSTICS === '1') {
  mongoose.set('debug', (collection, method) => console.log('fixture-db', collection, method));
  fixture.use((req, res, next) => {
    const started = Date.now();
    console.log('fixture-request', req.method, req.path, req.get('Content-Type'), req.get('Content-Length'));
    req.once('end', () => console.log('fixture-body-ended', req.method, req.path));
    res.once('finish', () => console.log('fixture-response', req.method, req.path, res.statusCode, Date.now() - started));
    next();
  });
}
fixture.use(createApp({ config }));
const server = fixture.listen(5081, '127.0.0.1', () => console.log('Isolated browser fixture ready on 5081'));
let stopping = false;
async function stop() {
  if (stopping) return; stopping = true;
  server.close(); await mongoose.disconnect(); await mongo.stop(); await fs.rm(root, { recursive: true, force: true }); process.exit(0);
}
process.once('SIGINT', stop); process.once('SIGTERM', stop);


