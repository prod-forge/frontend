import type { Page } from '@playwright/test';

import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

const visitStory = async (page: Page, id: string): Promise<void> => {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    if ('fonts' in document) {
      await document.fonts.ready;
    }
  });
};

export const checkStoryA11y = async (page: Page, id: string): Promise<void> => {
  await visitStory(page, id);

  const results = await new AxeBuilder({ page }).include('#storybook-root').withTags(WCAG_TAGS).analyze();

  expect(results.violations, formatViolations(results.violations)).toEqual([]);
};

const formatViolations = (
  violations: { description: string; help: string; id: string; nodes: { html: string }[] }[],
): string => {
  if (violations.length === 0) {
    return '';
  }

  return violations
    .map(
      (v) => `[${v.id}] ${v.help}\n  ${v.description}\n  Nodes:\n${v.nodes.map((n) => `    - ${n.html}`).join('\n')}`,
    )
    .join('\n\n');
};
