import path from 'node:path';
import { createHash } from 'node:crypto';
import Resume from '../models/Resume.js';
import Match from '../models/Match.js';
import JobMatch from '../models/JobMatch.js';
import { parseDocument } from '../services/boundedParser.js';
import { extractSections } from '../services/resumeParser.js';
import { privatePath, removePrivateFile } from '../services/privateFiles.js';
import { HttpError, asyncHandler } from '../middleware/errors.js';
import { object, text } from '../middleware/validation.js';
const owned = req => ({ _id: req.params.id, userId: req.user._id, isActive: true });
const hash = value => createHash('sha256').update(value).digest('hex');
const dto = document => { const { filePath, originalData, originalHash, embedding, sourceText, versions, ...data } = document.toObject(); return data; };
const safeName = name => path.basename(name.replaceAll('\\', '/')).replace(/[\x00-\x1f\x7f]/g, '').slice(0, 200) || 'resume';
export const uploadResume = asyncHandler(async (req, res) => {
  try {
    const data = req.file.buffer;
    const { extractedText, sections } = await parseDocument(data, req.file.mimetype);
    const fileName = safeName(req.file.originalname);
    // One atomic document write commits original, extracted content and metadata together.
    const resume = await Resume.create({ userId: req.user._id, fileName, originalName: fileName,
      originalData: data, originalHash: hash(data), fileSize: data.length, mimeType: req.file.mimetype,
      extractedText, sourceText: extractedText, sections, reviewStatus: 'needs_review', revision: 0, embedding: null });
    res.status(201).json(dto(resume));
  } finally { delete req.file.buffer; }
});
export const getResumes = asyncHandler(async (req, res) =>
  res.json(await Resume.find({ userId: req.user._id, $or: [{ isActive: true }, { deletionRequestedAt: { $exists: true } }] }).sort({ updatedAt: -1 }).limit(100).select('fileName originalName fileSize mimeType createdAt updatedAt revision reviewStatus reviewedAt deletionRequestedAt sections.skills')));
export const getResumeLimits = (req, res) => res.json({ maxFileSize: req.app.locals.config.maxFileSize, maxResumes: 20, maxBytes: 100 * 1024 * 1024, maxVersions: 20, maxTextLength: 100000 });
export const getResumeById = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne(owned(req)).select('+sourceText +versions');
  if (!resume) throw new HttpError(404, 'NOT_FOUND', 'Resume not found.');
  res.json({ ...dto(resume), sourceText: resume.sourceText ?? resume.extractedText, versions: (resume.versions || []).map(({ revision, savedAt, sha256 }) => ({ revision, savedAt, sha256 })) });
});
export const getResumeVersion = asyncHandler(async (req, res) => {
  if (!/^[1-9]\d*$/.test(req.params.version)) throw new HttpError(400, 'INVALID_VERSION', 'Invalid version.');
  const resume = await Resume.findOne(owned(req)).select('+versions');
  const version = resume?.versions.find(item => item.revision === Number(req.params.version));
  if (!version) throw new HttpError(404, 'NOT_FOUND', 'Version not found.');
  res.json({ revision: version.revision, text: version.text, savedAt: version.savedAt });
});
export const downloadResume = asyncHandler(async (req, res, next) => {
  const resume = await Resume.findOne(owned(req)).select('+originalData');
  if (!resume) throw new HttpError(404, 'NOT_FOUND', 'Resume not found.');
  if (resume.originalData) {
    res.attachment(safeName(resume.originalName || resume.fileName));
    res.type(resume.mimeType); res.set('Content-Length', String(resume.fileSize));
    return res.send(Buffer.from(resume.originalData));
  }
  if (!resume.filePath) throw new HttpError(404, 'FILE_UNAVAILABLE', 'The original file is unavailable.');
  let filePath;
  try { filePath = await privatePath(req.app.locals.config, resume.filePath); }
  catch (error) { if (error.code === 'ENOENT') throw new HttpError(404, 'FILE_UNAVAILABLE', 'The original file is unavailable.'); throw error; }
  res.download(filePath, safeName(resume.originalName || resume.fileName), error => { if (error) next(error); });
});
export const deleteResume = asyncHandler(async (req, res) => {
  // Include previously interrupted deletions so repeating DELETE completes cleanup.
  const filter = { _id: req.params.id, userId: req.user._id };
  const resume = await Resume.findOne(filter).select('+storageFileId');
  if (!resume) throw new HttpError(404, 'NOT_FOUND', 'Resume not found.');
  // Validate legacy paths before hiding the record or touching storage.
  if (resume.filePath) { try { await privatePath(req.app.locals.config, resume.filePath); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
  await Resume.updateOne(filter, { $set: { isActive: false, deletionRequestedAt: new Date() } });
  if (resume.filePath) await removePrivateFile(req.app.locals.config, resume.filePath);
  await Match.deleteMany({ resumeId: resume._id, userId: req.user._id });
  await JobMatch.deleteMany({ resumeId: resume._id, userId: req.user._id });
  await Resume.deleteOne(filter);
  res.json({ message: 'Resume, original file, saved versions and linked matching activity deleted.' });
});
export const updateResume = asyncHandler(async (req, res) => {
  object(req.body, ['fileName']);
  const fileName = safeName(text(req.body.fileName, 'File name', 1, 200));
  const resume = await Resume.findOneAndUpdate(owned(req), { $set: { fileName } }, { new: true, runValidators: true });
  if (!resume) throw new HttpError(404, 'NOT_FOUND', 'Resume not found.');
  res.json(dto(resume));
});
export const saveResumeContent = asyncHandler(async (req, res) => {
  object(req.body, ['text', 'revision']);
  const content = text(req.body.text, 'Resume content', 1, 100000);
  if (Buffer.byteLength(content, 'utf8') > 100000) throw new HttpError(413, 'TEXT_TOO_LARGE', 'Reviewed content must be at most 100 KB of UTF-8 text.');
  if (!Number.isSafeInteger(req.body.revision) || req.body.revision < 0) throw new HttpError(400, 'INVALID_REVISION', 'A valid current revision is required.');
  const current = await Resume.findOne(owned(req)).select('+sourceText +versions');
  if (!current) throw new HttpError(404, 'NOT_FOUND', 'Resume not found.');
  if (req.body.revision !== (current.revision || 0)) throw new HttpError(409, 'REVISION_CONFLICT', 'A newer version exists. Keep your edits and reload the saved version before retrying.');
  if (current.versions.length >= 20) throw new HttpError(409, 'VERSION_LIMIT', 'This resume has reached its 20-version limit. Download the original and create another resume to continue.');
  const revision = (current.revision || 0) + 1, savedAt = new Date();
  const revisionFilter = current.revision ? { revision: current.revision } : { $or: [{ revision: 0 }, { revision: { $exists: false } }] };
  const resume = await Resume.findOneAndUpdate({ ...owned(req), ...revisionFilter }, {
    $set: { sourceText: current.sourceText ?? current.extractedText, extractedText: content, sections: extractSections(content), revision, reviewedAt: savedAt, reviewStatus: 'ready', embedding: null },
    $push: { versions: { revision, text: content, savedAt, sha256: hash(content) } }
  }, { new: true, runValidators: true });
  if (!resume) throw new HttpError(409, 'REVISION_CONFLICT', 'This resume changed. Keep your edits and reload before retrying.');
  res.json(dto(resume));
});
