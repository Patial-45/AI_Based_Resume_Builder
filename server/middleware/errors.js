import { randomUUID } from 'node:crypto';
export class HttpError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export function requestContext(req, res, next) {
  req.requestId = randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('CDN-Cache-Control', 'no-store');
  next();
}
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error instanceof HttpError ? error.status : 500;
  let code = error instanceof HttpError ? error.code : 'INTERNAL_ERROR';
  let message = error instanceof HttpError ? error.message : 'Something went wrong. Please try again.';
  if (error.code === 11000) { status = 409; code = 'CONFLICT'; message = 'This record already exists.'; }
  if (['ValidationError', 'CastError'].includes(error.name) || error.type === 'entity.parse.failed') { status = 400; code = 'INVALID_INPUT'; message = 'Please check the information you entered.'; }
  if (error.type === 'entity.too.large' || error.code === 'LIMIT_FILE_SIZE') { status = 413; code = 'TOO_LARGE'; message = 'The upload or request is too large.'; }
  if (error.name === 'MulterError' && status === 500) { status = 400; code = 'INVALID_UPLOAD'; message = 'Invalid file upload.'; }
  if (['MongoServerSelectionError', 'MongoNetworkError'].includes(error.name)) { status = 503; code = 'UNAVAILABLE'; message = 'Service temporarily unavailable.'; }
  // Only allowlisted operational metadata is logged, never error objects/bodies/headers.
  if (status >= 500) req.app.locals.logger?.({ level: 'error', code, requestId: req.requestId });
  res.status(status).json({ message, error: { code, message, requestId: req.requestId } });
}

