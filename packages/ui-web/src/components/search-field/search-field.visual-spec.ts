import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('SearchField visual', () => {
      test('empty', async ({ page }) => {
        await matchStorySnapshot(page, 'components-searchfield--empty', 'empty', theme);
      });

      test('with-query', async ({ page }) => {
        await matchStorySnapshot(page, 'components-searchfield--with-query', 'with-query', theme);
      });
    });
  });
}
