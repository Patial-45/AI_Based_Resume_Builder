import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1, timeout: 90000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:5178', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 800 } } },
  ],
  webServer: [
    { command: 'node ../server/tests/browser-fixture.js', stdout: 'pipe', url: 'http://127.0.0.1:5081/api/health', reuseExistingServer: false, timeout: 180000 },
    { command: 'npm run dev -- --host localhost --port 5178 --strictPort', url: 'http://localhost:5178', reuseExistingServer: false, timeout: 180000, env: { VITE_API_URL: '/api', VITE_DEV_API_TARGET: 'http://127.0.0.1:5081' } },
  ],
});


