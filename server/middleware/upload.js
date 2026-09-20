import multer from 'multer';
import { validateDocx } from '../services/validateDocx.js';
import path from 'node:path';


import { HttpError, asyncHandler } from './errors.js';
const types = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain'
};
export default multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 2 },
  fileFilter(req, file, done) {
    const type = types[path.extname(file.originalname).toLowerCase()];
    done(type && type === file.mimetype ? null : new HttpError(415, 'INVALID_FILE_TYPE', 'Upload a PDF, DOCX, or plain text file.'), !!type && type === file.mimetype);
  }
});
export const storeUpload = asyncHandler(async (req, res, next) => {
  if (!req.file) throw new HttpError(400, 'FILE_REQUIRED', 'Please upload a file.');
  const file = req.file, data = file.buffer, ext = path.extname(file.originalname).toLowerCase();
  if (data.length > req.app.locals.config.maxFileSize) throw new HttpError(413, 'FILE_TOO_LARGE', 'File is too large.');
  if (!data.length || (ext === '.pdf' && data.subarray(0, 5).toString() !== '%PDF-') ||
      (ext === '.docx' && (data.length < 4 || data.readUInt32LE(0) !== 0x04034b50))) throw new HttpError(422, 'INVALID_DOCUMENT', 'The document content does not match its type.');
  if (ext === '.txt') {
    let content;
    try { content = new TextDecoder('utf-8', { fatal: true }).decode(data); }
    catch { throw new HttpError(422, 'INVALID_TEXT', 'Use a UTF-8 text file.'); }
    if (content.includes('\0') || /<\s*(?:!doctype|html|script|svg)\b/i.test(content)) throw new HttpError(422, 'INVALID_TEXT', 'Upload plain resume text.');
  }
  if (ext === '.docx') await validateDocx(data);
  next();
});
