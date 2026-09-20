# Module 1 local setup and deployment preparation

Module 1 uses opaque server sessions in HttpOnly cookies. Existing localStorage tokens are retired; all users sign in again. Keep the legacy JWT_SECRET variable name, but generate a new random secret with at least 32 bytes. Do not print or send real credentials in bug reports.

## Local setup

1. Install Node 22.12 or later (use the latest patched Node 22 in CI/hosting), then run npm ci in server and client.
2. If server/.env is absent, copy server/.env.example to server/.env; preserve an existing environment file. Set a random JWT_SECRET and your development MongoDB URI. Production requires an explicit MongoDB URI and exact HTTPS CLIENT_URL.
3. Run npm run dev in server, then client. Open http://localhost:5173. API traffic goes through Vite at /api.
4. Register, open Settings, and generate a recovery code using your current password. Save it privately. Replacing a code invalidates the previous one. Resetting a password with a code consumes it and revokes every session.
5. An optional AI outage does not stop authentication or uploads. Job scanning intentionally returns 503 during containment; full real job discovery remains a required M5 launch gate.

## Verification

- server: npm test — real ephemeral MongoDB, synthetic users and isolated temporary files. First run downloads the MongoDB test binary.
- client: npm run lint and npm run build.
- client: npx playwright install chromium, then npm run test:e2e — starts its own MongoDB/API on 5081 and frontend on 5178. These ports must be free. No project .env or real provider keys are loaded by the fixture.
- Browser traces may contain synthetic session cookies; they are gitignored. Screenshots show synthetic identities only.
- CI repeats the module gate; a workflow file is not evidence of a completed remote CI run.

## Vercel and API preparation

The frontend remains a Vite SPA on Vercel. Use a separate container API and managed MongoDB, with a private durable upload volume during development until the M2 object-storage migration. The Dockerfile runs as a non-root user and omits Chromium; scanner execution is unavailable until its isolated worker is built in M5.

After provisioning a real staging API origin, run:

```text
node scripts/configure-vercel.mjs https://YOUR-PROVISIONED-API-ORIGIN
```

This writes client/vercel.json with API-first routing, explicit SPA routes, security headers, and disabled API rewrite caching. Do not run this with an example hostname and then deploy it. Import client as the Vercel project root. Keep VITE_API_URL=/api. Set server CLIENT_URL to the exact assigned Vercel origin and NODE_ENV=production. Cookies are host-only, Secure, HttpOnly, SameSite=Strict and prefixed __Host-. External API requests are proxied through the frontend origin. [Vercel rewrite and cache behavior](https://vercel.com/docs/routing/rewrites).

Set TRUST_PROXY only to verified trusted proxy IPs/CIDRs. Leaving it empty prevents spoofed forwarded-IP bypass but may group users under the proxy IP and throttle them together. Correct deployed client-IP attribution, HTTPS cookies and two-user CDN isolation require live staging proof.

Health is /api/health; readiness is /api/ready. Database failure never switches to another database. Private responses carry no-store headers. Session/rate/operation TTL indexes are initialized before the server listens.

No hosting account, paid service, public deployment or domain has been created. Vercel/API/Mongo provisioning and deployed verification remain gate items; the generated config and local tests do not substitute for those checks.

## Session and quota operations

- Session lifetime defaults to 12 hours (configurable 1–24). Logout deletes the session; expiry is enforced in queries independently of TTL cleanup.
- Password changes increment an account authVersion and revoke previous sessions. Recovery uses a one-time HMAC code hash and an atomic password update.
- Limits persist in MongoDB across processes: API 150/IP/minute; auth 20/IP/15 minutes plus 10/email/15 minutes; uploads 20/user/hour; AI 20/user/hour; password/recovery-code operations 5/user/15 minutes.
- AI requests have one lease per user, three global slots, a 24,000-character request cap, a 120-second crash-expiring lease, and 15-second SDK request timeouts without automatic retry. These bound legacy calls; M3/M4 still own truthful provider-output behavior.
- Logs contain allowlisted event codes and request IDs, not request bodies, cookies, user documents or provider payloads.
- Before release, replace the development file store with M2 private object storage and verify backup/restore and deletion consistency. An interrupted local filesystem/database deletion can still require repair.

## Rollback

Do not roll back to the insecure public-upload/JWT server. Retain a verified build of this session-aware foundation when later modules change. To invalidate all active sessions after suspected compromise, rotate JWT_SECRET across every API instance and require fresh login; recovery codes also become invalid. Back up MongoDB and private files together before schema/storage migrations. No data migration or deletion has been run against the user's database.


