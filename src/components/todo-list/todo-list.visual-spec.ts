import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('TodoList visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'components-todolist--default', 'default', theme);
      });

      test('single-item', async ({ page }) => {
        await matchStorySnapshot(page, 'components-todolist--single-item', 'single-item', theme);
      });
    });
  });
}
