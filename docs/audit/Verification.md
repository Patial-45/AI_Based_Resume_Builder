# Audit verification record

Date: 2026-09-09. Working directory: Resume Builder. Local runtime observed: Node 22.13.1, npm 10.9.2. Existing uncommitted application changes were audited as-is and preserved.

## Completed checks

| Check | Command / method | Result |
|---|---|---|
| Current source inventory | rg files + source reads + git status | Reviewed route/controller/model/service/frontend/config surfaces; no AGENTS.md found in workspace or checked immediate parent locations |
| Production frontend build | npm run build in client | PASS on authorized rerun: tsc then Vite 7.2.2, 109 modules, JS 336.76 kB (102.23 gzip), CSS 42.19 kB (6.63 gzip), 19.18s Vite build |
| Client lint | npm run lint in client | FAIL: 35 errors and 1 warning. Explicit any, unused catch bindings, AuthContext mixed export rule, JobSearch effect dependency |
| Backend syntax | node --check on every server JavaScript file outside dependencies/uploads | PASS: 24 files. Syntax only; does not verify DB/provider behavior |
| Server dependency audit | npm audit --json --prefix server | 28 affected package entries: critical 1, high 22, moderate 5 |
| Client dependency audit | npm audit --json --prefix client | 22 affected package entries: high 17, moderate 3, low 2 |
| Offline probes | node docs/audit/reproduce.mjs | Six defects reproduced; exit 0 means reproduction assertions passed, not security/feature acceptance |
| Existing backend test suite | Read server/package.json and searched repository | Placeholder test command exits 1; no meaningful existing backend/E2E suite discovered |
| Documentation validation | node docs/audit/check-docs.mjs | PASS: 12 documents, 39 local links, 70 case IDs, 50 source finding IDs, no missing links or unclosed fences; document-check-results.json |

Initial production build failed due to sandbox access denial when esbuild resolved the workspace path. It was rerun with the required permission and passed. Initial npm audits failed due to registry/cache access in the sandbox; authorized read-only reruns produced the saved JSON. Dependency exit code 1 denotes findings, not an incomplete network scan in the final records.

## Offline probe details

- B01: nonexistent PDF returns placeholder extraction.
- B03: no-provider builder fallback invents employment/certifications and score 88.
- B06: Cutshort/Hirist adapters return live-labelled invented roles without network.
- S01: mocked query receives protected owner/path fields; mocked deletion uses the supplied path.
- B09: inspected Mongoose schema confirms three-day Job TTL and user/job-only score uniqueness.
- B02: mocked lookup of a soft-deleted resume is not excluded.

The probe script overwrites provider variables with dummy values within its own process, never loads real .env, uses no real Mongo connection and performs no real file deletion. Its missing-file read is intentional. Output is [reproduction-results.txt](reproduction-results.txt). Provider calls are not made.

## Dependency evidence and interpretation

[Server complete package/advisory table](server-dependencies.md), [client table](client-dependencies.md), [server raw JSON](server-npm-audit.json), [client raw JSON](client-npm-audit.json). Tables include locked version and dependency-tree scope. “Production dependency tree” does not prove code is included in the browser bundle or that the vulnerable API is reachable. For example, Axios Node-only transitive dependencies and build/download tools need advisory-specific tracing.

Critical registry entry: basic-ftp 5.0.5, transitive server dependency; do not report this as proven unauthenticated remote code execution in the app. Direct affected dependencies include Axios, Express, Mongoose, Puppeteer, node-cron on server and Axios, React Router DOM, Vite, PostCSS on client. Registry reported fix availability; some proposed fixes are major upgrades and require migration testing. Independently verified Multer advisories cover locked 1.4.5-lts.2 even though it was absent from this registry response. No package or lockfile was modified.

## Not executed

No real DB integration, live AI generation/embedding, external job scan, browser-rendered visual inspection, screen-reader testing, deployed endpoint scan, concurrency/load test, backup restore or production deployment. All corresponding cases in Test_Cases.md remain NOT RUN. Six local reproductions and successful compilation do not establish feature readiness.

Original README is preserved at [README-before-audit.md](README-before-audit.md). Historical test_records.md and UI_UX_IMPROVEMENTS.md are unchanged and are not the current acceptance ledger.
