import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('EditableTitle visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'components-editabletitle--default', 'default', theme);
      });

      test('long-title', async ({ page }) => {
        await matchStorySnapshot(page, 'components-editabletitle--long-title', 'long-title', theme);
      });

      test('custom-short-limit', async ({ page }) => {
        await matchStorySnapshot(page, 'components-editabletitle--custom-short-limit', 'custom-short-limit', theme);
      });
    });
  });
}
