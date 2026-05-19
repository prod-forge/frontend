import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('ErrorBlock visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'components-errorblock--default', 'default', theme);
      });

      test('with action', async ({ page }) => {
        await matchStorySnapshot(page, 'components-errorblock--with-action', 'with-action', theme);
      });
    });
  });
}
