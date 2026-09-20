import { randomUUID } from 'node:crypto';
import OperationLease from '../models/OperationLease.js';
import Resume from '../models/Resume.js';
import { HttpError, asyncHandler } from './errors.js';
// One mutation per account serializes quota checks and delete/save operations across API replicas.
export const resumeMutation = asyncHandler(async (req, res, next) => {
  const owner = randomUUID(), keys = [], expiry = new Date(Date.now() + 120000);
  async function claim(key) {
    try { await OperationLease.findOneAndUpdate({ _id: key, expiresAt: { $lte: new Date() } }, { $set: { owner, expiresAt: expiry } }, { upsert: true, new: true }); keys.push(key); return true; }
    catch (error) { if (error.code === 11000) return false; throw error; }
  }
  const release = () => OperationLease.deleteMany({ _id: { $in: keys }, owner });
  if (!await claim('resume-user:' + req.user._id)) { res.set('Retry-After', '2'); throw new HttpError(429, 'RESUME_BUSY', 'Another resume change is running. Please retry shortly.'); }
  try {
    if (req.method === 'POST' && req.baseUrl.endsWith('/resumes') && req.path === '/') {
      for (let i = 0; i < 3; i++) if (await claim('resume-upload:' + i)) break;
      if (keys.length !== 2) { res.set('Retry-After', '2'); throw new HttpError(429, 'UPLOAD_BUSY', 'Uploads are busy. Please retry shortly.'); }
      const totals = await Resume.aggregate([{ $match: { userId: req.user._id } }, { $group: { _id: null, count: { $sum: 1 }, bytes: { $sum: '$fileSize' } } }]);
      const used = totals[0] || { count: 0, bytes: 0 };
      if (used.count >= 20 || used.bytes + req.app.locals.config.maxFileSize > 100 * 1024 * 1024) throw new HttpError(409, 'RESUME_QUOTA', 'Your library is full. Delete a resume before uploading another (20 resumes, 100 MB of original files).');
    }
    // Bound slow multipart bodies before a lease can expire. Parsing runs in a separate worker with its own 20s limit.
    const timer = setTimeout(() => req.destroy(), 90000); timer.unref();
    const finish = () => { clearTimeout(timer); release().catch(() => req.app.locals.logger?.({ level: 'error', code: 'RESUME_LEASE_RELEASE_FAILED', requestId: req.requestId })); };
    res.once('finish', finish);
    res.once('close', () => { clearTimeout(timer); }); // Interrupted work retains its lease until expiry.
    next();
  } catch (error) { await release(); throw error; }
});
