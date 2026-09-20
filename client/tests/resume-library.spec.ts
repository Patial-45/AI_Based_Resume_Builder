import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createTestAccount } from './helpers/account';
const source = 'Alex Morgan\nalex@example.com\nSummary\nBuilding accessible applications.\nSkills\nJavaScript, C++, problem-solving\nProjects\nA task planner.';
async function account(page: Page, suffix: string) {
  const { email } = await createTestAccount(page, 'library-' + suffix, 'Library test password 84!');
  await page.goto('/upload');
  await expect(page.getByRole('heading', { name: 'Your resume library starts here' })).toBeVisible({ timeout: 20000 });
  return email;
}
async function chooseView(page: Page, name: 'Source' | 'Edit') {
  const tab = page.getByRole('tab', { name, exact: true });
  if (await tab.isVisible()) await tab.click();
}
async function upload(page: Page, buffer: Buffer, name = 'original.txt', mimeType = 'text/plain') {
  await page.getByRole('button', { name: 'Upload resume', exact: true }).click();
  await page.getByLabel('Resume file', { exact: true }).setInputFiles({ name, mimeType, buffer });
  await page.getByRole('button', { name: 'Upload and review' }).click();
  await expect(page.getByLabel('Resume content', { exact: true })).toBeVisible({ timeout: 30000 });
}
test('library upload, source review, versions, rename, original download and deletion', async ({ page }, info) => {
  // This scenario includes two axe scans, screenshots and the complete file lifecycle.
  // Keep individual action/response deadlines; allow enough total time on the local Windows host.
  test.setTimeout(180000);
  await account(page, info.project.name);
  await upload(page, Buffer.from(source));
  await expect(page.getByLabel('Resume content', { exact: true })).toHaveValue(source);
  await expect(page.getByText('Needs review', { exact: true })).toBeVisible();
  const reviewed = source + '\nEducation\nBachelor of Computing';
  await page.getByLabel('Resume content', { exact: true }).fill(reviewed);
  await chooseView(page, 'Source');
  await expect(page.locator('.source-pane pre')).toHaveText(source);
  await chooseView(page, 'Edit');
  await expect(page.getByLabel('Resume content', { exact: true })).toHaveValue(reviewed);
  await page.getByRole('button', { name: 'Save reviewed content', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('saved as version 1', { timeout: 20000 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.locator('main').focus(); await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '../docs/m2/review-' + info.project.name + '.png', fullPage: true });
  await page.reload(); await expect(page.getByLabel('Resume content', { exact: true })).toHaveValue(reviewed);
  await page.getByRole('button', { name: /Version 1 ·/ }).click();
  await expect(page.getByRole('dialog', { name: 'Saved version 1' }).locator('pre')).toHaveText(reviewed);
  await page.getByRole('button', { name: 'Close version' }).click();
  await page.getByRole('button', { name: 'Back to resumes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'original.txt', exact: true })).toBeVisible();
  await page.locator('summary', { hasText: '' }).first().click();
  await page.getByRole('button', { name: 'Rename', exact: true }).click();
  await page.getByLabel('Resume name').fill('Frontend resume');
  // A confirmed mutation must remain usable even if a redundant list fetch fails.
  await page.route('**/api/resumes', route => route.request().method() === 'GET' ? route.fulfill({ status: 503, json: { message: 'List unavailable after mutation.' } }) : route.continue());
  await page.getByRole('button', { name: 'Save name' }).click();
  await expect(page.getByRole('button', { name: 'Frontend resume', exact: true })).toBeVisible({ timeout: 20000 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('main').focus(); await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '../docs/m2/library-' + info.project.name + '.png', fullPage: true });
  await page.locator('summary').first().click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download original', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('original.txt');
  const stream = await download.createReadStream(); const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString()).toBe(source);
  await page.locator('summary').first().click();
  await page.getByRole('button', { name: 'Delete resume', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete resume?' });
  await expect(dialog).toContainText('Frontend resume');
  await dialog.getByRole('button', { name: 'Delete resume', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your resume library starts here' })).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('library errors retry honestly; corrupt files fail; real two-page PDF is readable', async ({ page, browser }, info) => {
  await account(page, 'pdf-' + info.project.name);
  await page.route('**/api/resumes', route => route.request().method() === 'GET' ? route.fulfill({ status: 503, json: { message: 'Library temporarily unavailable.' } }) : route.continue());
  await page.reload(); await expect(page.getByRole('alert')).toContainText('Library temporarily unavailable');
  await expect(page.getByRole('heading', { name: 'Your resume library starts here' })).not.toBeVisible();
  await page.unroute('**/api/resumes'); await page.getByRole('button', { name: 'Retry library' }).click();
  await expect(page.getByRole('heading', { name: 'Your resume library starts here' })).toBeVisible();
  await page.getByRole('button', { name: 'Upload resume', exact: true }).click();
  await page.getByLabel('Resume file', { exact: true }).setInputFiles({ name: 'corrupt.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7 corrupt contents') });
  await page.getByRole('button', { name: 'Upload and review' }).click();
  await expect(page.getByRole('alert')).toContainText('could not read', { timeout: 30000 });
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  const fixture = await browser.newPage();
  await fixture.setContent('<html lang="en"><body><h1>Alex Morgan</h1><h2>Summary</h2><p>Building accessible applications.</p><div style="break-before:page"><h2>Skills</h2><p>JavaScript, C++, problem-solving</p></div></body></html>');
  const pdf = await fixture.pdf({ format: 'A4' }); await fixture.close();
  await upload(page, pdf, 'two-page.pdf', 'application/pdf');
  const text = await page.getByLabel('Resume content', { exact: true }).inputValue();
  expect(text).toContain('Alex Morgan'); expect(text).toContain('JavaScript');
});

test('failed and conflicting saves preserve edits; unsaved back navigation stays guarded', async ({ page }, info) => {
  await account(page, 'conflict-' + info.project.name); await upload(page, Buffer.from(source));
  const input = page.getByLabel('Resume content', { exact: true }); await input.fill(source + '\nMy unsaved correction');
  await page.route('**/api/resumes/*/content', route => route.fulfill({ status: 409, json: { message: 'A newer version exists.', error: { code: 'REVISION_CONFLICT' } } }));
  await page.getByRole('button', { name: 'Save reviewed content' }).click();
  await expect(page.getByRole('alert')).toContainText('A newer version exists');
  await expect(input).toHaveValue(source + '\nMy unsaved correction');
  await page.getByRole('button', { name: 'Back to resumes', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Leave without saving?' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await expect(input).toHaveValue(source + '\nMy unsaved correction');
  await page.unroute('**/api/resumes/*/content');
  await page.getByRole('button', { name: 'Save reviewed content' }).click();
  await expect(page.getByRole('status')).toContainText('saved as version 1', { timeout: 20000 });
});

test('session expiry retains the same user’s unsaved review in tab memory', async ({ page }, info) => {
  const email = await account(page, 'session-' + info.project.name); await upload(page, Buffer.from(source));
  const reviewUrl = page.url(), correction = source + '\nA correction before session expiry';
  await page.getByLabel('Resume content', { exact: true }).fill(correction);
  await page.route('**/api/resumes/*/content', route => route.fulfill({ status: 401, json: { message: 'Session expired.' } }));
  await page.getByRole('button', { name: 'Save reviewed content' }).click();
  await expect(page).toHaveURL(/login/);
  await page.unroute('**/api/resumes/*/content');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('Library test password 84!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 25000 });
  // Client-side navigation retains tab memory; a document reload intentionally does not.
  const menu = page.getByRole('button', { name: 'Open navigation' }); if (await menu.isVisible()) await menu.click();
  await page.getByRole('link', { name: 'Resumes', exact: true }).click();
  await page.getByRole('button', { name: 'original.txt', exact: true }).click();
  await expect(page).toHaveURL(reviewUrl);
  await expect(page.getByLabel('Resume content', { exact: true })).toHaveValue(correction);
  await expect(page.getByRole('status')).toContainText('Recovered unsaved edits');
  expect(await page.evaluate(() => JSON.stringify(localStorage) + JSON.stringify(sessionStorage))).not.toContain('A correction before session expiry');
  await page.getByRole('button', { name: 'Save reviewed content' }).click();
  await expect(page.getByRole('status')).toContainText('saved as version 1', { timeout: 20000 });
});
