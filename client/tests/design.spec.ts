import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createTestAccount } from './helpers/account';

test('approved shell, settings tabs, unsaved changes and all route layouts', async ({ page }, info) => {
  await page.goto('/register');
  await page.getByLabel('Full name', { exact: true }).fill('Alex Morgan');
  await page.getByLabel('Email address').fill(`design-${Date.now()}-${info.project.name}@example.com`);
  await page.getByLabel('Password', { exact: true }).fill('Design test password 84!');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 20000 });
  await page.goto('/profile');
  const name = page.getByLabel('Full name', { exact: true });
  await expect(name).toHaveValue('Alex Morgan');
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(245, 241, 232)');
  await name.fill('Alex Edited');
  await page.getByRole('tab', { name: 'Security', exact: true }).click();
  await expect(page.getByLabel('Current password', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Security', exact: true }).press('ArrowLeft');
  await expect(name).toHaveValue('Alex Edited');
  const menu = page.getByRole('button', { name: 'Open navigation' });
  if (await menu.isVisible()) {
    await menu.click();
    const dialog = page.getByRole('dialog', { name: 'Workspace navigation' });
    await expect(dialog).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.getByRole('link', { name: 'Resumes', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Leave without saving?' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await expect(name).toHaveValue('Alex Edited');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Profile saved.' })).toBeVisible({ timeout: 20000 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.locator('main').focus();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `../docs/design/settings-${info.project.name}.png`, fullPage: true });
  for (const route of ['/dashboard', '/upload', '/match', '/builder', '/jobs', '/history', '/profile']) {
    await page.goto(route);
    await expect(page.locator('main h1').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBeTruthy();
  }
});

test('security feedback stays beside its action and clears previous success', async ({ page }, info) => {
  await createTestAccount(page, 'security-design-' + info.project.name, 'Design test password 84!');
  await page.goto('/profile');
  await page.getByRole('tab', { name: 'Security', exact: true }).click();
  const passwordSection = page.locator('section.form-section').filter({ has: page.getByRole('heading', { name: 'Change password', exact: true }) });
  const recoverySection = page.locator('section.form-section').filter({ has: page.getByRole('heading', { name: 'Account recovery', exact: true }) });
  await page.getByLabel('Current password', { exact: true }).fill('Design test password 84!');
  await page.getByLabel('New password', { exact: true }).fill('Changed design password 92!');
  await page.getByRole('button', { name: 'Change password', exact: true }).click();
  await expect(passwordSection.getByRole('status')).toContainText('Password changed.', { timeout: 20000 });
  await page.getByRole('button', { name: 'Create recovery code' }).click();
  await expect(recoverySection.getByRole('alert')).toContainText('Enter your current password');
  await expect(passwordSection.getByRole('status')).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.locator('main').focus(); await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `../docs/design/security-${info.project.name}.png`, fullPage: true });
});
