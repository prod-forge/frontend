import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('AddTodoForm visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'widgets-addtodoform--default', 'default', theme);
      });
    });
  });
}
