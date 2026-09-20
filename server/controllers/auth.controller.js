import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { cookieName, cookieOptions, tokenHash, readSessionToken } from '../middleware/auth.js';
import { HttpError, asyncHandler } from '../middleware/errors.js';
import { object, text, email, password, profileInput } from '../middleware/validation.js';
export const userDTO = user => ({ _id: user._id, name: user.name, email: user.email, preferences: user.preferences || {} });
// Precomputed dummy hash makes nonexistent-email login perform a password comparison too.
const dummyHash = bcrypt.hashSync('not-a-real-account-password', 12);
async function issueSession(req, res, user) {
  const config = req.app.locals.config, token = randomBytes(32).toString('hex');
  const csrfToken = randomBytes(32).toString('hex');
  const old = readSessionToken(req);
  if (old) await Session.deleteOne({ tokenHash: tokenHash(old, config) });
  await Session.create({ userId: user._id, authVersion: user.authVersion || 0, tokenHash: tokenHash(token, config), csrfToken, expiresAt: new Date(Date.now() + config.sessionHours * 3600000) });
  res.cookie(cookieName(config), token, cookieOptions(config));
  return { ...userDTO(user), csrfToken };
}
export const register = asyncHandler(async (req, res) => {
  object(req.body, ['name', 'email', 'password']);
  const input = { name: text(req.body.name, 'Name', 1, 100), email: email(req.body.email), password: password(req.body.password, true) };
  if (await User.exists({ email: input.email })) throw new HttpError(409, 'ACCOUNT_EXISTS', 'An account with this email already exists.');
  const user = await User.create(input);
  res.status(201).json(await issueSession(req, res, user));
});
export const login = asyncHandler(async (req, res) => {
  object(req.body, ['email', 'password']);
  const address = email(req.body.email), candidate = password(req.body.password);
  const user = await User.findOne({ email: address }).select('+password');
  const matches = await bcrypt.compare(candidate, user?.password || dummyHash);
  if (!user || !matches) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  res.json(await issueSession(req, res, user));
});
export const getProfile = asyncHandler(async (req, res) => res.json({ ...userDTO(req.user), csrfToken: req.session.csrfToken }));
export const updateProfile = asyncHandler(async (req, res) => {
  const changes = profileInput(req.body);
  const user = await User.findByIdAndUpdate(req.user._id, { $set: changes }, { new: true, runValidators: true });
  res.json(userDTO(user));
});
export const logout = asyncHandler(async (req, res) => {
  await Session.deleteOne({ _id: req.session._id });
  const options = cookieOptions(req.app.locals.config); delete options.maxAge;
  res.clearCookie(cookieName(req.app.locals.config), options);
  res.status(204).end();
});
export const changePassword = asyncHandler(async (req, res) => {
  object(req.body, ['currentPassword', 'newPassword']);
  const current = password(req.body.currentPassword), next = password(req.body.newPassword, true);
  const user = await User.findById(req.user._id).select('+password');
  if (!await user.comparePassword(current)) throw new HttpError(400, 'PASSWORD_MISMATCH', 'Current password is incorrect.');
  user.password = next; user.authVersion = (user.authVersion || 0) + 1; await user.save();
  await Session.deleteMany({ userId: user._id });
  res.json(await issueSession(req, res, user));
});


export const createRecoveryCode = asyncHandler(async (req, res) => {
  object(req.body, ['password']);
  const candidate = password(req.body.password);
  const user = await User.findById(req.user._id).select('+password');
  if (!await user.comparePassword(candidate)) throw new HttpError(400, 'PASSWORD_MISMATCH', 'Current password is incorrect.');
  const recoveryCode = randomBytes(24).toString('hex');
  await User.updateOne({ _id: user._id }, { $set: { recoveryHash: tokenHash('recovery:' + recoveryCode, req.app.locals.config) } });
  res.json({ recoveryCode });
});
export const recoverAccount = asyncHandler(async (req, res) => {
  object(req.body, ['email', 'recoveryCode', 'newPassword']);
  const address = email(req.body.email), next = password(req.body.newPassword, true);
  const code = text(req.body.recoveryCode, 'Recovery code', 48, 48);
  const recoveryHash = tokenHash('recovery:' + code, req.app.locals.config);
  // Consume the code and change the password in one atomic write; concurrent replay loses.
  const hashedPassword = await bcrypt.hash(next, 12);
  const user = await User.findOneAndUpdate({ email: address, recoveryHash }, {
    $set: { password: hashedPassword }, $unset: { recoveryHash: 1 }, $inc: { authVersion: 1 }
  }, { new: true });
  if (!user) throw new HttpError(400, 'RECOVERY_FAILED', 'Email or recovery code is incorrect.');
  await Session.deleteMany({ userId: user._id });
  res.json({ message: 'Password reset. Sign in with your new password and create a new recovery code in Settings.' });
});
