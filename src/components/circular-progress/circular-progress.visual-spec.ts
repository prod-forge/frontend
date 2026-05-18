import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('CircularProgress visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'components-circularprogress--default', 'default', theme);
      });

      test('with children', async ({ page }) => {
        await matchStorySnapshot(page, 'components-circularprogress--with-children', 'with-children', theme);
      });

      test('empty', async ({ page }) => {
        await matchStorySnapshot(page, 'components-circularprogress--empty', 'empty', theme);
      });

      test('full', async ({ page }) => {
        await matchStorySnapshot(page, 'components-circularprogress--full', 'full', theme);
      });

      test('sm', async ({ page }) => {
        await matchStorySnapshot(page, 'components-circularprogress--sm', 'sm', theme);
      });

      test('md', async ({ page }) => {
        await matchStorySnapshot(page, 'components-circularprogress--md', 'md', theme);
      });

      test('lg', async ({ page }) => {
        await matchStorySnapshot(page, 'components-circularprogress--lg', 'lg', theme);
      });
    });
  });
}
