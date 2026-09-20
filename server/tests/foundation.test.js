import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app.js';
import { loadConfig } from '../config/environment.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import RateBucket from '../models/RateBucket.js';
import OperationLease from '../models/OperationLease.js';
import Resume from '../models/Resume.js';
import { rateLimit } from '../middleware/limits.js';
import express from 'express';
import { errorHandler, requestContext } from '../middleware/errors.js';
let mongo, root, config, app;
const logs = [];
const pass = 'A correct test password 83!';
before(async () => {
  delete process.env.OPENAI_API_KEY; delete process.env.GROQ_API_KEY;
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-m1-test-'));
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  config = loadConfig({ NODE_ENV: 'test', JWT_SECRET: 'd9a4368be1c642ed8494630fb572cc96725b0670f5884d143f481b5e792cff88', MONGODB_URI: mongo.getUri(), UPLOAD_PATH: path.join(root, 'uploads') });
  await mongoose.connect(config.mongoUri);
  await Promise.all([User.init(), Session.init(), RateBucket.init(), OperationLease.init(), Resume.init()]);
  app = createApp({ config, logger: record => logs.push(record) });
}, { timeout: 180000 });
beforeEach(async () => {
  await Promise.all(Object.values(mongoose.models).map(model => model.deleteMany({})));
  logs.length = 0;
});
after(async () => {
  await mongoose.disconnect(); await mongo?.stop();
  if (root) await fs.rm(root, { recursive: true, force: true });
});
async function register(email = 'alice@example.com') {
  const agent = request.agent(app);
  const response = await agent.post('/api/auth/register').send({ name: 'Alice Example', email, password: pass }).expect(201);
  return { agent, csrf: response.body.csrfToken, user: response.body, cookie: response.headers['set-cookie'][0].split(';')[0] };
}
const upload = (account, content = 'Summary\nSoftware developer with experience building accessible web applications.') =>
  account.agent.post('/api/resumes').set('X-CSRF-Token', account.csrf).attach('resume', Buffer.from(content), { filename: 'resume.txt', contentType: 'text/plain' });

test('required configuration fails closed, optional provider keys do not block app import', () => {
  assert.throws(() => loadConfig({}), /JWT_SECRET/);
  assert.throws(() => loadConfig({ NODE_ENV: 'production', JWT_SECRET: config.secret }), /MONGODB_URI/);
  assert.throws(() => loadConfig({ NODE_ENV: 'production', JWT_SECRET: config.secret, MONGODB_URI: config.mongoUri, CLIENT_URL: 'http://example.com' }), /CLIENT_URL/);
});
test('register, normalized login, cookie flags, DB hashing and reload', async () => {
  const a = await register(' ALICE@Example.COM ');
  assert.equal(a.user.email, 'alice@example.com');
  assert.equal(a.user.token, undefined); assert.equal(a.user.password, undefined);
  const stored = await User.findOne().select('+password');
  assert.notEqual(stored.password, pass); assert.ok(await stored.comparePassword(pass));
  const session = await Session.findOne(); assert.ok(!a.cookie.includes(session.tokenHash));
  await a.agent.get('/api/auth/profile').expect(200).expect(res => assert.equal(res.body.name, 'Alice Example'));
  const login = await request(app).post('/api/auth/login').send({ email: 'ALICE@example.com', password: pass }).expect(200);
  assert.match(login.headers['set-cookie'][0], /HttpOnly/); assert.match(login.headers['set-cookie'][0], /SameSite=Strict/);
});
test('duplicate registrations are atomic; login failure does not reveal whether an email exists', async () => {
  const results = await Promise.all([1, 2].map(() => request(app).post('/api/auth/register').send({ name: 'Alice', email: 'alice@example.com', password: pass })));
  assert.deepEqual(results.map(r => r.status).sort(), [201, 409]); assert.equal(await User.countDocuments(), 1);
  const wrong = await request(app).post('/api/auth/login').send({ email: 'alice@example.com', password: 'incorrect' }).expect(401);
  const missing = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'incorrect' }).expect(401);
  assert.equal(wrong.body.message, missing.body.message);
});
test('reject weak/oversized passwords, object injection and unknown profile fields', async () => {
  for (const password of ['short', 'é'.repeat(40)]) await request(app).post('/api/auth/register').send({ name: 'A', email: 'a@example.com', password }).expect(400);
  await request(app).post('/api/auth/login').send({ email: { $ne: null }, password: pass }).expect(400);
  const a = await register();
  for (const body of [{ password: pass }, { email: 'changed@example.com' }, { preferences: { minSalary: 10, maxSalary: 1 } }, { preferences: { remote: 'true' } }])
    await a.agent.put('/api/auth/profile').set('X-CSRF-Token', a.csrf).send(body).expect(400);
});
test('CSRF, origin and fetch metadata reject forged writes; valid preferences persist', async () => {
  const a = await register();
  await a.agent.put('/api/auth/profile').send({ name: 'Forged' }).expect(403);
  await a.agent.put('/api/auth/profile').set('X-CSRF-Token', a.csrf).set('Origin', 'https://attacker.example').send({ name: 'Forged' }).expect(403);
  await a.agent.put('/api/auth/profile').set('X-CSRF-Token', a.csrf).set('Sec-Fetch-Site', 'cross-site').send({ name: 'Forged' }).expect(403);
  await a.agent.put('/api/auth/profile').set('X-CSRF-Token', a.csrf).send({ name: 'Updated', preferences: { remote: true, minSalary: 0, maxSalary: 100 } }).expect(200);
  await a.agent.get('/api/auth/profile').expect(res => { assert.equal(res.body.name, 'Updated'); assert.equal(res.body.preferences.minSalary, 0); });
});
test('logout revokes replay, expiration and deleted users are denied', async () => {
  const a = await register();
  await a.agent.post('/api/auth/logout').set('X-CSRF-Token', a.csrf).expect(204);
  await request(app).get('/api/auth/profile').set('Cookie', a.cookie).expect(401);
  const b = await register('bob@example.com');
  await Session.updateMany({}, { expiresAt: new Date(0) });
  await b.agent.get('/api/auth/profile').expect(401);
  const c = await register('charlie@example.com'); await User.deleteOne({ _id: c.user._id });
  await c.agent.get('/api/auth/profile').expect(401);
});
test('password change revokes other sessions and old password', async () => {
  const a = await register();
  const other = await request(app).post('/api/auth/login').send({ email: a.user.email, password: pass }).expect(200);
  const changed = await a.agent.put('/api/auth/password').set('X-CSRF-Token', a.csrf).send({ currentPassword: pass, newPassword: pass + 'new' }).expect(200);
  assert.ok(changed.body.csrfToken);
  await request(app).get('/api/auth/profile').set('Cookie', other.headers['set-cookie'][0].split(';')[0]).expect(401);
  await request(app).post('/api/auth/login').send({ email: a.user.email, password: pass }).expect(401);
  await a.agent.get('/api/auth/profile').expect(200);
});
test('recovery requires current password to create, code is hashed, single use, revokes sessions', async () => {
  const a = await register();
  await a.agent.post('/api/auth/recovery-code').set('X-CSRF-Token', a.csrf).send({ password: 'wrong' }).expect(400);
  const created = await a.agent.post('/api/auth/recovery-code').set('X-CSRF-Token', a.csrf).send({ password: pass }).expect(200);
  const recoveryCode = created.body.recoveryCode;
  assert.equal(recoveryCode.length, 48); assert.notEqual((await User.findOne().select('+recoveryHash')).recoveryHash, recoveryCode);
  const body = { email: a.user.email, recoveryCode, newPassword: pass + 'reset' };
  const attempts = await Promise.all([1, 2].map(() => request(app).post('/api/auth/recover').send(body)));
  assert.deepEqual(attempts.map(r => r.status).sort(), [200, 400]);
  await a.agent.get('/api/auth/profile').expect(401);
  await request(app).post('/api/auth/login').send({ email: a.user.email, password: body.newPassword }).expect(200);
});
test('files are private, DTOs redact paths, second user cannot read/write/delete/download', async () => {
  const a = await register(), b = await register('bob@example.com');
  const saved = await upload(a).expect(201), id = saved.body._id;
  assert.equal(saved.body.filePath, undefined); assert.equal(saved.body.embedding, undefined);
  await request(app).get('/uploads/resume.txt').expect(404);
  await request(app).get('/api/resumes/' + id + '/download').expect(401);
  for (const suffix of ['', '/download']) await b.agent.get('/api/resumes/' + id + suffix).expect(404);
  await b.agent.put('/api/resumes/' + id).set('X-CSRF-Token', b.csrf).send({ fileName: 'stolen' }).expect(404);
  await b.agent.delete('/api/resumes/' + id).set('X-CSRF-Token', b.csrf).expect(404);
  const download = await a.agent.get('/api/resumes/' + id + '/download').expect(200);
  assert.match(download.headers['content-disposition'], /^attachment/);
  assert.equal(download.headers['x-content-type-options'], 'nosniff');
  assert.match(download.headers['cache-control'], /no-store/);
});
test('protected fields and traversal cannot delete a sentinel outside storage; deleted resume is inaccessible', async () => {
  const a = await register(), saved = await upload(a).expect(201), id = saved.body._id;
  const sentinel = path.join(root, 'sentinel.txt'); await fs.writeFile(sentinel, 'keep');
  for (const body of [{ filePath: sentinel }, { userId: a.user._id }, { isActive: false }, { embedding: [] }, { $set: { filePath: '../sentinel.txt' } }])
    await a.agent.put('/api/resumes/' + id).set('X-CSRF-Token', a.csrf).send(body).expect(400);
  // Also contain an already-corrupt legacy DB path.
  const actual = (await Resume.findById(id)).filePath;
  await Resume.updateOne({ _id: id }, { filePath: sentinel });
  await a.agent.delete('/api/resumes/' + id).set('X-CSRF-Token', a.csrf).expect(400);
  assert.equal(await fs.readFile(sentinel, 'utf8'), 'keep');
  await Resume.updateOne({ _id: id }, actual ? { filePath: actual } : { $unset: { filePath: 1 } });
  await a.agent.delete('/api/resumes/' + id).set('X-CSRF-Token', a.csrf).expect(200);
  await a.agent.get('/api/resumes/' + id).expect(404);
  await a.agent.get('/api/resumes/' + id + '/download').expect(404);
});
test('invalid files, extra fields, malformed multipart and oversized bodies fail without usable records', async () => {
  const a = await register();
  for (const [filename, contentType, content, expected] of [
    ['evil.html', 'text/plain', '<html>bad</html>', 415],
    ['resume.txt', 'text/plain', '<script>alert(1)</script>', 422],
    ['resume.pdf', 'application/pdf', 'not PDF', 422],
    ['resume.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'x', 422],
    ['resume.doc', 'application/msword', 'legacy', 415],
    ['resume.txt', 'application/octet-stream', 'wrong mime', 415],
    ['resume.txt', 'text/plain', '   ', 422],
  ]) await a.agent.post('/api/resumes').set('X-CSRF-Token', a.csrf).attach('resume', Buffer.from(content), { filename, contentType }).expect(expected);
  await a.agent.post('/api/resumes').set('X-CSRF-Token', a.csrf).field('unexpected', 'x').expect(400);
  await a.agent.post('/api/resumes').set('X-CSRF-Token', a.csrf).set('Content-Type', 'multipart/form-data; boundary=missing').send('broken').expect(400);
  await a.agent.post('/api/resumes').set('X-CSRF-Token', a.csrf).attach('resume', Buffer.alloc(5 * 1024 * 1024 + 1, 65), { filename: 'large.txt', contentType: 'text/plain' }).expect(413);
  assert.equal(await Resume.countDocuments(), 0);
});
test('limits are shared across app instances and reject bursts with retry guidance', async () => {
  function limitedApp() {
    const result = express(); result.locals.config = config; result.use(requestContext);
    result.get('/', rateLimit('test-limit', 3, 60000), (req, res) => res.json({ ok: true }));
    result.use(errorHandler); return result;
  }
  const first = limitedApp(), second = limitedApp();
  await request(first).get('/').expect(200); await request(second).get('/').expect(200); await request(first).get('/').expect(200);
  const blocked = await request(second).get('/').expect(429); assert.ok(Number(blocked.headers['retry-after']) > 0);
});
test('missing AI configuration and contained scanner report unavailable, identity stays usable', async () => {
  const a = await register();
  await a.agent.post('/api/match').set('X-CSRF-Token', a.csrf).send({ resumeId: new mongoose.Types.ObjectId().toString(), jdText: 'test' }).expect(503);
  await a.agent.post('/api/jobs/scan').set('X-CSRF-Token', a.csrf).send({}).expect(503);
  await a.agent.get('/api/auth/profile').expect(200);
  await a.agent.get('/api/resumes/not-an-id').expect(400);
});
test('health and readiness are distinct; errors have request IDs, no sensitive marker leakage', async () => {
  const unavailable = createApp({ config, readiness: () => false, logger: record => logs.push(record) });
  await request(unavailable).get('/api/health').expect(200);
  await request(unavailable).get('/api/ready').expect(503);
  const marker = 'PRIVATE_MARKER_93848';
  const result = await request(app).post('/api/auth/login').send({ email: marker, password: marker }).expect(400);
  assert.ok(result.body.error.requestId);
  assert.ok(!JSON.stringify(result.body).includes(marker)); assert.ok(!JSON.stringify(logs).includes(marker));
});


test('production cookies remain secure behind the same-origin proxy', async () => {
  const productionConfig = loadConfig({ NODE_ENV: 'production', JWT_SECRET: config.secret, MONGODB_URI: config.mongoUri, CLIENT_URL: 'https://workspace.example.com' });
  const production = createApp({ config: productionConfig });
  const result = await request(production).post('/api/auth/register').set('Origin', productionConfig.origin).send({ name: 'Production Fixture', email: 'production@example.com', password: pass }).expect(201);
  assert.match(result.headers['set-cookie'][0], /^__Host-resume_session=/);
  assert.match(result.headers['set-cookie'][0], /; Secure/);
  assert.ok(!result.headers['set-cookie'][0].includes('Domain='));
  assert.ok(result.headers['strict-transport-security']);
});
test('AI capacity caps concurrent requests across users and releases leases', async () => {
  const { expensiveOperation } = await import('../middleware/limits.js');
  process.env.OPENAI_API_KEY = 'synthetic-key-no-provider-calls';
  const isolated = express();
  isolated.locals.config = config;
  isolated.use(requestContext);
  isolated.use((req, res, next) => { req.user = { _id: req.get('X-Test-User') }; next(); });
  let started = 0, release;
  const barrier = new Promise(resolve => { release = resolve; });
  isolated.get('/', expensiveOperation, async (req, res) => { started++; await barrier; res.json({ ok: true }); });
  isolated.use(errorHandler);
  const first = [1, 2, 3].map(id => request(isolated).get('/').set('X-Test-User', String(id)).then(result => result));
  try {
    for (let i = 0; i < 200 && started < 3; i++) await new Promise(resolve => setTimeout(resolve, 10));
    assert.equal(started, 3);
    await request(isolated).get('/').set('X-Test-User', '4').expect(429);
    await request(isolated).get('/').set('X-Test-User', '1').expect(429);
  } finally { release(); await Promise.all(first); delete process.env.OPENAI_API_KEY; }
  for (let i = 0; i < 100 && await OperationLease.countDocuments(); i++) await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(await OperationLease.countDocuments(), 0);
});
test('Vercel generator keeps API routing separate from SPA and disables shared caching', async () => {
  const { vercelConfig } = await import('../../scripts/configure-vercel.mjs');
  assert.throws(() => vercelConfig('http://api.example.com'));
  assert.throws(() => vercelConfig('https://api.example.com/path'));
  const generated = vercelConfig('https://api.example.com');
  assert.equal(generated.rewrites[0].destination, 'https://api.example.com/api/:path*');
  assert.ok(generated.rewrites.some(rule => rule.source === '/profile' && rule.destination === '/index.html'));
  assert.ok(!generated.rewrites.some(rule => rule.source.includes('assets')));
  assert.ok(generated.headers[0].headers.some(header => header.key === 'x-vercel-enable-rewrite-caching' && header.value === '0'));
});


test('DOCX validation accepts a real small document and rejects oversized archive metadata', async () => {
  // Minimal stored ZIP fixture with valid CRCs, central directory and OOXML content.
  const entries = {
    '[Content_Types].xml': '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    'word/document.xml': '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Software developer with accessible application experience</w:t></w:r></w:p></w:body></w:document>'
  };
  function crc32(data) {
    let crc = 0xffffffff;
    for (const byte of data) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
    return (crc ^ 0xffffffff) >>> 0;
  }
  const locals = [], directory = []; let offset = 0;
  for (const [name, xml] of Object.entries(entries)) {
    const fileName = Buffer.from(name), data = Buffer.from(xml), crc = crc32(data);
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(fileName.length, 26);
    const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(fileName.length, 28); central.writeUInt32LE(offset, 42);
    locals.push(local, fileName, data); directory.push(central, fileName); offset += local.length + fileName.length + data.length;
  }
  const central = Buffer.concat(directory), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(2, 8); end.writeUInt16LE(2, 10); end.writeUInt32LE(central.length, 12); end.writeUInt32LE(offset, 16);
  const fixture = Buffer.concat([...locals, central, end]), a = await register();
  const response = await a.agent.post('/api/resumes').set('X-CSRF-Token', a.csrf).attach('resume', fixture, { filename: 'fixture.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  assert.equal(response.status, 201, response.body.error?.code || 'DOCX upload should succeed');
  assert.match(response.body.extractedText, /Software developer/);
  const malicious = Buffer.from(fixture); malicious.writeUInt32LE(30 * 1024 * 1024, offset + 24);
  await a.agent.post('/api/resumes').set('X-CSRF-Token', a.csrf).attach('resume', malicious, { filename: 'oversized.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }).expect(422);
});


// M2 acceptance: real database, synthetic originals, no AI/provider requests.
test('M2 conservative parsing preserves source facts without guessed employment or substring skills', async () => {
  const { extractSections } = await import('../services/resumeParser.js');
  const parsed = extractSections('Alex Student\nI have experience learning.\nSummary\nFirst summary line.\nSecond summary line.\nSkills\nJavaScript, C++, C#, problem-solving\nProjects\nBuilt a weather app.');
  assert.equal(parsed.summary, 'First summary line.\nSecond summary line.');
  assert.deepEqual(parsed.experience, []); assert.deepEqual(parsed.education, []);
  assert.deepEqual(parsed.skills, ['JavaScript', 'C++', 'C#', 'problem-solving']);
  assert.ok(!parsed.skills.includes('Java'));
});

test('M2 original survives fresh app/storage directory and reviewed versions remain immutable', async () => {
  const a = await register(); const source = 'Alex Student\nSummary\nBuilding accessible applications.\nSkills\nJavaScript, C++';
  const saved = await upload(a, source).expect(201), id = saved.body._id;
  assert.equal(saved.body.reviewStatus, 'needs_review'); assert.equal(saved.body.revision, 0);
  for (const field of ['originalData', 'originalHash', 'sourceText', 'versions', 'filePath']) assert.equal(saved.body[field], undefined);
  const secondApp = createApp({ config: { ...config, uploadDir: path.join(root, 'different-empty-container') } });
  const original = await request(secondApp).get('/api/resumes/' + id + '/download').set('Cookie', a.cookie).expect(200);
  assert.equal(original.text, source);
  const reviewed = source + '\nProjects\nAn accessible task planner.';
  const version1 = await a.agent.put('/api/resumes/' + id + '/content').set('X-CSRF-Token', a.csrf).send({ text: reviewed, revision: 0 }).expect(200);
  assert.equal(version1.body.revision, 1); assert.equal(version1.body.reviewStatus, 'ready');
  await a.agent.put('/api/resumes/' + id + '/content').set('X-CSRF-Token', a.csrf).send({ text: reviewed + '\nEducation\nBachelor of Computing', revision: 1 }).expect(200);
  const detail = await a.agent.get('/api/resumes/' + id).expect(200);
  assert.equal(detail.body.sourceText, source); assert.equal(detail.body.versions.length, 2);
  assert.equal(detail.body.versions[0].text, undefined);
  const history = await a.agent.get('/api/resumes/' + id + '/versions/1').expect(200);
  assert.equal(history.body.text, reviewed);
  const originalAgain = await a.agent.get('/api/resumes/' + id + '/download').expect(200); assert.equal(originalAgain.text, source);
  const list = await a.agent.get('/api/resumes').expect(200);
  assert.equal(list.body[0].sourceText, undefined); assert.equal(list.body[0].versions, undefined); assert.equal(list.body[0].originalData, undefined);
  assert.deepEqual(list.body[0].sections.skills, ['JavaScript', 'C++']);
});

test('M2 content/version routes enforce ownership, CSRF and stale-write rejection', async () => {
  const a = await register(), b = await register('other@example.com'), saved = await upload(a).expect(201), id = saved.body._id;
  await b.agent.put('/api/resumes/' + id + '/content').set('X-CSRF-Token', b.csrf).send({ text: 'Stolen', revision: 0 }).expect(404);
  await a.agent.put('/api/resumes/' + id + '/content').send({ text: 'Missing CSRF', revision: 0 }).expect(403);
  await a.agent.put('/api/resumes/' + id + '/content').set('X-CSRF-Token', a.csrf).send({ text: 'Summary\nReviewed facts.', revision: 0, originalData: 'injected' }).expect(400);
  await a.agent.put('/api/resumes/' + id + '/content').set('X-CSRF-Token', a.csrf).send({ text: 'Summary\nReviewed facts.', revision: 0 }).expect(200);
  await b.agent.get('/api/resumes/' + id + '/versions/1').expect(404);
  await a.agent.get('/api/resumes/' + id + '/versions/not-a-version').expect(400);
  await a.agent.put('/api/resumes/' + id + '/content').set('X-CSRF-Token', a.csrf).send({ text: 'Old tab overwrite', revision: 0 }).expect(409);
  const detail = await a.agent.get('/api/resumes/' + id).expect(200); assert.equal(detail.body.extractedText, 'Summary\nReviewed facts.');
});

test('M2 concurrent edits commit one version and bounded text/version limits preserve data', async () => {
  const a = await register(), saved = await upload(a).expect(201), id = saved.body._id;
  const changes = await Promise.all(['First tab', 'Second tab'].map(value => a.agent.put('/api/resumes/' + id + '/content').set('X-CSRF-Token', a.csrf).send({ text: value, revision: 0 })));
  assert.equal(changes.filter(r => r.status === 200).length, 1);
  assert.ok(changes.some(r => [409, 429].includes(r.status)));
  await a.agent.put('/api/resumes/' + id + '/content').set('X-CSRF-Token', a.csrf).send({ text: 'é'.repeat(50001), revision: 1 }).expect(413);
  const current = await Resume.findById(id).select('+versions');
  assert.equal(current.versions.length, 1);
  await Resume.updateOne({ _id: id }, { $set: { versions: Array.from({ length: 20 }, (_, i) => ({ revision: i + 1, text: 'Earlier text', savedAt: new Date(), sha256: 'fixture' })), revision: 20 } });
  await a.agent.put('/api/resumes/' + id + '/content').set('X-CSRF-Token', a.csrf).send({ text: 'Beyond cap', revision: 20 }).expect(409);
});

test('M2 library quotas are per account and original content is not stored on local disk', async () => {
  const a = await register(), b = await register('quota-other@example.com');
  await Resume.insertMany(Array.from({ length: 20 }, (_, i) => ({ userId: a.user._id, fileName: 'Existing ' + i, fileSize: 10, mimeType: 'text/plain', extractedText: 'Summary\nFacts.' })));
  await upload(a).expect(409);
  const accepted = await upload(b).expect(201);
  const stored = await Resume.findById(accepted.body._id).select('+originalData');
  assert.ok(stored.originalData.length > 0); assert.equal(stored.filePath, undefined);
  const limits = await b.agent.get('/api/resumes/limits').expect(200);
  assert.equal(limits.body.maxFileSize, config.maxFileSize); assert.equal(limits.body.maxResumes, 20);
});

test('M2 deletion removes original, reviewed versions and linked private matching records', async () => {
  const Match = (await import('../models/Match.js')).default, JobMatch = (await import('../models/JobMatch.js')).default;
  const a = await register(), saved = await upload(a).expect(201), id = saved.body._id;
  await a.agent.put('/api/resumes/' + id + '/content').set('X-CSRF-Token', a.csrf).send({ text: 'Reviewed sensitive fixture', revision: 0 }).expect(200);
  await Match.create({ userId: a.user._id, resumeId: id, jobDescriptionId: new mongoose.Types.ObjectId(), overallScore: 1 });
  await JobMatch.create({ userId: a.user._id, resumeId: id, jobId: new mongoose.Types.ObjectId(), matchScore: 1, notes: 'Private note' });
  await a.agent.delete('/api/resumes/' + id).set('X-CSRF-Token', a.csrf).expect(200);
  assert.equal(await Resume.countDocuments({ _id: id }), 0); assert.equal(await Match.countDocuments({ resumeId: id }), 0); assert.equal(await JobMatch.countDocuments({ resumeId: id }), 0);
  await a.agent.get('/api/resumes/' + id + '/versions/1').expect(404); await a.agent.get('/api/resumes/' + id + '/download').expect(404);
});

test('M2 isolated parser terminates on deadline and rejects unreadable PDF input', async () => {
  const { parseDocument } = await import('../services/boundedParser.js');
  await assert.rejects(parseDocument(Buffer.from('Summary\nA factual resume.'), 'text/plain', 1), error => error.code === 'PARSE_TIMEOUT');
  await assert.rejects(parseDocument(Buffer.from('%PDF-1.7\nnot a readable document'), 'application/pdf'), error => error.code === 'PARSE_FAILED');
});

test('M2 interrupted deletion is hidden from reads, visible for cleanup, and retryable', async () => {
  const Match = (await import('../models/Match.js')).default;
  const a = await register(), saved = await upload(a).expect(201), id = saved.body._id;
  const remove = Match.deleteMany;
  try {
    Match.deleteMany = async () => { throw new Error('Synthetic cleanup failure'); };
    await a.agent.delete('/api/resumes/' + id).set('X-CSRF-Token', a.csrf).expect(500);
  } finally { Match.deleteMany = remove; }
  await a.agent.get('/api/resumes/' + id).expect(404);
  await a.agent.get('/api/resumes/' + id + '/download').expect(404);
  const pending = await a.agent.get('/api/resumes').expect(200);
  assert.ok(pending.body[0].deletionRequestedAt); assert.equal(pending.body[0].originalData, undefined);
  await a.agent.delete('/api/resumes/' + id).set('X-CSRF-Token', a.csrf).expect(200);
  assert.equal(await Resume.countDocuments({ _id: id }), 0);
});

test('M2 review is required before existing resume content reaches AI analysis', async () => {
  const a = await register(), saved = await upload(a).expect(201), id = saved.body._id;
  process.env.OPENAI_API_KEY = 'synthetic-key-never-call-provider';
  try {
    await a.agent.post('/api/match').set('X-CSRF-Token', a.csrf).send({ resumeId: id, jdText: 'A frontend role' }).expect(409);
    await a.agent.post('/api/resume-builder/analyze').set('X-CSRF-Token', a.csrf).send({ resumeId: id, jdText: 'A frontend role' }).expect(409);
    await a.agent.post('/api/resume-builder/generate').set('X-CSRF-Token', a.csrf).send({ existingResumeId: id, jdText: 'A frontend role' }).expect(409);
  } finally { delete process.env.OPENAI_API_KEY; }
});

test('M2 exact 5 MiB original is accepted when extracted content is bounded', async () => {
  const a = await register();
  const prefix = 'Summary\nBounded factual content.';
  const data = Buffer.alloc(5 * 1024 * 1024, 32); data.write(prefix);
  const result = await a.agent.post('/api/resumes').set('X-CSRF-Token', a.csrf).attach('resume', data, { filename: 'boundary.txt', contentType: 'text/plain' }).expect(201);
  assert.equal(result.body.fileSize, data.length); assert.equal(result.body.extractedText, prefix);
  const stored = await Resume.findById(result.body._id).select('+originalData'); assert.equal(stored.originalData.length, data.length);
});
