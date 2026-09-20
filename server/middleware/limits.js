import { createHmac, randomUUID } from 'node:crypto';
import RateBucket from '../models/RateBucket.js';
import OperationLease from '../models/OperationLease.js';
import { HttpError, asyncHandler } from './errors.js';
export const rateLimit = (kind, max, windowMs, key = req => req.ip) => asyncHandler(async (req, res, next) => {
  const now = Date.now(), window = Math.floor(now / windowMs);
  const identity = createHmac('sha256', req.app.locals.config.secret).update(String(key(req))).digest('hex');
  const id = kind + ':' + identity + ':' + window;
  const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * windowMs) } };
  let bucket;
  try { bucket = await RateBucket.findOneAndUpdate({ _id: id }, update, { upsert: true, new: true }); }
  catch (error) { if (error.code !== 11000) throw error; bucket = await RateBucket.findOneAndUpdate({ _id: id }, { $inc: { count: 1 } }, { new: true }); }
  if (!bucket || bucket.count > max) {
    res.setHeader('Retry-After', Math.ceil(((window + 1) * windowMs - now) / 1000));
    throw new HttpError(429, 'RATE_LIMITED', 'Too many requests. Please try again later.');
  }
  next();
});
export const userKey = req => String(req.user._id);
export const expensiveOperation = asyncHandler(async (req, res, next) => {
  if (JSON.stringify(req.body || {}).length > 24000) throw new HttpError(413, 'INPUT_TOO_LARGE', 'Shorten this request to 24,000 characters.');
  const config = req.app.locals.config;
  if (!process.env.OPENAI_API_KEY) throw new HttpError(503, 'AI_UNAVAILABLE', 'Analysis is temporarily unavailable. Your saved work is safe.');
  const owner = randomUUID(), acquired = [];
  const acquire = async id => {
    try {
      return await OperationLease.findOneAndUpdate({ _id: id, expiresAt: { $lte: new Date() } }, { $set: { owner, expiresAt: new Date(Date.now() + 120000) } }, { upsert: true, new: true });
    } catch (e) { if (e.code === 11000) return null; throw e; }
  };
  const release = async () => { await OperationLease.deleteMany({ _id: { $in: acquired }, owner }); };
  const perUser = 'user:' + createHmac('sha256', config.secret).update(userKey(req)).digest('hex');
  if (!await acquire(perUser)) throw new HttpError(429, 'OPERATION_RUNNING', 'An operation is already running. Wait for it to finish.');
  acquired.push(perUser);
  try {
    for (let i = 0; i < 3; i++) if (await acquire('ai-slot:' + i)) { acquired.push('ai-slot:' + i); break; }
    if (acquired.length !== 2) throw new HttpError(429, 'SERVICE_BUSY', 'Analysis is busy. Please try again shortly.');
    // Keep the lease on client disconnect; work may still run. It expires if the process dies.
    res.once('finish', () => { release().catch(() => req.app.locals.logger?.({ level: 'error', code: 'LEASE_RELEASE_FAILED', requestId: req.requestId })); });
    next();
  } catch (e) { await release(); throw e; }
});


