import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
export function vercelConfig(apiOrigin) {
  const origin = new URL(apiOrigin);
  if (origin.protocol !== 'https:' || origin.origin !== apiOrigin || origin.username || origin.password) throw new Error('Supply the provisioned API HTTPS origin without a trailing slash.');
  return {
    $schema: 'https://openapi.vercel.sh/vercel.json', framework: 'vite', buildCommand: 'npm run build', outputDirectory: 'dist',
    headers: [
      { source: '/api/:path*', headers: [
        { key: 'x-vercel-enable-rewrite-caching', value: '0' },
        { key: 'Cache-Control', value: 'private, no-store' },
        { key: 'CDN-Cache-Control', value: 'no-store' }
      ] },
      { source: '/:path*', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'" }
      ] }
    ],
    rewrites: [
      { source: '/api/:path*', destination: origin.origin + '/api/:path*' },
      ...['/', '/login', '/register', '/recover', '/dashboard', '/upload', '/match', '/builder', '/jobs', '/history', '/profile'].map(source => ({ source, destination: '/index.html' }))
    ]
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = vercelConfig(process.argv[2]);
  await fs.writeFile(new URL('../client/vercel.json', import.meta.url), JSON.stringify(config, null, 2) + '\n');
  console.log('Wrote client/vercel.json. Verify the API origin and preview environment before deploying.');
}

