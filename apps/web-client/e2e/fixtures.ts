/// <reference types="node" />
import type { Todo } from '@prod-forge-todolist-frontend/core';

import { test as base, expect } from '@playwright/test';
import { applyTodosQuery, todos as seedData } from '@prod-forge-todolist-frontend/test-data';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const E2E_ACCESS_TOKEN = 'e2e-access-token';

// The only email the mocked backend does not know: login answers it with 401 like the real one.
export const UNKNOWN_EMAIL = 'unknown@example.com';

// Same body as the backend's GlobalExceptionFilter: no traceId (it is sent in the X-Trace-Id header).
export const unauthorizedBody = JSON.stringify({
  code: 'USER_IS_NOT_AUTHORIZED',
  message: 'User is not authorized',
  status: 401,
});

type Fixtures = {
  coverage: undefined;
  mockApi: undefined;
};

export const test = base.extend<Fixtures>({
  coverage: [
    async ({ page }, use, testInfo): Promise<void> => {
      await use(undefined);

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
      let items: Todo[] = structuredClone([...seedData]);

      await page.route(/\/api\/v1\/auth\/login$/, async (route) => {
        const { email } = route.request().postDataJSON() as { email: string };

        if (email === UNKNOWN_EMAIL) {
          return route.fulfill({ body: unauthorizedBody, contentType: 'application/json', status: 401 });
        }

        return route.fulfill({
          body: JSON.stringify({ data: { accessToken: E2E_ACCESS_TOKEN, expiresIn: 3600 } }),
          contentType: 'application/json',
          status: 200,
        });
      });

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
              body: JSON.stringify({ data: items[idx] }),
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

          return route.fulfill({
            body: JSON.stringify({ data: newTodo }),
            contentType: 'application/json',
            status: 201,
          });
        }

        const sortBy = url.searchParams.get('sortBy') ?? 'title';
        const order = url.searchParams.get('order') === 'desc' ? 'desc' : 'asc';

        return route.fulfill({
          body: JSON.stringify(
            applyTodosQuery(items, {
              limit: Number(url.searchParams.get('limit') ?? 10),
              offset: Number(url.searchParams.get('offset') ?? 0),
              order,
              search: url.searchParams.get('search') ?? '',
              sortBy,
            }),
          ),
          contentType: 'application/json',
          status: 200,
        });
      });

      await use(undefined);
    },
    { auto: true },
  ],
});

export { expect };
