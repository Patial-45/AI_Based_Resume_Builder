# Product requirements document

Version 1.2, 2026-09-20. Product: Resume Builder. Owner: project owner. Owner-confirmed target: Thursday 2026-10-15, IST (replaces September 13). Owner confirmed every current feature is required and Vercel is the initial hosting choice; no account/domain is provisioned yet. This document describes intended behavior; it does not certify existing implementation.

## Problem and audience

Job seekers need to turn their real experience into clear resumes, understand a specific job's requirements, and improve presentation without inventing qualifications. Initial audience includes students and experienced applicants; India is the current implementation's geographic bias, not a verified rule for every job provider.

The primary journey is **sign in → upload/create → review facts → compare with a job description → edit → preview/export → revisit**. A simple interface must make this journey visible while progressively revealing detailed controls.

## Release scope and priorities

Required public release: secure identity, private PDF/DOCX/TXT upload, truthful parse review, JD matching with honest unavailable states, persisted editable resume draft, complete printable/PDF output, usable history, multi-source job discovery/recommendations, saved/applied/ignored job activity, profile/preferences, responsive accessible shell and production readiness. Preserve all current feature categories through progressive disclosure.

Job discovery is mandatory. Every advertised portal must have a real validated adapter or an explicit source-unavailable state; invented results cannot substitute for functionality. Record accepted source coverage in M5, with at least two independently verified real sources proposed. Do not promise every external portal will permit access. Net-new advanced analytics, multiple templates, OCR, legacy DOC conversion, payments, social login, notifications and automated applications are outside this deadline. Existing dashboard analytics, TXT download and section-improvement APIs remain covered.

Full-feature delivery, redesign and infrastructure are estimated at 66–94 focused implementation/validation hours after audit, before major external blockers. The sequential gate rule prevents starting the next module early to hide slippage. The revised October 15 target is governed by the dated checkpoints in Work_Tracker.md; it does not waive acceptance gates. Escalate missed gates; never silently reduce scope or waive security.

## Functional requirements

| Requirement | Priority | Intended behavior / acceptance | Module / tests |
|---|---|---|---|
| FR-01 Identity | Must | Register/login/logout with validation, generic credential failure, bounded attempts, usable expiry and account recovery path. No sensitive logs. Recovery must be implemented/tested or public signup remains gated pending an owner-approved support plan. | M1; AUTH-01–07, SEC-07/09/10 |
| FR-02 Resume library | Must | List owned active resumes and minimal retry metadata for pending deletions; upload accepted formats up to configured cap, inspect original extraction, rename/edit content and delete privately. Never expose filesystem paths. | M2; UP-01–07, SEC-01–05/14 |
| FR-03 Parse review | Must | Distinguish ready, needs review and failed. No OCR claim for scanned PDFs. Users correct facts before AI uses them. No fabricated education/employment. | M2; UP-02/03/05/06 |
| FR-04 JD input | Must | Paste text and optional title/company; bounded length; reuse an owned saved JD. Missing/foreign/deleted IDs return consistent errors. | M3; MATCH-01, SEC-03/12 |
| FR-05 Analysis | Must | Explain score method, missing evidence and model-derived advice; never describe a score as an ATS guarantee or hiring probability. Provider outage is visible. | M3; AI-01–05 |
| FR-06 History | Must | Reload saved results with resume version, JD snapshot, timestamp and analysis method. Paginate or label bounded views. | M3; MATCH-02/03/05/06 |
| FR-07 Builder | Must | Review/edit structured contact, summary, experience, education, skills, projects, certifications. AI suggests fact-preserving edits; user explicitly applies them. | M4; BUILD-01/02/05 |
| FR-08 Persistence/export | Must | Save and reopen draft; show dirty/saving/saved/error states. Full preview equals export, with contact info. One built-in professional, single-column ATS-focused template; formatted PDF via tested print/export, editable DOCX download and optional TXT fallback. JD-tailored output must use the reviewed saved draft and include all contact/section content. | M4; BUILD-03/04 |
| FR-09 Job discovery | Must | Real listings only, source/date/eligibility disclosed; partial provider failures and expiry visible. Bounded scan, no fabricated links. | M5; JOB-01–09 |
| FR-10 Job activity | Must | Save/unsave, mark/unmark applied and ignore/restore with durable snapshots; scores remain tied to resume version. No automatic submission to employers. | M5; JOB-05/06/07 |
| FR-11 Profile | Must for exposed controls | Name/preferences save reliably and update app identity. Salary includes currency/period and bounds if offered; unsupported filters are removed or clearly disabled. | M1/M5; AUTH-06, JOB-03 |
| FR-12 Privacy | Must | Explain file/AI processing before upload/analysis, private retrieval, actionable deletion and retention policy; no personal resume text in telemetry. | M1/M2; SEC-09/14 |

## Nonfunctional requirements and release acceptance

These are proposed targets to measure on staging, not current observed performance.

- Security: zero unresolved P0, zero unmitigated high-risk issues in enabled paths; two-user isolation tests pass; production secrets validated and excluded from bundles/logs.
- Reliability: failed parsing/AI never appears successful; repeated submit is bounded/idempotent; confirmed saves survive refresh and restart; expiry does not crash history.
- Performance: non-AI API p95 under 750 ms with 10 concurrent test users; upload processing reports state within 2 seconds and resolves or errors within 30 seconds for accepted 5 MB fixtures; matching resolves or shows bounded failure within 45 seconds. Tune based on actual hosting/provider constraints.
- Frontend: target LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 on representative mobile staging checks; loading indicator must not misrepresent exact percent.
- Accessibility: target WCAG 2.2 AA; keyboard-complete core flow, labelled controls, focus restoration, readable errors, reduced-motion support, no horizontal overflow at 360px or 200% zoom. These require measurement, not a claim based on Tailwind usage.
- Compatibility: current stable Chrome/Edge/Firefox plus mobile Safari; regression record includes exact browser versions. PDF output handles a two-page resume and selectable text.
- Operations: reproducible clean build; DB readiness, HTTPS, private persistent uploads, backup restore exercise, sanitized monitoring, rollback rehearsal and support contact.

## Success metrics

Track aggregate, non-PII events: upload_started/completed/failed; parse_review_completed; match_completed/failed; draft_saved; export_completed. Initial goals: ≥95% valid supported fixture upload success; 100% core acceptance cases pass; zero fabricated personal facts in reviewed evaluation fixtures; 100% saved draft recovery in restart tests. Conversion goals require a real beta baseline rather than invented business projections.

## Decisions to resolve

| Decision | Proposed default | Deadline / consequence |
|---|---|---|
| Scope if Jobs fails | Fix it; hold release if its gate fails. All current features required. | Owner confirmed Sep 9 |
| Hosting/domain | Vercel frontend/generated domain; managed Mongo/private storage and isolated backend/worker as needed | Vercel confirmed; accounts and additional service budget pending |
| AI budget/provider | One configured provider, per-user quota, explicit outage | Thu Sep 10; verify real staging account limits |
| Export quality | One complete built-in single-column template, formatted PDF and editable DOCX; TXT optional | Fri Sep 11; no incomplete export accepted |
| Gate acceptance | Owner approval or recorded technical acceptance with evidence | At each module boundary; silence never counts as approval |
| Recovery/privacy/support | Functional recovery or approved support route; clear retention notice | Before public signup |

Changes after a module gate must update this PRD, affected tests and tracker, and reopen the gate when behavior changes.

## September 11 implementation clarification

M2 delivers review and editing of the complete extracted text alongside its preserved source, including contact details and unknown sections. It does not invent missing employment, institutions or dates. Saving marks content user-reviewed; this is not ATS certification. The original remains separately downloadable. M4 owns granular structured editing, full formatted preview and the approved single-column PDF/DOCX template; TXT versions in M2 do not fulfill formatted export acceptance. All existing feature categories remain required before public launch.

