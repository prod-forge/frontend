import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('TodoItem visual', () => {
      test('todo', async ({ page }) => {
        await matchStorySnapshot(page, 'components-todoitem--todo', 'todo', theme);
      });

      test('done', async ({ page }) => {
        await matchStorySnapshot(page, 'components-todoitem--done', 'done', theme);
      });

      test('long-title', async ({ page }) => {
        await matchStorySnapshot(page, 'components-todoitem--long-title', 'long-title', theme);
      });
    });
  });
}
