import { expect, test } from '@playwright/test';

test('fixture list renders, search filters, dark mode applies, and a phone viewport stays put', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Open issues' })).toBeVisible();
  await expect(page.locator('.issue')).toHaveCount(4);
  await expect(page.locator('.issue-avatar')).toHaveCount(2);
  await expect(page.locator('.issue').nth(0)).toContainText('#42');
  await expect(
    page.locator('.issue').nth(2).locator('.issue-avatar'),
  ).toHaveCount(0);
  await expect(page.locator('.issue').nth(2)).toContainText('deleted user');

  const search = page.getByLabel('Search issues');
  await expect(search).toBeVisible();

  await search.fill('dark');
  await expect(page.locator('.issue')).toHaveCount(1);
  await expect(page.locator('.issue').nth(0)).toContainText('#42');

  await search.fill('zzz-no-match');
  await expect(page.getByText('No issues match your search.')).toBeVisible();
  await expect(page.locator('.issue')).toHaveCount(0);

  await search.fill('   ');
  await expect(page.locator('.issue')).toHaveCount(4);

  const lightBg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  await page.emulateMedia({ colorScheme: 'dark' });
  const darkBg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(darkBg).not.toBe(lightBg);

  await page.setViewportSize({ width: 360, height: 800 });
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
});
