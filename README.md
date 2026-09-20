# Resume Builder

A React/TypeScript, Express and MongoDB workspace for resumes, job matching, resume generation, job discovery and application tracking.

**Development — not ready for public launch.** Modules 1 and 2 are implemented locally, including the approved beige/teal design and resume library/review workflow; staging proof and final acceptance remain open. See [Module 2 verification](docs/m2/Verification.md) and [runbook](docs/m2/Runbook.md). Every current feature remains required for release. The owner-confirmed launch target is October 15, 2026; the original September 13 target elapsed. Modules 2–6 have not been accepted. [Work tracker](Work_Tracker.md) · [Module 1 results](docs/m1/Verification.md) · [Module 1 runbook](docs/m1/Runbook.md).

## Start locally

Use a patched Node 22 release (minimum 22.12) and a development MongoDB. From the repository root:

```powershell
npm ci --prefix server
npm ci --prefix client
if (-not (Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
```

Set MONGODB_URI and a random JWT_SECRET in server/.env. Generate the secret locally with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The legacy JWT_SECRET name now identifies an HMAC secret for opaque sessions and recovery codes. Keep it private. AI keys are optional for identity and uploads. Do not place secrets in VITE_* variables.

Run separate terminals:

```powershell
npm run dev --prefix server
```

```powershell
npm run dev --prefix client
```

Open http://localhost:5173. Vite proxies /api to localhost:5000. The server validates configuration, connects to the specified MongoDB, initializes identity/quota indexes, and only then listens. It never falls back to a second database.

## Module 1 behavior

- Register/login, server-validated reload, profile/preferences, password changes, logout and one-time recovery codes.
- Opaque HttpOnly cookies replace localStorage JWTs. Production cookies are Secure, host-only and SameSite=Strict. Mutations require an in-memory CSRF token. Existing users must sign in again.
- Generate a recovery code in Settings using your password and save it privately. A replacement invalidates the old code; using a code revokes every session.
- Shared navigation, authentication screens, settings, accessible input labels, native modal focus handling and reduced-motion support.
- Private owner-checked downloads; protected resume fields cannot be changed through the API. Upload accepts verified PDF/DOCX/UTF-8 TXT, max 5 MiB. Legacy DOC and generic binary MIME are rejected. Parse failures are explicit.
- MongoDB-backed rate and AI concurrency limits, lazy provider initialization, redacted operational errors, independent liveness/readiness.
- **Job scanning temporarily returns 503** while the unsafe scanner is contained. Real job discovery is still required in M5. Existing job activity APIs remain.
- M2 production persistence/backup validation, honest matching/history (M3), factual editable drafts/export (M4), and real discovery/activity (M5) still have audit blockers. Some existing provider fallbacks remain unsafe to release.

## Checks

```powershell
npm test --prefix server
npm run lint --prefix client
npm run build --prefix client
npm audit --prefix server
npm audit --prefix client
npm exec --prefix client -- playwright install chromium
npm run test:e2e --prefix client
```

Server tests use an isolated temporary MongoDB and synthetic files. Browser tests start isolated servers on ports 5081 and 5178; they do not use project credentials. First runs download test runtimes. See [the runbook](docs/m1/Runbook.md) for prerequisites. CI is defined in .github/workflows/ci.yml; remote CI/deployed results are not implied by local success.

The old docs/audit/reproduce.mjs script asserts audited defects, not acceptance behavior. It is retained as historical evidence.

## API

All business routes require the session cookie. Unsafe methods also require X-CSRF-Token, returned by register/login/profile and password-change responses. Registration/login/recovery are public and rate limited. No Bearer-token compatibility remains.

| Group | Endpoints |
|---|---|
| Identity | POST /api/auth/register, /login, /logout, /recover, /recovery-code; GET/PUT /api/auth/profile; PUT /api/auth/password |
| Resumes | POST/GET /api/resumes; GET/PUT/DELETE /api/resumes/:id; GET /api/resumes/:id/download. Multipart field: resume. PUT currently permits fileName only. |
| Matching | POST/GET /api/match; GET /api/match/:id; GET /api/match/suggestions/:matchId |
| Builder | POST /api/resume-builder/generate, /analyze, /improve-section |
| Jobs | POST /api/jobs/scan (contained); GET /api/jobs/recommended, /saved, /:id; POST /api/jobs/:id/save, /apply, /ignore |
| Operations | GET /api/health; GET /api/ready |

The public /uploads mount and /api/auth/test diagnostics are removed. New originals and bounded review versions are stored atomically in private MongoDB Resume documents. Legacy originals still require their existing private upload volume until explicitly migrated.

## Deployment

The selected path is Vercel for the frontend, a separate container API, managed MongoDB and private storage; M5 adds the isolated job worker. No account, domain or public deployment has been created. Provision a staging API before generating Vercel routing with scripts/configure-vercel.mjs. See [Deployment.md](Deployment.md) and the [Module 1 runbook](docs/m1/Runbook.md). Never substitute local fixture tests or an untested routing config for deployed storage/cookie/isolation checks.

## Documents

| Document | Purpose |
|---|---|
| [Audit.md](Audit.md) | Original source-backed bugs, security and architecture review |
| [PRD.md](PRD.md) | Requirements and all-feature launch scope |
| [Architecture.md](Architecture.md) | Current foundation and intended platform boundaries |
| [Database_Schema.md](Database_Schema.md) | Models, indexes, changes and migration safeguards |
| [Design.md](Design.md) | Typography, layout, motion and UI specification |
| [Workflow.md](Workflow.md) | User journeys and sequential acceptance process |
| [Modules.md](Modules.md) | Build, test and accept one module before the next |
| [Test_Cases.md](Test_Cases.md) | Project-wide acceptance matrix |
| [Work_Tracker.md](Work_Tracker.md) | Living work tracker, evidence and open gates |
| [Deployment.md](Deployment.md) | Vercel-first launch plan |
| [Audit verification](docs/audit/Verification.md) | Historical audit evidence and limitations |

Earlier records are preserved in test_records.md, UI_UX_IMPROVEMENTS.md, TROUBLESHOOTING.md and [the archived README](docs/audit/README-before-audit.md). They are historical, not current acceptance claims.
