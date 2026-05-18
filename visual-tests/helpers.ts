import type { Page } from '@playwright/test';

import { expect } from '@playwright/test';

const visitStory = async (page: Page, id: string, theme: 'dark' | 'light'): Promise<void> => {
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`);
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    if ('fonts' in document) {
      await document.fonts.ready;
    }
  });
};

export const matchStorySnapshot = async (
  page: Page,
  id: string,
  name: string,
  theme: 'dark' | 'light',
): Promise<void> => {
  await visitStory(page, id, theme);
  await expect(page).toHaveScreenshot(`${theme}-${name}.png`);
};

export const themes = ['light', 'dark'] as const;
