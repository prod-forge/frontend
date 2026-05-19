import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('TodoStatusToggle visual', () => {
      test('todo', async ({ page }) => {
        await matchStorySnapshot(page, 'components-todostatustoggle--todo', 'todo', theme);
      });

      test('done', async ({ page }) => {
        await matchStorySnapshot(page, 'components-todostatustoggle--done', 'done', theme);
      });
    });
  });
}
