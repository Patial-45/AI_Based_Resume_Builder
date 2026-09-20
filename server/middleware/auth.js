import { createHmac, timingSafeEqual } from 'node:crypto';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { HttpError, asyncHandler } from './errors.js';
export const cookieName = config => config.production ? '__Host-resume_session' : 'resume_session';
export const tokenHash = (token, config) => createHmac('sha256', config.secret).update(token).digest('hex');
export function readSessionToken(req) {
  const name = cookieName(req.app.locals.config);
  return (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(name + '='))?.slice(name.length + 1);
}
export function cookieOptions(config) { return { httpOnly: true, secure: config.production, sameSite: 'strict', path: '/', maxAge: config.sessionHours * 3600000 }; }
export const protect = asyncHandler(async (req, res, next) => {
  const token = readSessionToken(req);
  if (!token || !/^[a-f\d]{64}$/.test(token)) throw new HttpError(401, 'UNAUTHENTICATED', 'Please sign in to continue.');
  const session = await Session.findOne({ tokenHash: tokenHash(token, req.app.locals.config), expiresAt: { $gt: new Date() } });
  if (!session) throw new HttpError(401, 'SESSION_EXPIRED', 'Your session has expired. Please sign in again.');
  const user = await User.findById(session.userId);
  if (!user || (user.authVersion || 0) !== (session.authVersion || 0)) throw new HttpError(401, 'UNAUTHENTICATED', 'Please sign in to continue.');
  req.user = user; req.session = session;
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const csrf = req.get('X-CSRF-Token') || '';
    const expected = Buffer.from(session.csrfToken);
    const provided = Buffer.from(csrf);
    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) throw new HttpError(403, 'CSRF_REJECTED', 'Please refresh the page and try again.');
  }
  next();
});
