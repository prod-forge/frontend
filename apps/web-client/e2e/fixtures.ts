/// <reference types="node" />
import type { Order, SortBy, Todo } from '@prod-forge-todolist-frontend/test-data';

import { test as base, expect } from '@playwright/test';
import { filterTodos, todos as seedData, sortTodos } from '@prod-forge-todolist-frontend/test-data';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface Fixtures {
  coverage: void;
  mockApi: void;
}

export const test = base.extend<Fixtures>({
  coverage: [
    async ({ page }, use, testInfo): Promise<void> => {
      await use();

      const coverage = await page.evaluate(() => (window as unknown as { __coverage__?: unknown }).__coverage__);
      // window.__coverage__ is only populated when vite-plugin-istanbul is active.
      // In normal e2e runs there is nothing to collect, so skip silently.
      if (!coverage) return;

      const outputDir = join(process.cwd(), '.nyc_output');
      await mkdir(outputDir, { recursive: true });
      await writeFile(
        join(outputDir, `coverage-${testInfo.testId.replace(/[^\w-]/g, '-')}.json`),
        JSON.stringify(coverage),
      );
    },
    { auto: true },
  ],

  mockApi: [
    async ({ page }, use): Promise<void> => {
      let items: Todo[] = JSON.parse(JSON.stringify(seedData.data)) as Todo[];

      await page.route(/\/api\/v1\/todos/, async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const method = request.method();

        const pathParts = url.pathname.split('/').filter(Boolean);
        const todosIdx = pathParts.indexOf('todos');
        const id = pathParts[todosIdx + 1];

        if (id) {
          if (method === 'PATCH') {
            const body = request.postDataJSON() as Partial<Todo>;
            const idx = items.findIndex((t) => t.id === id);
            if (idx === -1) {
              return route.fulfill({ body: '{}', contentType: 'application/json', status: 404 });
            }
            items[idx] = { ...items[idx], ...body };

            return route.fulfill({
              body: JSON.stringify(items[idx]),
              contentType: 'application/json',
              status: 200,
            });
          }

          if (method === 'DELETE') {
            items = items.filter((t) => t.id !== id);

            return route.fulfill({ status: 204 });
          }

          const todo = items.find((t) => t.id === id);
          if (!todo) {
            return route.fulfill({ body: '{}', contentType: 'application/json', status: 404 });
          }

          return route.fulfill({ body: JSON.stringify({ data: todo }), contentType: 'application/json', status: 200 });
        }

        if (method === 'POST') {
          const body = request.postDataJSON() as { description?: string; title?: string };
          const newTodo: Todo = {
            completed: false,
            description: body.description ?? '',
            id: `e2e-${Date.now()}`,
            title: body.title ?? '',
          };
          items = [newTodo, ...items];

          return route.fulfill({ body: JSON.stringify(newTodo), contentType: 'application/json', status: 201 });
        }

        const query = url.searchParams.get('query') ?? '';
        const sortBy = (url.searchParams.get('sortBy') ?? 'title') as SortBy;
        const order = (url.searchParams.get('order') ?? 'asc') as Order;
        const limit = Number(url.searchParams.get('limit') ?? 10);
        const offset = Number(url.searchParams.get('offset') ?? 0);

        const filtered = filterTodos(items, query);
        const sorted = sortTodos(filtered, sortBy, order);
        const pageItems = sorted.slice(offset, offset + limit);

        return route.fulfill({
          body: JSON.stringify({
            data: pageItems,
            meta: { limit, offset, total: sorted.length },
          }),
          contentType: 'application/json',
          status: 200,
        });
      });

      await use();
    },
    { auto: true },
  ],
});

export { expect };
