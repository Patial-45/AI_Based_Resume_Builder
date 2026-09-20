# Project work tracker

Last updated: 2026-09-20, Asia/Kolkata. Owner-confirmed public-launch target: **Thursday 2026-10-15**. Original target September 13 elapsed without a launch. This Markdown file is the requested living work tracker; it is easy to version with code. No DOCX is needed to keep it current.

## Current state and owner decisions

- Audit/documentation delivered. Owner authorized the M1/M2 design and continued module development; M2 local implementation is complete and unrelated uncommitted edits are preserved.
- Owner requires **every current feature** for launch, including job discovery. No scope reduction approved.
- Owner selected **Vercel initially**, with no hosting account/domain yet; additional services may be proposed to meet project needs. No purchase/provisioning performed.
- M1/M2 have passing local API/browser evidence across full and targeted runs; final client lint/build pass. The September 20 verification record resolves the outstanding DOCX and desktop security checks. Dependency checks were clean at the earlier M1 audit and must be refreshed before release. Staging and overall acceptance remain open.
- One module at a time: implement → test → review → acceptance → next module. Technical acceptance must have evidence and must not be called owner approval.
- Current module: **M2 Resume library, parsing and review**. Status: **Implemented and locally verified; staging/acceptance open**. M1 design refresh is included; M3 is next after the M2 gate.

## Work completed before this audit

The repository contains authentication/profile, resume upload/parsing/library, AI/JD matching/history, ATS generation/TXT export, job scanning/recommendations/activity APIs, dashboard and reusable UI controls. Code exists for these capabilities; their production reliability is not established.

Historical records dated Aug 16–22 claim build/type fixes, Mongo fallback/CORS/proxy changes, upload fixes, additional scraper sources, job caching/persistence and parser/builder fallbacks. These are preserved in [test_records.md](test_records.md), with original README archived at [docs/audit/README-before-audit.md](docs/audit/README-before-audit.md). Several “success fallbacks” are now audit blockers because they fabricate results. Historical manual UX acceptance was still pending. Do not mark this earlier work newly tested or approved.

## Historical audit results (before M1 implementation)

| Item | Status | Evidence |
|---|---|---|
| Repository/code/data/architecture review | Complete within stated scope | Audit.md, Architecture.md, Database_Schema.md |
| Security and functional finding register | Complete within stated scope | Audit.md; 12 security, 30 functional/data and 8 UI findings |
| Current dependency advisory checks | Complete with findings | 28 server / 22 client affected package entries; docs/audit/*-dependencies.md |
| Offline defect reproduction | Complete | Six probes reproduced; docs/audit/reproduction-results.txt |
| Production frontend build | Pass | Vite 7.2.2, 109 modules; docs/audit/Verification.md |
| Frontend lint | Fail | 35 errors, 1 warning; remediation outstanding |
| PRD/design/module/test/release plan | Documented | PRD.md, Design.md, Modules.md, Test_Cases.md, Workflow.md, Deployment.md |
| Application fixes / design implementation | Not started in audit | No application source edits made |
| DB/provider/browser E2E / production deployment | Not performed | Must be recorded at module gates |

## Module board

| Module | Owner | Status | Depends on | Required gate | Target checkpoint | Actual completion / evidence | Acceptance |
|---|---|---|---|---|---|---|---|
| M0 Audit/docs | Assistant | Baseline authorized for M1 | — | Documents internally consistent; limits stated | Wed Sep 9 | This audit; Verification.md | Owner requested starting M1; no business module accepted |
| M1 Foundation/identity/design | Assistant | Local verification complete; staging gate open | M0 baseline | Auth, shared controls, containment, config, dependencies, harness and CI | Sep 23 staging readiness | 18 API scenarios; 8 browser scenarios across runs; lint/build; [evidence](docs/m1/Verification.md) | Not accepted: staging proof pending |
| M2 Resumes/parsing/storage | Codex | Local verification complete; acceptance open | Owner authorized continuation after M1 local checks | See docs/m2/Verification.md; staging/legacy migration/backups open | Sep 23 | [Local evidence](docs/m2/Verification.md) | Staging/owner review open |
| M3 Matching/history | Implementer to assign | Not started | M2 accepted | Honest validated scoring and persistent history | Sep 28 | — | — |
| M4 Builder/edit/export | Implementer to assign | Not started | M3 accepted | Fact-preserving editable saved draft and complete export | Oct 4 | — | — |
| M5 Jobs/activity/worker | Implementer to assign | Not started | M4 accepted | Real sources, bounded scans, durable activity and accepted coverage | Oct 10 | — | — |
| M6 Integration/deploy/release | Implementer + owner | Not started | M1–M5 accepted | Complete regression, operations, rollback and owner go/no-go | Oct 15 | — | — |

Target checkpoints are stretch checkpoints, not evidence that work fits the available time. If a module is still open, later modules remain queued even if their date arrives.

## Original effort estimates and revised schedule

| Work | Focused estimate including module test/fix cycle |
|---|---|
| M1 | 12–16 h |
| M2 | 10–14 h |
| M3 | 8–12 h |
| M4 | 10–14 h |
| M5 | 16–24 h |
| M6 | 10–14 h |
| **Total after audit** | **66–94 h** |

These are the original whole-project estimates, including work now implemented. The owner reset launch to October 15 on September 20. Remaining effort must be re-estimated at each module gate; external provisioning/source-access delays remain a risk. Do not compress the schedule by skipping tests, fabricating source results or removing required functionality.

October plan: finish the current module gate before advancing, preserve October 11–15 for integration and release validation, and report any missed checkpoint with its effect on October 15. Hosting/account readiness should be arranged by September 23 to avoid a last-week provisioning blocker. All existing features remain required.

## Launch blockers and work items

| ID | Work | Priority | Module | Status | Completion evidence |
|---|---|---|---|---|---|
| W01 | Stop protected-field updates and out-of-root deletion | P0 | M1/M2 | Open | SEC-01/02 |
| W02 | Private retrieval and safe upload validation | P0 | M1/M2 | Open | SEC-03–06, UP-01–04 |
| W03 | Remove secret/PII logs; enforce auth/AI/storage quotas | P0/P1 | M1 | Open | SEC-07–11 |
| W04 | Remediate dependency findings with compatibility tests | P0/P1 | M1 | Open | Fresh audit, lockfile diff, module regression |
| W05 | Fix false parse success, inactive reads and lifecycle | P0/P1 | M2 | Open | UP-02/03/07, SEC-14 |
| W06 | Correct missing-score weighting and outage behavior | P0/P1 | M3 | Open | AI-01–04 |
| W07 | Working history links, persistent analysis/version metadata | P1 | M3 | Open | MATCH-01–06 |
| W08 | Eliminate invented resume facts; full edit/save/preview plus built-in ATS-focused template with PDF/DOCX export and optional TXT | P0/P1 | M4 | Open | AI-05, BUILD-01–05 |
| W09 | Replace fake jobs and unsupported location/date claims | P0/P1 | M5 | Open | JOB-01–04 and source coverage matrix |
| W10 | Fix job TTL/snapshots, per-version scores and unsafe upserts | P1 | M5 | Open | JOB-05–08 |
| W11 | Isolate/bound worker and block unsafe network destinations | P1 | M5 | Open | SEC-08/13, JOB-08/09, PERF-02 |
| W12 | Clean typography/UI/motion plus keyboard/mobile accessibility | P1/P2 | M1 then each module | Open | UI-01–07 screenshots/checks |
| W13 | Passing lint, automated backend/E2E and reproducible CI | P1 | M1 then each module | Open | CI artifact links |
| W14 | Vercel + API/DB/private storage/worker provisioning | P1 | M1 proof; M6 final | Pending accounts/budget | Deployment.md, OPS checks |
| W15 | Backup restore, monitoring, privacy/recovery/support and rollback | P1 | M6 | Open | OPS-06–08 and owner review |

## Decisions and risks

| Decision/risk | Status | Owner / next step |
|---|---|---|
| All existing features required | Confirmed Sep 9 | Owner; preserve scope |
| Initial Vercel hosting | Confirmed Sep 9 | Owner creates/signs into account |
| API/worker host and budget | Proposed external container; not provisioned | Owner selects plan after M1 topology review |
| Mongo/storage and AI account availability | Unverified for production | Owner provides through provider settings, never committed files |
| Accepted job-source coverage | Pending; ≥2 real sources proposed; advertised unavailable sources must be disclosed | Owner at M5; no invented replacements |
| Source-site access/reliability | High risk | Adapter tests with truthful partial failure; no bypassing source access controls |
| Sunday deadline versus effort | High risk | Reforecast after every gate; no automatic scope cut |
| Recovery/retention/support policy | Pending | Owner before signup release |

## Per-module completion record (copy for each module)

```text
Module:
Owner:
Started / finished:
Revision / environment:
Implemented behavior:
Changed files / migration:
Test IDs passed / failed / blocked:
Evidence paths (logs, screenshots, exported documents):
Security and dependency recheck:
Earlier-module regression results:
Open issues / severity:
Rollback verified:
Technical reviewer + acceptance date:
Owner approval (exact decision/date, or pending):
Next module may start: yes/no, with reason:
Actual effort / revised launch forecast:
```

## Release record

Production URL: **Not assigned**. Candidate revision: **Not assigned**. Deploy time: **Not deployed**. Backup/restore: **Not tested**. Rollback target: **Not assigned**. All-module acceptance: **Pending**. Owner go/no-go: **Pending**.

Maintain the tracker at each meaningful code/test/approval change. “Done” requires evidence; do not change every row to done because a page looks finished or compilation passes.
## Module 1 work in this implementation

| Area | Status | Evidence / next gate |
|---|---|---|
| App lifecycle/configuration | Implemented, local checks pass | app.js, server.js, environment.js; invalid config and readiness tests |
| Revocable identity and recovery | Implemented, API checks pass | Cookie/CSRF/profile/password/recovery scenarios in server/tests/foundation.test.js |
| Upload containment | Implemented, API checks pass | Private owner download, protected-field rejection, traversal sentinel, multipart/type/DOCX limits |
| Request/provider limits and redaction | Implemented, local checks pass | Shared counters, bounded leases, provider-key isolation, request-ID errors |
| Dependency remediation | 0 current npm advisories | Patched lockfiles; not a claim that every application finding is closed |
| Shared UI and identity screens | Implemented, browser scenarios pass | Auth/settings/navigation/inputs/dialog/reduced motion; screenshots in docs/m1 |
| Automated harness/CI | Implemented | 18 API scenarios; desktop/mobile browser scenarios; workflow file. Remote CI not run. |
| Deployment preparation | Implemented locally | Environment examples, Dockerfile, Vercel config generator and runbook |
| Module acceptance | Open | Live-hosting proof and final acceptance outstanding |
| Module 2 | Queued | Has not started |

See [Module 1 verification](docs/m1/Verification.md) and [runbook](docs/m1/Runbook.md). Historical audit findings remain preserved; only the tested containment/identity findings may be treated as remediated. The unsafe job scanner is temporarily unavailable, not removed from launch scope. No production database migration, cloud provisioning, purchase or deployment was performed.

## Sep 10 — formatted resume export clarification

Owner reported that JD-tailored resume download is TXT-only. Confirmed in client/src/pages/ResumeBuilder.tsx: handleSaveResume creates a text/plain Blob and .txt download. This belongs to M4 Builder/edit/export, which already covered a professional template and PDF; editable DOCX is now explicitly included in the planned scope. Implementation remains queued in module order.

Launch direction: one built-in single-column ATS-focused template, complete preview, formatted PDF and editable DOCX exports, with TXT as an optional fallback. M2 preserves the original file separately; exact reproduction of arbitrary uploaded layouts and a multi-template gallery are outside the agreed launch baseline. Template compatibility must be tested using generated artifacts and text extraction; do not claim universal ATS certification or industry adoption without evidence. BUILD-03/04 and UI-07 are the export acceptance checks. Reassess M4 effort for DOCX rendering and visual verification at its readiness gate; the existing estimate is not proof this additional work fits the deadline.

## Sep 10 — approved design implementation

Owner approved the shared Module 1/2 concept after changing the canvas to warm off-white and accents to deep teal, then authorized continuing development. M1 shared-shell/settings refresh is implemented with local verification; the owner’s visual approval is not production/staging acceptance. Reference: docs/design/approved-m1-m2-concept.png. M2 implementation followed the passing local M1 checks; staging acceptance is still open. The same palette, typography and controls apply to later modules.

## September 11 implementation handoff

- Applied the approved warm off-white canvas, teal actions, charcoal sans typography, shared sidebar/mobile navigation, consistent controls, focus states and reduced motion to the M1/M2 surfaces.
- M2: private original preservation, isolated bounded parsing, complete source/text review, readiness gate, revision conflicts, immutable saved versions, rename, original download and retryable cascade deletion. Tab-memory draft recovery handles session expiry for the same account without browser storage.
- Verification: [M2 evidence](docs/m2/Verification.md), [runbook](docs/m2/Runbook.md), [design implementation](docs/design/Implementation.md). The earlier 18-test M1 record is historical; 28 unique API scenarios now have passing evidence across full and targeted runs.
- M3 matching/history has not started. M4 owns structured editing and PDF/DOCX template exports. M5 owns restoring real job discovery; the scanner remains quarantined. All features remain mandatory.
- Release remains blocked on later modules and live environment proof. No hosting, domain, production database migration, backup restore or deployment was performed. Sunday is a high-risk target, not a verified delivery promise.


### Final local gate issue — September 11

The final combined browser regression is not clean: intermittent sign-up/parser/post-deletion refresh timeouts occurred despite earlier passing runs. Mobile security feedback and session-expiry recovery passed the focused diagnostic run. The last desktop rerun could not start its isolated MongoDB fixture. No runtime timeout or security/parser bound was relaxed to obtain a pass. M2 remains implemented with acceptance open; stabilize the local fixture and rerun the failed checks before advancing to M3. See docs/m2/Verification.md for exact outcomes.

Final static checks: client lint and production build pass (127 modules). Documentation validation passes: 12 documents, 64 local links, 70 planned cases, 50 historical findings. Mobile security-feedback fix passed reviewer visual recheck. Browser repeatability and staging gates remain open.


## September 20 resumed verification

The previous run was interrupted. The saved M2 fixes load only the required document parser, allow 60 seconds for the isolated test MongoDB process to start, and initialize resume indexes before browser-fixture readiness. Application authentication and parsing limits remain unchanged.

Rename/delete now update library state only after confirmed server responses and do not depend on a redundant list fetch. Their regression test simulates a failing list endpoint after mutation. Workflow tests create accounts through the real registration API; dedicated authentication UI tests remain separate. Server-dependent save/delete expectations now use explicit 20-second waits, consistent with the main save case.

The ten targeted M2 API checks passed on September 11 after the parser change. Fresh browser checks, DOCX regression and final static validation are in progress; no new acceptance is claimed. The original deadline is historical and later modules remain queued.

## Owner-confirmed October 15 release plan — September 20

| Window | Outcome / exit gate |
|---|---|
| Sep 20–23 | Finish M2 regression and M1/M2 acceptance evidence; resolve local test stability; arrange Vercel, API hosting and MongoDB account readiness |
| Sep 24–28 | M3: honest JD matching, validated analysis, durable history and failure handling |
| Sep 29–Oct 4 | M4: complete editable drafts, fact preservation, approved ATS template, inspected PDF and DOCX exports |
| Oct 5–10 | M5: verified real job sources, bounded scanning and saved/applied/ignored activity |
| Oct 11–14 | M6: full regression, responsive/accessibility/security review, staging persistence, migration/backup restore, rollback and production smoke checks |
| Oct 15 | Owner go/no-go and release only when required gates pass |

Dates are planning checkpoints; a failed critical gate holds release. The owner changed the date, not feature scope or the sequential test requirement. The original September deadline and earlier test results remain historical evidence.

### September 20 verification outcome

The four previously failing desktop/mobile resume cases now pass, including confirmed-mutation behavior when a redundant list request fails. Mobile security passed; the remaining desktop security check passed in isolation after other heavy work was paused. DOCX and password API regressions passed. Final lint/build pass; the reviewer cleared the security-feedback fix on both screen sizes. Exact runs, earlier failures and remaining staging/owner gates are recorded in docs/m2/Verification.md. M3 is next in the plan and has not been started.
