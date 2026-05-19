import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('TodoStatus visual', () => {
      test('todo', async ({ page }) => {
        await matchStorySnapshot(page, 'components-todostatus--todo', 'todo', theme);
      });

      test('done', async ({ page }) => {
        await matchStorySnapshot(page, 'components-todostatus--done', 'done', theme);
      });
    });
  });
}
