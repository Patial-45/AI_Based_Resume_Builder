// Validate the documentation deliverables without external requests.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const names = ['README.md', 'Audit.md', 'PRD.md', 'Architecture.md', 'Database_Schema.md', 'Design.md', 'Modules.md', 'Workflow.md', 'Test_Cases.md', 'Work_Tracker.md', 'Deployment.md', 'docs/audit/Verification.md'];
const errors = [];
let links = 0;
for (const name of names) {
  const full = path.join(root, name);
  if (!fs.existsSync(full)) { errors.push(`Missing ${name}`); continue; }
  const content = fs.readFileSync(full, 'utf8');
  if (!/^# /m.test(content)) errors.push(`No title: ${name}`);
  if ((content.match(/^```/gm) || []).length % 2) errors.push(`Unclosed code fence: ${name}`);
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^(https?:|#)/.test(target)) continue;
    links++;
    if (!fs.existsSync(path.resolve(path.dirname(full), target.split('#')[0]))) errors.push(`Broken link ${name} -> ${target}`);
  }
}
const cases = fs.readFileSync(path.join(root, 'Test_Cases.md'), 'utf8').match(/^\| (?:SEC|AUTH|UP|AI|MATCH|BUILD|JOB|UI|OPS|PERF)-\d+ \/ P[012]/gm) || [];
if (cases.length !== 70) errors.push(`Expected 70 cases, got ${cases.length}`);
const audit = fs.readFileSync(path.join(root, 'Audit.md'), 'utf8');
const findings = audit.match(/^\| [SBU]\d+ \/ P[012]/gm) || [];
if (findings.length !== 50) errors.push(`Expected 50 findings, got ${findings.length}`);
console.log(JSON.stringify({ checkedDocuments: names.length, localLinks: links, testCases: cases.length, sourceFindings: findings.length, errors }, null, 2));
if (errors.length) process.exitCode = 1;
