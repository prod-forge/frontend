import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('RegisterForm visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'widgets-registerform--default', 'default', theme);
      });
    });
  });
}
