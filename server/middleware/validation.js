import { HttpError } from './errors.js';
export const invalid = message => { throw new HttpError(400, 'INVALID_INPUT', message); };
export function object(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('Expected an object.');
  for (const key of Object.keys(value)) if (!fields.includes(key)) invalid('Unsupported field in this request.');
  return value;
}
export function text(value, name, min = 1, max = 200) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) invalid(name + ' must be ' + min + '–' + max + ' characters.');
  return value.trim();
}
export function email(value) {
  const result = text(value, 'Email', 3, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) invalid('Enter a valid email address.');
  return result;
}
export function password(value, newPassword = false) {
  if (typeof value !== 'string' || [...value].length < (newPassword ? 12 : 1) || Buffer.byteLength(value, 'utf8') > 72) invalid(newPassword ? 'Use at least 12 characters and at most 72 UTF-8 bytes.' : 'Enter a valid password.');
  return value;
}
export function profileInput(body) {
  object(body, ['name', 'preferences']);
  const output = {};
  if (body.name !== undefined) output.name = text(body.name, 'Name', 1, 100);
  if (body.preferences !== undefined) {
    const p = object(body.preferences, ['jobTitle', 'location', 'remote', 'minSalary', 'maxSalary']);
    output.preferences = {};
    for (const key of ['jobTitle', 'location']) if (p[key] !== undefined) output.preferences[key] = text(p[key], key, 0, 120);
    if (p.remote !== undefined) { if (typeof p.remote !== 'boolean') invalid('Remote must be true or false.'); output.preferences.remote = p.remote; }
    for (const key of ['minSalary', 'maxSalary']) if (p[key] !== undefined && p[key] !== null) {
      if (!Number.isSafeInteger(p[key]) || p[key] < 0 || p[key] > 1000000000) invalid('Enter a valid salary.');
      output.preferences[key] = p[key];
    }
    if (p.minSalary != null && p.maxSalary != null && p.minSalary > p.maxSalary) invalid('Minimum salary cannot exceed maximum salary.');
  }
  if (!Object.keys(output).length) invalid('No changes provided.');
  return output;
}
export function validateIdentifiers(req, res, next) {
  const values = [...Object.values(req.params), ...['resumeId', 'jobDescriptionId', 'existingResumeId'].map(k => req.body?.[k] ?? req.query?.[k])];
  if (values.some(v => v !== undefined && !/^[a-f\d]{24}$/i.test(v))) return next(new HttpError(400, 'INVALID_ID', 'Invalid record identifier.'));
  if (req.query.limit !== undefined && (!/^\d+$/.test(req.query.limit) || Number(req.query.limit) < 1 || Number(req.query.limit) > 100)) return next(new HttpError(400, 'INVALID_LIMIT', 'Limit must be between 1 and 100.'));
  next();
}



