import path from 'node:path';
import fs from 'node:fs/promises';
import { HttpError } from '../middleware/errors.js';
export async function privatePath(config, storedPath) {
  // Check lexical containment before realpath: a missing storage root must not
  // turn an outside path into an ignored ENOENT during legacy deletion.
  const lexical = path.relative(path.resolve(config.uploadDir), path.resolve(storedPath));
  if (!lexical || lexical.startsWith('..') || path.isAbsolute(lexical)) throw new HttpError(400, 'INVALID_FILE_PATH', 'Invalid stored file.');
  const root = await fs.realpath(config.uploadDir);
  const target = await fs.realpath(path.resolve(storedPath));
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new HttpError(400, 'INVALID_FILE_PATH', 'Invalid stored file.');
  return target;
}
export async function removePrivateFile(config, storedPath) {
  try { await fs.unlink(await privatePath(config, storedPath)); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}

