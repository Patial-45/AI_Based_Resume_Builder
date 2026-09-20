# Module 2 runbook

Updated September 11, 2026. Local implementation; staging and operational verification remain required.

## Workflow

Open Resumes, choose a PDF/DOCX/TXT, upload, compare the preserved source with editable content, then Save reviewed content. The first save creates version 1 and marks the resume Ready. Ready means user-reviewed, not an ATS guarantee. Rename changes the library label; Download original preserves the uploaded file and name. Earlier saved versions are read-only and downloadable as TXT. Formatted PDF/DOCX output is M4.

The review editor keeps the entire text, including unknown sections, projects and contact details. Conservative section extraction recognizes standalone headings and does not invent employment, institutions, dates or skills. Fine-grained structured editing belongs to M4.

## Storage and limits

New original bytes are stored as a select-excluded Buffer in the private Resume document, together with originalHash, immutable sourceText and reviewed versions. There is no new filesystem write for an upload and no separate orphan file collection. One atomic document creation avoids half-committed file references. This is a deliberate simplification of the initial object-storage proposal for the bounded launch workload. MongoDB storage capacity, backup cost and production performance must be reviewed before public signup.

Originals: at most the configured MAX_FILE_SIZE (hard ceiling 5 MiB); at most 20 resume records and 100 MiB of original file sizes per account. Reviewed content: at most 100,000 UTF-8 bytes per version, at most 20 versions. Original extracted source is limited to 100,000 characters. Versions consume additional database space beyond the original-file quota. These bounds keep each resume document below MongoDB's 16 MiB document limit. No claim is made that the entire service fits a free database tier.

Mongo-backed leases serialize resume changes per account and cap concurrent uploads across API replicas at three. Body processing has a 90-second connection deadline; leases expire after 120 seconds if the process or connection is lost. Parsing runs in an isolated worker with a 20-second deadline and 128 MiB V8 old-generation limit; this is not a total OS process-memory guarantee. DOCX entries and decompression remain bounded by the M1 validator.

The same account lease coordinates matching and builder requests with resume edits/deletion. An uploaded resume must be reviewed before existing-resume analysis/generation. Provider honesty and full historical analysis snapshots remain M3/M4 work.

## API

All routes require the authenticated session; writes also require CSRF.

| Endpoint | Purpose |
|---|---|
| GET /api/resumes | Metadata and skills only; includes minimal pending-deletion items so cleanup can be retried |
| GET /api/resumes/limits | Current upload and version limits |
| POST /api/resumes | Multipart field resume; creates needs_review revision 0 |
| GET /api/resumes/:id | Current reviewed text, original source and version metadata; no original bytes/paths |
| PUT /api/resumes/:id | Strict fileName-only rename |
| PUT /api/resumes/:id/content | Strict text + revision; atomic compare-and-save; increments revision |
| GET /api/resumes/:id/versions/:version | Owner-only read-only saved content |
| GET /api/resumes/:id/download | Owner-only original attachment, private/no-store |
| DELETE /api/resumes/:id | Remove original, versions, Match and JobMatch records; retry unfinished cleanup |

Conflict returns 409; a concurrent in-flight mutation may return 429 with Retry-After. UI keeps edits, and the user can compare the latest content before reloading/reconciling. No silent last-writer-wins or automatic merge.

## Existing data and rollout

No real project database has been migrated or modified by this work. Legacy filePath records continue using private containment-checked downloads. Their original text becomes sourceText on the first reviewed save; missing revision is treated as 0. Original file fidelity cannot be recovered if a legacy file is already missing. Back up both the database and existing private upload directory before deployment.

Keep the old private upload volume attached until legacy originals have been explicitly migrated and verified; changing containers alone does not migrate old filesystem records. Do not bulk delete that directory. A legacy-file migration is a staging rollout task, not an implicit side effect of reading a resume.

New code is additive, but rolling back to the pre-M2 application loses support for database-backed originals. Roll back only to a compatible M2 revision, or use a reviewed migration plan. No rollback or database restore has been executed.

## Deletion and recovery

Deletion first marks the record inactive with deletionRequestedAt, blocking content/download access. It removes legacy original files when present, related Match and JobMatch records, then physically deletes the Resume record including original bytes and all versions. If cleanup fails, metadata remains visible as Deletion pending and DELETE can be retried. Linked job activity removal is explicit in the confirmation. Separately owned job descriptions remain.

Database backups are outside live deletion. Backup retention, deletion replay after restore and operational recovery tests remain release gates; do not claim backup erasure or universal permanent deletion.

Unsaved review text survives a session-expired event only in this tab's memory, keyed to the same user and resume. It is not written to localStorage/sessionStorage and does not survive a full page reload or browser close. Explicit sign-out clears that recovery cache. Before-unload and route guards warn about unsaved work.

## Hosting boundary

Vercel hosts the client; the external API handles uploads through the same-origin rewrite. Do not send 5 MiB through a Vercel Function with a smaller body limit. Live rewrite size limits, cookie/cache isolation, API memory, Mongo capacity and backups have not yet been proven on provisioned hosting. There is no hosting account, domain purchase or deployment in this change.

## September 20 verification notes

Document libraries load only for the requested format. Application parsing and authentication deadlines remain unchanged. Rename/delete update the library from confirmed responses, without a redundant list reload. Cold test-only MongoDB startup allows 60 seconds; each Playwright server allows 180 seconds. Local verification passed across the recorded targeted runs after resource contention was reduced. Launch target is October 15, 2026; live migration, backups and hosting proof remain open.
