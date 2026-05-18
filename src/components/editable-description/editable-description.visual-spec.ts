import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('EditableDescription visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'components-editabledescription--default', 'default', theme);
      });

      test('empty', async ({ page }) => {
        await matchStorySnapshot(page, 'components-editabledescription--empty', 'empty', theme);
      });

      test('multiline', async ({ page }) => {
        await matchStorySnapshot(page, 'components-editabledescription--multiline', 'multiline', theme);
      });

      test('required-and-short', async ({ page }) => {
        await matchStorySnapshot(
          page,
          'components-editabledescription--required-and-short',
          'required-and-short',
          theme,
        );
      });
    });
  });
}
