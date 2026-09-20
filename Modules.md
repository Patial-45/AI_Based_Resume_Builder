# Modules and sequential acceptance gates

2026-09-09. User requirement: fully build and test one module; advance only when approved or demonstrably working smoothly. All current feature categories are required for public launch. Modules are vertical slices covering API, data, UI and tests, not backend-only stages.

## Execution order

`M0 Audit & documentation → M1 Foundation/identity/design system → M2 Resume library & parsing → M3 Matching/history → M4 Builder/export → M5 Job discovery/activity → M6 Release validation`

Only one module is active. M0 delivers a plan, not production fixes. A technical acceptance gate may satisfy “working smoothly” only with recorded evidence against the agreed criteria; it must not be labelled user-approved. Owner approval is separately recorded. A failed or blocked gate stops advancement. Regressions reopen affected gates.

| Module | Scope and primary files | Deliverables | Gate / evidence | Estimate after audit |
|---|---|---|---|---|
| M0 Audit/documentation | Whole repository and existing records | Audit, PRD, architecture/schema, design, workflow, module plan, test matrix, tracker, deployment plan and evidence | Documentation links/checks; audit limitations clear; no unsupported completion claims | Completed this turn; acceptance pending |
| M1 Foundation, identity, shared design | server initialization/config/auth; AuthContext/API; AppShell and UI components; manifests | Close public upload/protected-field exposure as containment; config validation; session/rate limits/log redaction; test harness/CI; dependency remediation; register/login/profile; accessible shell/tokens; hosting proof of concept | SEC-01–13 as relevant, AUTH-01–07, UI-01–05, OPS-01–03; clean build/lint; no unresolved foundation P0 | 12–16 h |
| M2 Resume library/parsing | resume routes/controller/parser/model; ResumeUpload; storage adapter | Private upload/retrieval; verified types; parse review/error state; editable facts; lifecycle/deletion; version/source data groundwork | UP-01–07, SEC-01–05/14, PERF-01; real PDF/DOCX/TXT fixtures; two-user isolation; storage persistence | 10–14 h |
| M3 Matching/history | match controller/AI service/Match/JD; MatchResume/MatchHistory/Dashboard | Validated honest scores, output schema, bounded provider calls, persisted detailed analysis, immutable input version, working history links/statistics, keyword suggestions and section-analysis contracts | AI-01–05, MATCH-01–06; deterministic mocks plus real staging provider sample; outage/timeout/retry tests | 8–12 h |
| M4 Builder/edit/export | resumeBuilder service/controller; ResumeBuilder; draft/version schemas | Fact-preserving generate/improve-section; editable complete draft; save/reopen; full preview; one built-in ATS-focused template; contact-inclusive formatted PDF and editable DOCX exports, with optional TXT | BUILD-01–05, AI-05, UI-07; complete export inspection and reload/revision tests | 10–14 h |
| M5 Discovery/recommendations/activity | job scraper/controller/models; JobSearch/Profile; worker/task adapter | Real multi-source adapters; status/coverage matrix; bounded scan worker; source/geo/date fidelity; resumable task; persistent saved/applied/ignored snapshots; per-version scores; preference behavior | JOB-01–09, SEC-07/08/12/13, PERF-02; at least two verified sources proposed; all advertised sources real or explicitly unavailable; owner accepts coverage | 16–24 h |
| M6 Release and regression | Vercel, API/worker hosting, DB/storage, all modules | Production topology, environment segregation, security/build/E2E/visual checks, backup restore, monitoring, rollback, support/privacy/recovery route | OPS-01–08, UI-01–07, PERF-01/02, complete critical regression matrix; all prior gates accepted | 10–14 h |

Total estimate: **66–94 focused hours**, plus unresolved provider/provisioning delays. This estimate includes test/fix cycles per module but not indefinite source-access negotiation. The owner reset the launch target to October 15, 2026 on September 20; the revised checkpoints are in Work_Tracker.md. See Work_Tracker.md for dated checkpoints and contingency.

## Definition of ready

Previous module accepted; scope/contract and associated test IDs clear; fixtures/access available; no production credentials needed for local tests; migration risk understood; an owner assigned. Account provisioning can be arranged by the user in advance; it does not imply starting another module's implementation.

## Definition of done for every module

1. End-to-end user workflow implemented, including loading, empty, invalid, failure, retry and success states.
2. Data validation, ownership and lifecycle constraints enforced on server, not just UI.
3. Module test suite and impacted earlier-module regressions pass; lint/build pass; new security findings triaged and blocking ones fixed.
4. Real integration proof where applicable (DB/storage/provider), with sanitized evidence and exact revision/environment/date. Mocked tests are labelled.
5. Desktop/mobile and keyboard checks pass; state persists when the requirement promises persistence.
6. Relevant docs/API/schema and tracker updated; migration rollback verified if data changes.
7. Acceptance recorded as either `Accepted—technical` with evidence or `Accepted—owner` with explicit owner message and timestamp. No unchecked critical test may be waived silently.

## Interface dependencies

M1 establishes authentication, errors, limits and UI primitives. M2 owns resume/version/storage contracts consumed by M3/M4/M5. M3 owns analysis/JD snapshots consumed by builder and history. M4 owns editable draft/export, including the Sep 10 clarification that JD-tailored resumes must not be TXT-only. Use a built-in single-column template for launch; preserve the original upload separately in M2, without promising arbitrary original-layout reconstruction. M5 reuses identity/version/analysis without writing other modules' internals. M6 verifies the combined system. A cross-module contract change requires earlier gate regression and updated dependency tests.

## Current state

All business modules have legacy code, but **none is newly accepted**. Historical “implemented/fixed/pass” notes do not change this status. The owner authorized the approved M1/M2 design and continued implementation after M1 local verification. M1 refresh and M2 library/parsing/review are implemented and locally verified as of September 20; evidence is in docs/m2/Verification.md. Live-hosting proof, legacy migration/rollback, backups and final acceptance remain open. M3 has not started. Technical implementation completion is not production acceptance.
