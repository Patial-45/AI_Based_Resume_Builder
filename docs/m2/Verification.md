# Module 2 verification

Updated September 20, 2026. **Local fix verification complete; staging and overall acceptance remain open.** Owner-confirmed release target: October 15, 2026.

Tests use temporary MongoDB, synthetic accounts/documents and local HTTP servers. No production database, provider, migration or hosted deployment was exercised.

## Current results

| Check | Evidence |
|---|---|
| M2 API cases | 10/10 targeted scenarios passed after format-specific parser loading; original persistence, ownership/CSRF, revisions, quotas, deletion/retry, parser bounds and review gate |
| Password API regression | Passed September 20: changes password and revokes other sessions/old password |
| DOCX regression | Passed September 20 after other heavy work was paused: real minimal OOXML upload and oversized archive rejection; 5.1 seconds for the case |
| Resume lifecycle and session recovery | All four desktop/mobile cases passed September 20 with real API registration, persistence, original downloads, rename/delete and simulated session-expiry recovery |
| Security feedback | Mobile passed in the six-case run; desktop passed its final isolated rerun in 13.9 seconds; stale success cleared and recovery error beside its action |
| PDF and conflict workflows | Four desktop/mobile cases passed in the preceding combined run: real two-page PDF, corrupt input, library retry and preserved drafts on conflicts |
| Visual review | Impeccable reviewer cleared the specific security-feedback fix on desktop and mobile; no remaining issue within that narrow review |
| Static validation | Client lint and final production build pass; 127 modules, CSS 35.68 kB (gzip 7.72), JS 438.39 kB (gzip 137.61), build 18.27 seconds |

The complete foundation suite contains 28 unique scenarios with passing evidence across earlier full and targeted runs. This is not a claim of a final uninterrupted 28-case API run or a single final whole-browser-suite pass. The latest six-case browser run was 5 passed/1 failed; its sole failure subsequently passed in isolation. The dedicated authentication UI scenarios and shared-shell scenarios retain their earlier passing evidence.

Browser error cases deliberately simulate 503 library responses, 409 conflicts and a 401 session-expired response. Backend ownership, real revision conflicts and session expiration are covered separately by API tests. Original bytes, reviewed saves, versions, rename/delete and re-login use the real isolated API. Account setup uses the actual registration endpoint and its cookie; it does not bypass authentication.

## Fixes verified

- Load only the PDF or DOCX library required by an upload. TXT and section extraction avoid both heavy parser imports. The 20-second parsing limit and worker memory bound are unchanged.
- Allow 60 seconds for cold test MongoDB startup; wait for Resume indexes as production does. Both Playwright server startup allowances are 180 seconds. Application request deadlines are unchanged.
- Apply rename/delete to the library from confirmed server responses. A redundant GET can no longer hide a successful mutation. The lifecycle test deliberately makes that extra list request fail to guard this behavior.
- Use real API account setup for unrelated workflow tests; dedicated sign-up UI coverage stays in foundation.spec.ts. Explicit 20-second save/delete expectations replace inconsistent five-second waits.
- Clear security feedback before validation and render it beside the password/recovery action that caused it. Both screen sizes now have passing real password-change checks and captures.

## Earlier failures and limits of the conclusion

Earlier runs hit a 90-second total lifecycle budget, five-second mutation assertions, cold MongoDB/Vite startup limits and authentication/parser timeouts. The long lifecycle has a 180-second total budget with bounded action expectations. September 20 diagnostics observed 100% CPU usage. One desktop password request exceeded 20 seconds; a DOCX upload returned 422 during the same resource-constrained period. The original DOCX error code was not captured, so that failure is not retrospectively labelled a confirmed parser timeout.

After the owner paused other heavy work, the identical DOCX fixture and desktop security scenario passed without increasing application deadlines or reducing password hashing strength. The DOCX assertion now reports the safe API error code on any future failure. This supports local functional verification; production capacity/performance still needs measurement.

## Artifacts

- [Source snapshot](Source_Manifest.json)
- [Desktop library](library-desktop.png) / [mobile library](library-mobile.png)
- [Desktop review](review-desktop.png) / [mobile review](review-mobile.png)
- [Desktop security](../design/security-desktop.png) / [mobile security](../design/security-mobile.png)
- [Rollout and recovery runbook](Runbook.md)

## Remaining acceptance work

- Live Vercel-to-API body limits, cookies and private-cache isolation.
- Production MongoDB capacity, original persistence, backup restore and deletion replay.
- Explicit legacy-file migration/volume retention and compatible rollback proof.
- Representative owner-supplied PDF/DOCX review beyond synthetic fixtures.
- Owner review of actual M1/M2 screens and recorded module acceptance.

M3 has not started. M4 owns structured editing and PDF/DOCX template exports. M5 owns safe real job discovery. The module sequence and all-feature launch scope remain unchanged.
