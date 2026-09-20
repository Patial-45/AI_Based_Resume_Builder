# Test cases and acceptance ledger

Baseline: 2026-09-09. This is a **test specification**, not a claim that the listed product tests have passed. All acceptance cases below are **NOT RUN** in this audit unless the execution ledger explicitly says otherwise. Historical records remain in test_records.md. Offline defect probes in docs/audit/reproduce.mjs intentionally assert existing defects and do not count as acceptance passes.

## Environments, fixtures and method

Local unit tests mock AI/network; integration uses an isolated Mongo database and private temporary storage; E2E uses staging. Fixtures: users A/B, valid one-page PDF, two-page PDF, DOCX, UTF-8 TXT, corrupt PDF, scanned PDF, empty file, legacy DOC, MIME/extension mismatch, harmless HTML fixture, 5 MB boundary files, student resume with no employment, mixed Java/JavaScript skills, long JD, provider JSON variants, duplicate/expired jobs and conflicting draft revisions. All content is synthetic. Do not stress production or use real user files.

For every run record case ID, exact revision, environment, date/tester, result, observed behavior, artifact path and bug ID. Unit assertions cover domain rules; integration asserts HTTP status/data/DB/file effects; E2E checks real controls and reload persistence. P0/P1 cases must pass for the relevant module gate. Security probes use only isolated data and harmless sentinels.

## Security

| ID / priority | Preconditions | Action | Expected result |
|---|---|---|---|
| SEC-01 / P0 | A owns resume; synthetic out-of-storage sentinel | PUT protected filePath/storageKey/userId/isActive/embedding and `$set` variants | Rejected with 400 or explicitly ignored under documented contract; protected fields unchanged; no external file access |
| SEC-02 / P0 | Isolated FS and A resume | Attempt update-path then delete; include relative/absolute/traversal/separator variants | Only server-resolved owned file can be deleted; sentinel untouched; no path disclosure |
| SEC-03 / P0 | A and B own private objects; one deleted A resume | B reads/updates/deletes/downloads A resume, JD, match, draft or task; A uses deleted resume | Uniform 404/403 per contract; no content or derived analysis returned; no mutation |
| SEC-04 / P0 | Allowed format fixtures plus harmless HTML with text/plain or generic binary MIME | Upload extension/MIME/signature mismatches, SVG/HTML/legacy DOC, extra files | Rejected before usable record; no executable public content; cleanup proven |
| SEC-05 / P0 | A valid stored file and old public URL | Anonymous/B GET original and download URLs; A downloads | Anonymous/B denied; A gets attachment with correct MIME/nosniff; no shared-cache leak |
| SEC-06 / P0 | Patched multipart stack, isolated upload server | Malformed boundary, aborted transfer, oversized/deep fields within safe test budget | Controlled 4xx, no process crash, residual temp file leak or unbounded memory; advisory regression cases pass |
| SEC-07 / P0 | Synthetic users and configured rate policy | Burst invalid logins/register/upload/analysis from same account/IP; restart/multi-instance scenario | 429 with bounded retry guidance; useful legitimate traffic works; limits not bypassed by replicas |
| SEC-08 / P0 | Mock providers and worker capacity limits | Repeated concurrent scan/AI requests, huge generated query list | Max active tasks/queries/provider spend enforced; excess rejected/queued with cap; no unbounded browsers |
| SEC-09 / P1 | Capture app/client/server logs with synthetic secret markers | Invalid registration, successful registration, auth header, malformed AI reply | Markers/password/token/raw resume absent from logs and error responses; request IDs retained |
| SEC-10 / P1 | Two sessions and expiring/revocable session fixture | Expire, logout, replay token, switch tab; submit cross-origin state change if cookies used | Expired/revoked credential rejected; UI resets coherently; CSRF attempts fail |
| SEC-11 / P1 | Production-like origin/HTTPS setup | Allowed/forbidden Origin, missing NODE_ENV, header inspection | Production config fail-closed, allowlist enforced; expected security headers; browser and curl behavior distinguished |
| SEC-12 / P1 | All route groups and query endpoints | Invalid/ObjectId-like IDs, wrong types, negative/zero/huge limit, whitespace/oversized text, invalid salary | Consistent 400/422; bounded page size; no raw cast/provider stack; no cost-incurring work before validation |
| SEC-13 / P1 | Isolated network policy/mock redirect server | Scraped link/redirect to loopback, private, link-local or unsupported scheme; oversized response | Fetch denied at every hop, response caps/timeouts enforced; worker has no app secrets or unsafe browser sandbox |
| SEC-14 / P1 | A file, draft, embeddings, analysis and backup policy | Complete delete and attempt direct/derived reads; inspect retention notices | Live PII/derived data removed per policy; minimal receipt, backup retention disclosed; deletion cannot reactivate record |

## Authentication and profile

| ID / priority | Preconditions | Action | Expected result |
|---|---|---|---|
| AUTH-01 / P1 | Empty test user DB | Register valid identity; login; reload workspace | Single normalized account; password hashed; valid session; no secret in DTO/logs |
| AUTH-02 / P1 | Existing normalized email | Register duplicate including capitalization; concurrent duplicate registration | One account, deterministic conflict without raw DB error |
| AUTH-03 / P1 | Existing user | Wrong/missing credentials, leading/trailing whitespace according to normalization contract | Generic credential error; no enumeration from login; validation consistent with registration |
| AUTH-04 / P1 | Corrupt localStorage JSON/token/user values | Load app | Recovers to signed-out state with usable login; no stuck spinner/crash |
| AUTH-05 / P1 | Expired/deleted-user session | Reload and navigate protected URL | Server validation denies session, login shown; no stale identity indefinitely |
| AUTH-06 / P2 | Logged-in A | Save new name/preferences, navigate and reload | Navbar/profile reflect new values; salary bounds/currency validated; unsupported preferences not falsely promised |
| AUTH-07 / P1 | Missing session secret or provider configuration | Start/register; exercise recovery path using synthetic account | Invalid required config prevents traffic/account partial creation; optional AI failure does not break identity; recovery works or documented approved support plan is tested |

## Resume upload and lifecycle

| ID / priority | Preconditions | Action | Expected result |
|---|---|---|---|
| UP-01 / P1 | A signed in; valid PDF/DOCX/TXT | Browse/drop/upload each, list and download | Accurate filename/size/type, private storage and extracted content; no path/vector in list DTO |
| UP-02 / P0 | Corrupt/empty/unsupported fixture | Upload then attempt match | Explicit error/needs-review; no placeholder success, embedding or match on unusable content |
| UP-03 / P1 | Image-only scanned PDF | Upload | Clear OCR-not-supported/needs-text guidance and retry route; no invented content |
| UP-04 / P1 | Files just below/at/above cap; exported TXT | Upload locally and through deployed path | Consistent cap and supported formats; accepted 5 MB path works; reject oversize with useful 413/validation message |
| UP-05 / P2 | JavaScript-only text; ordinary word containing “ai”; body sentence with “experience” | Parse and review | No Java/AI false positives or heading truncation; raw extraction retained for correction |
| UP-06 / P1 | Student fixture without employment | Parse/edit/save | Empty experience preserved; no employer/dates invented; reviewed facts and version saved |
| UP-07 / P1 | Ready resume with dependent data | Delete; reload; retry delete; use old ID | Idempotent documented deletion, no direct access/match/reactivation; history retains only allowed sanitized state |

## AI and matching

| ID / priority | Preconditions | Action | Expected result |
|---|---|---|---|
| AI-01 / P1 | Mock AI score 80 with missing semantic vector; real score 0 fixture | Calculate final score | Missing component excluded/renormalized under documented method; zero retained; no unexplained 56 score |
| AI-02 / P0 | Provider unavailable/429/timeout | Request matching | Honest unavailable/partial status; no invented 35/50 score; bounded retry and no duplicate charges/records |
| AI-03 / P1 | Mock malformed JSON, missing arrays, strings as numbers, >100, negative, NaN vectors | Parse/persist/render | Complete schema rejection or controlled normalized result; no 500/render crash or invalid DB write |
| AI-04 / P1 | Resume/JD includes instructions to ignore rules and output secrets or arbitrary score | Analyze | Document treated as untrusted data; no app secrets exposed; schema/fact checks and evaluated scoring behavior recorded |
| AI-05 / P0 | Student/existing factual resume, missing provider | Generate/improve sections including requested fabricated metrics | No invented employer/degree/credential/metric; source facts preserved; suggestions require review; outage explicit |
| MATCH-01 / P1 | A owned active resume/JD | Create match with pasted and existing JD | Validated result tied to correct immutable inputs and owner; title/company and method displayed |
| MATCH-02 / P1 | Stored match | Click history detail; direct load detail URL; invalid/foreign ID | Loads saved analysis, no new paid analysis; useful 404/access error |
| MATCH-03 / P1 | Detailed provider output | Match then reload history/detail | Full displayed analysis persists or unused call removed; results/model/version consistent |
| MATCH-04 / P1 | Slow A result, faster B request; repeated submit | Switch input version/JD during pending request; retry | Stale result cannot overwrite current selection; input version labelled; idempotent request policy |
| MATCH-05 / P2 | 60 historical matches | View dashboard and paginate history | Counts/averages accurate for declared range; older results reachable; no false “all” claim |
| MATCH-06 / P2 | Fixed clock near midnight, exact now, yesterday and future invalid date | Render history dates | Correct local calendar labels; invalid/future dates handled consistently |

## Builder and export

| ID / priority | Preconditions | Action | Expected result |
|---|---|---|---|
| BUILD-01 / P0 | Source resume plus provider failure | Generate with/without existing resume | Factual draft or clear unavailable response; never fabricated employment/ATS score |
| BUILD-02 / P1 | Structured draft, two revisions | Edit fields, apply/dismiss suggestion, save, refresh; conflict save | Confirmed save survives; revision conflict recoverable; no silent overwrite |
| BUILD-03 / P1 | Two-page content with education/projects/certifications/tools | Preview, formatted PDF, editable DOCX and optional TXT export from the built-in template | Entire reviewed saved content present in each output, readable page breaks, selectable PDF text, no UI controls; DOCX opens and remains editable; extracted text preserves section reading order |
| BUILD-04 / P1 | Name/email/phone/location and special/unicode characters | Export/open downloaded file | Contact data and characters intact in PDF/DOCX/TXT; download name and file type correct; TXT can be reimported; original uploaded file remains separately downloadable |
| BUILD-05 / P1 | Missing/foreign/deleted source IDs | Generate/analyze/improve-section by each ID | Correct 404/403, no silent source omission; owned section improvement available and fact-preserving |

## Job discovery and activity

| ID / priority | Preconditions | Action | Expected result |
|---|---|---|---|
| JOB-01 / P0 | All external sources mocked unavailable | Scan | Explicit unavailable/empty with source statuses; zero fabricated listings/companies/URLs |
| JOB-02 / P1 | Approved real-source fixtures and staging access | Fetch each advertised source, including Cutshort/Hirist/Wellfound/ITJobs | Actual listing evidence or labelled source failure; search-page link is never a verified individual job; accepted coverage recorded |
| JOB-03 / P1 | India/US-only/worldwide/unknown roles, source dates and preference combinations | Scan/filter | Preserve true eligibility/date, unknown labelled; remote/salary filters truthful; no forced India eligibility |
| JOB-04 / P1 | Missing vectors and updated existing listing | Rescan/rank | Honest score method/null, refreshed metadata/fetchedAt and content; no arbitrary 50% |
| JOB-05 / P1 | Saved/applied listing then expire/delete cache entry | Read recommended/saved lists in API/UI | Durable snapshot survives; expired label; null relation cannot crash screen |
| JOB-06 / P1 | Resume A and B with same job | Scan A then B and revisit A | Independent version scores; user activity preserved without overwriting A results |
| JOB-07 / P1 | Valid and nonexistent job IDs | Save/unsave/apply/unapply/ignore/restore, including repeated requests | Valid state transitions and idempotence; nonexistent IDs rejected; no incomplete upserts |
| JOB-08 / P1 | Concurrent same-user scans and duplicate source URL | Run repeated tasks and restart worker mid-task | Single canonical listing, bounded retries, consistent result count, no lost activity; task lease recovery |
| JOB-09 / P1 | Slow scan A, selection B, cancelled client and reloaded page | Switch/cancel/reload task progress | Correct ownership and source resume retained; stale responses ignored; task status recoverable |

## UI and design

| ID / priority | Preconditions | Action | Expected result |
|---|---|---|---|
| UI-01 / P1 | All core screens | Keyboard-only complete journey | Browse/upload/edit/export/save jobs/logout reachable; focus visible; no nested interactive elements |
| UI-02 / P1 | Inputs, selects, errors, nav, progress and icon controls | Inspect accessibility tree/screen-reader announcements | Names, label associations, invalid/describedby/current/expanded/progress states accurate |
| UI-03 / P1 | Open dialog with background form | Tab/Shift-Tab/Escape and dismiss | Focus trapped/restored, background inert, named dialog/close button; no lost scroll state |
| UI-04 / P1 | Reduced motion, 200% zoom, 360–1440px, long content | Use all screens/touch actions | Essential controls remain visible; no overflow/trapping; reduced motion suppresses nonessential animation |
| UI-05 / P1 | Loading/empty/error/partial/stale states and proposed tokens | Render each state, measure contrast | Distinct understandable states, retry and preserved input, contrast target met, no color-only meaning |
| UI-06 / P2 | Low/medium/high match scores | Inspect result border and labels | Correct actual CSS colors/classes, meaningful method labels and finite progress values |
| UI-07 / P1 | Complete long resume, desktop/mobile | Compare editor, preview and export visual QA | Consistent typography, complete content/contact, good breaks and print margins; screenshots/PDF retained |

## Deployment, resilience and performance

| ID / priority | Preconditions | Action | Expected result |
|---|---|---|---|
| OPS-01 / P1 | Production-like API | Disconnect primary DB after startup and inspect readiness | Readiness unhealthy; no fallback to unrelated local DB; safe errors and recovery |
| OPS-02 / P1 | Required config variants and HTTPS/proxy | Start with missing/weak secret/wrong origin; inspect headers | Invalid production config rejected before writes; HTTPS and session/proxy behavior correct |
| OPS-03 / P1 | Each optional AI key missing individually | Import/start app, auth/upload, invoke AI feature | Available modules work; explicit AI capability failure, no import-time process crash |
| OPS-04 / P1 | Vercel preview and API routing | Direct-load every route/unknown URL, API 404 and asset URL | SPA routes work; meaningful 404; API receives JSON errors, never index.html; assets not swallowed |
| OPS-05 / P1 | Private upload store and two accounts | Deployed boundary upload, download then repeat request as B/anonymous | No function payload mismatch or shared-cache leak; original bytes correct; storage survives redeploy |
| OPS-06 / P1 | Backup and new empty restore environment | Restore DB + file fixtures, verify hashes/refs/deletion policy | Usable matched dataset; recorded RPO/RTO; no accidentally revived deleted PII |
| OPS-07 / P1 | Release candidate and previous compatible build | Deploy, smoke, roll back and restart worker | No lost confirmed saves, schema compatibility, no duplicate jobs, known rollback duration |
| OPS-08 / P1 | Synthetic errors/budget threshold | Trigger sanitized error/worker failure/spend alert | Actionable alert received through configured service; logs contain no PII; owner/support runbook works |
| PERF-01 / P1 | 10 concurrent synthetic users, large libraries | List/upload/match within quotas; inspect payloads and latency | Bounded pages/DTOs, no filePath/vectors in summaries; PRD latency targets measured with environment |
| PERF-02 / P1 | Bounded scan worker and multiple users | Concurrent scans and provider slowdown | Queue/concurrency/memory remain within configured limits; auth/library responsive; deadline/retry policy works |

## Execution ledger (this audit)

| Run ID | Check | Result | Date | Evidence / scope |
|---|---|---|---|---|
| AUD-BUILD-01 | Client production build | PASS | 2026-09-09 | Vite 7.2.2, 109 modules; sandbox retry required; docs/audit/Verification.md |
| AUD-LINT-01 | Client ESLint | FAIL | 2026-09-09 | 35 errors, 1 warning; docs/audit/Verification.md |
| AUD-DEP-01 | Server registry dependency audit | FINDINGS | 2026-09-09 | 28 package entries; docs/audit/server-npm-audit.json |
| AUD-DEP-02 | Client registry dependency audit | FINDINGS | 2026-09-09 | 22 package entries; docs/audit/client-npm-audit.json |
| AUD-PROBE-01 | Six offline defect probes | DEFECTS REPRODUCED | 2026-09-09 | docs/audit/reproduction-results.txt; no DB/network/real deletion |
| ACCEPTANCE-ALL | Product acceptance matrix above | NOT RUN | — | No live DB/provider/browser E2E performed in audit |

Gate record template: `Module / Case IDs / Revision / Environment / Executed by / Date / Passed / Failed / Blocked / Evidence / Remaining defects / Technical acceptance / Owner approval`. Preserve previous runs; append new results instead of silently replacing failures.
## Module 1 execution update — 2026-09-09

The original 70-case matrix remains the project-wide acceptance contract. The new automated suite contains 18 multi-assertion API scenarios; these are not equivalent to claiming 18/70 project cases are fully closed.

| Matrix group | Current evidence | Remaining scope |
|---|---|---|
| AUTH-01–05 | API registration/normalization/duplicate/hash/session/expiry/revocation pass; client reload/corrupt-storage browser verification | All eight browser scenarios have passed across the full and targeted reruns; see verification record |
| AUTH-06 | Profile updates and salary bounds persist in API tests | Full discovery preference/currency behavior belongs to M5 |
| AUTH-07 | Missing config rejects startup; missing AI does not break import/auth; one-time recovery works and revokes sessions | Real hosting configuration/support readiness |
| SEC-01/02/04/05 | Protected-field/path containment, private owner download and malicious file rejection pass | M2 complete storage lifecycle and deployed object store |
| SEC-03 | Two-user resume isolation, inactive reads and protected updates pass | Full draft/task/JD/job relationships across later modules |
| SEC-06/07/08 | Malformed/oversized multipart, shared rate limits and concurrent AI slot caps pass | Broader abort/stress/provider/worker tests |
| SEC-09 | Safe error responses and no sensitive markers in captured app logs pass | Staging monitoring/provider end-to-end verification |
| UI-01–05 | Shared components implemented; heading/focus issues fixed and tested on desktop/mobile | Complete later-module journeys and manual screen-reader/zoom checks |
| OPS-01–03 | App readiness/config/cookie flags/provider-key absence tested locally | Live DB outage recovery and deployed proxy/cookie proof |

Actual results and limitations: [Module 1 verification](docs/m1/Verification.md). Module acceptance remains open until its recorded gate is satisfied.

## September 11 M1 refresh / M2 execution record

The 70 cases above remain the acceptance plan, not 70 passing results. M2 API checks cover truthful parsing, atomic original preservation across app instances, private access/CSRF, revision conflicts, concurrent saves, UTF-8/version/file quotas, deletion cascade and retry, parser timeout/corrupt input, review-before-analysis and exact 5 MiB input. The foundation suite has 28 unique scenarios with passing evidence across the full and targeted runs.

Browser coverage includes desktop/mobile source review, save/reload/version inspection, rename, original-byte download, deletion, library retry, corrupt PDF, real two-page PDF, conflict/draft retention, session-expiry recovery and settings/navigation. Execution outcomes, reruns and remaining live-environment gaps are recorded in [M2 verification](docs/m2/Verification.md). Staging storage/rollback/backups and later-module cases remain open.


## September 20 verification closure

The previously failing resume lifecycle/session cases passed on both screen sizes after the targeted fixes. Security feedback passed on mobile and in the final isolated desktop run. DOCX and password API regressions passed; final lint/build pass. Real API account setup now avoids repeated sign-up navigation in unrelated workflow tests. This does not mark all 70 planned acceptance cases complete. See [current M2 evidence](docs/m2/Verification.md) for exact coverage, simulated failures and open staging gates.
