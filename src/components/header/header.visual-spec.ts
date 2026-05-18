import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('Header visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'components-header--default', 'default', theme);
      });
    });
  });
}
