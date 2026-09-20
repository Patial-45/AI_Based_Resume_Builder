import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const password = 'Browser test password 93!';
async function account(page: Page) {
  const email = 'browser-' + Date.now() + '-' + Math.random().toString(16).slice(2) + '@example.com';
  await page.goto('/register');
  await page.getByLabel('Full name', { exact: true }).fill('Alex Example');
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  return email;
}
async function settings(page: Page) {
  const menu = page.getByRole('button', { name: 'Open navigation' });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible();
}
test('corrupt legacy storage recovers; auth form is accessible and fits viewport', async ({ page }, info) => {
  await page.addInitScript(() => { localStorage.setItem('user', '{invalid'); localStorage.setItem('token', 'old-token'); });
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: '../docs/m1/login-' + info.project.name + '.png', fullPage: true });
});
test('register, edit profile, reload, private navigation and server logout', async ({ page }, info) => {
  await account(page); await settings(page);
  await page.getByLabel('Full name', { exact: true }).fill('Alex Updated');
  await page.getByLabel('Minimum annual salary').fill('0');
  await page.getByLabel('Maximum annual salary').fill('100000');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Profile saved.' })).toBeVisible();
  await page.reload(); await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('Alex Updated');
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: '../docs/m1/settings-' + info.project.name + '.png', fullPage: true });
  const cookies = await page.context().cookies();
  expect(cookies.find(cookie => cookie.name === 'resume_session')?.httpOnly).toBe(true);
  const menu = page.getByRole('button', { name: 'Open navigation' }); if (await menu.isVisible()) await menu.click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/login/);
  await page.goto('/profile'); await expect(page).toHaveURL(/login/);
});
test('recovery dialog traps/restores focus; single-use recovery resets password', async ({ page }) => {
  const email = await account(page); await settings(page);
  await page.getByRole('tab', { name: 'Security', exact: true }).click();
  await page.getByLabel('Current password', { exact: true }).fill(password);
  const response = page.waitForResponse(result => result.url().endsWith('/api/auth/recovery-code') && result.request().method() === 'POST', { timeout: 20000 });
  const trigger = page.getByRole('button', { name: 'Create recovery code' }); await trigger.click();
  expect((await response).status()).toBe(200);
  const dialog = page.getByRole('dialog', { name: 'Save your recovery code' }); await expect(dialog).toBeVisible();
  const code = await dialog.locator('code').innerText();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible(); await expect(trigger).toBeFocused();
  await page.goto('/recover');
  await page.getByLabel('Email address').fill(email); await page.getByLabel('Recovery code', { exact: true }).fill(code);
  await page.getByLabel('New password').fill(password + 'new');
  const reset = page.waitForResponse(result => result.url().endsWith('/api/auth/recover') && result.request().method() === 'POST', { timeout: 20000 });
  await page.getByRole('button', { name: 'Reset password' }).click();
  expect((await reset).status()).toBe(200);
  await expect(page.getByRole('status')).toContainText('Password reset');
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email); await page.getByLabel('Password', { exact: true }).fill(password + 'new');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click(); await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
});
test('session outage offers retry; reduced motion suppresses decorative animation', async ({ page }) => {
  await page.route('**/api/auth/profile', route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/profile');
  await expect(page.getByRole('button', { name: 'Retry connection' })).toBeVisible();
  await page.unroute('**/api/auth/profile'); await page.getByRole('button', { name: 'Retry connection' }).click();
  await expect(page).toHaveURL(/login/);
  expect(await page.locator('.auth-card').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
});

