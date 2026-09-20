// Local audit probes. No database, real credentials, network requests or file deletion.
// Run from repository root: node docs/audit/reproduce.mjs
// These assert the observed defects, NOT release acceptance criteria.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
process.env.OPENAI_API_KEY = 'audit-dummy-key';
process.env.GROQ_API_KEY = 'audit-dummy-key';
const results = [];
const check = async (id, fn) => {
  try { const detail = await fn(); results.push({ id, status: 'REPRODUCED', detail }); }
  catch (e) { results.push({ id, status: 'NOT_REPRODUCED', error: e.message }); }
};
const { parseResume } = await import('../../server/services/resumeParser.js');
const { generateATSResume } = await import('../../server/services/resumeBuilder.js');
const Resume = (await import('../../server/models/Resume.js')).default;
const { updateResume, deleteResume, getResumeById } = await import('../../server/controllers/resume.controller.js');
const Job = (await import('../../server/models/Job.js')).default;
const JobMatch = (await import('../../server/models/JobMatch.js')).default;
const { scrapeCutshortLive, scrapeHiristLive } = await import('../../server/services/jobScraper.js');
const capture = () => ({ code: 200, body: null, status(n) { this.code = n; return this; }, json(body) { this.body = body; return this; } });
await check('B01', async () => {
  const result = await parseResume(fileURLToPath(new URL('./does-not-exist.pdf', import.meta.url)), 'application/pdf');
  assert.equal(result.extractedText, 'Uploaded resume document');
  return 'A missing PDF returns successful-looking placeholder text.';
});
await check('B03', async () => {
  delete process.env.OPENAI_API_KEY;
  const result = await generateATSResume('React developer', { name: 'Audit Candidate' }, 'Student; no employment or certifications.');
  assert.equal(result.experience[0].company, 'Technology Solutions Enterprise');
  assert.equal(result.atsScore, 88);
  assert.ok(result.certifications.length);
  return 'Fallback invents employment/certifications and returns ATS score 88.';
});
await check('B06', async () => {
  const a = await scrapeCutshortLive('React');
  const b = await scrapeHiristLive('React');
  assert.equal(a[0].source, 'cutshort');
  assert.equal(b[0].source, 'hirist');
  return 'Both live-labelled adapters return fabricated listings without a network request.';
});
await check('S01', async () => {
  const originalUpdate = Resume.findOneAndUpdate;
  const originalFind = Resume.findOne;
  const exists = fs.existsSync;
  const unlink = fs.unlinkSync;
  let forwarded, deleteTarget;
  const syntheticPath = 'AUDIT_SENTINEL_OUTSIDE_UPLOADS';
  try {
    Resume.findOneAndUpdate = (_filter, update) => { forwarded = update; return { select: async () => update }; };
    const response = capture();
    await updateResume({ params: { id: 'audit-resume' }, user: { _id: 'audit-user' }, body: { filePath: syntheticPath, userId: 'another-user' } }, response);
    assert.equal(forwarded.filePath, syntheticPath);
    assert.equal(forwarded.userId, 'another-user');
    Resume.findOne = async () => ({ filePath: syntheticPath, save: async () => {} });
    fs.existsSync = () => true;
    fs.unlinkSync = target => { deleteTarget = target; };
    await deleteResume({ params: { id: 'audit-resume' }, user: { _id: 'audit-user' } }, capture());
    assert.equal(deleteTarget, syntheticPath);
    return 'Protected fields reach the update query; deletion uses the supplied path. DB and filesystem operations were mocked.';
  } finally { Resume.findOneAndUpdate = originalUpdate; Resume.findOne = originalFind; fs.existsSync = exists; fs.unlinkSync = unlink; }
});
await check('B09', async () => {
  assert.ok(Job.schema.indexes().some(([keys, opts]) => keys.createdAt === 1 && opts.expireAfterSeconds === 259200));
  assert.ok(JobMatch.schema.indexes().some(([keys, opts]) => keys.userId && keys.jobId && !keys.resumeId && opts.unique));
  return 'Schema confirms three-day Job TTL and one JobMatch per user/job, independent of resume.';
});
await check('B02', async () => {
  const original = Resume.findOne;
  let filter;
  try {
    Resume.findOne = f => { filter = f; return { select: async () => ({ isActive: false }) }; };
    const response = capture();
    await getResumeById({ params: { id: 'audit-resume' }, user: { _id: 'audit-user' } }, response);
    assert.equal(filter.isActive, undefined);
    assert.equal(response.body.isActive, false);
    return 'Single-resume lookup does not exclude a soft-deleted resume.';
  } finally { Resume.findOne = original; }
});
console.log(JSON.stringify({ date: '2026-09-09', scope: 'Offline probes with mocked persistence/filesystem where stated', results }, null, 2));
if (results.some(r => r.status !== 'REPRODUCED')) process.exitCode = 1;
