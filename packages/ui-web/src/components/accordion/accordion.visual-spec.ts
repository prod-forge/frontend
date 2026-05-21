import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('Accordion visual', () => {
      test('closed', async ({ page }) => {
        await matchStorySnapshot(page, 'components-accordion--closed', 'closed', theme);
      });

      test('open', async ({ page }) => {
        await matchStorySnapshot(page, 'components-accordion--open', 'open', theme);
      });
    });
  });
}
