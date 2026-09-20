import path from 'node:path';
import { fileURLToPath } from 'node:url';
const defaultUploads = fileURLToPath(new URL('../uploads/', import.meta.url));
export function loadConfig(env = process.env) {
  const mode = env.NODE_ENV || 'development';
  if (!['development', 'test', 'production'].includes(mode)) throw new Error('Invalid NODE_ENV');
  const production = mode === 'production';
  const secret = env.JWT_SECRET || '';
  if (secret.length < 32 || /replace|your-super|change-me/i.test(secret)) throw new Error('JWT_SECRET must be a random secret of at least 32 characters');
  const mongoUri = env.MONGODB_URI || (production ? '' : 'mongodb://127.0.0.1:27017/resume-builder');
  if (!/^mongodb(\+srv)?:\/\//.test(mongoUri)) throw new Error('A valid MONGODB_URI is required');
  const origin = env.CLIENT_URL || (production ? '' : 'http://localhost:5173');
  let url;
  try { url = new URL(origin); } catch { throw new Error('CLIENT_URL must be an origin'); }
  if (url.origin !== origin || !['http:', 'https:'].includes(url.protocol) || (production && url.protocol !== 'https:')) throw new Error('CLIENT_URL must be an exact HTTPS origin in production');
  const integer = (name, fallback, min, max) => {
    const value = Number(env[name] ?? fallback);
    if (!Number.isInteger(value) || value < min || value > max) throw new Error('Invalid configuration: ' + name);
    return value;
  };
  return Object.freeze({
    mode, production, secret, mongoUri, origin,
    port: integer('PORT', 5000, 1, 65535),
    uploadDir: path.resolve(env.UPLOAD_PATH || defaultUploads),
    maxFileSize: integer('MAX_FILE_SIZE', 5242880, 1024, 5242880),
    sessionHours: integer('SESSION_HOURS', 12, 1, 24),
    trustProxy: env.TRUST_PROXY ? env.TRUST_PROXY.split(',').map(s => s.trim()) : false,
    // Legacy scanner is quarantined until its M5 network/task gate passes.
    jobScanningEnabled: false
  });
}

