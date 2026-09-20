import { expect, type Page } from '@playwright/test';

// Use the real registration/session endpoint without repeating the sign-up UI
// in every unrelated workflow. foundation.spec.ts owns sign-up UI coverage.
export async function createTestAccount(page: Page, suffix: string, password: string) {
  const email = `test-${Date.now()}-${suffix}@example.com`;
  const response = await page.request.post('/api/auth/register', {
    data: { name: 'Alex Morgan', email, password }, timeout: 20000,
  });
  expect(response.status(), 'Create isolated workflow account').toBe(201);
  return { email, password };
}
