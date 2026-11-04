import type { Todo } from '@prod-forge-todolist-frontend/core';

import { applyTodosQuery, todos } from '@prod-forge-todolist-frontend/test-data';

export const TEST_API_BASE_URL = 'http://localhost:3000/api/v1/';

type FakeRequest = {
  readonly body: Partial<Todo>;
  readonly method: string;
  readonly url: URL;
};

const jsonResponse = (status: number, body?: unknown): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });

export const backendErrorResponse = (status: number, code: string): Response =>
  jsonResponse(status, { code, details: {}, message: code, status, traceId: 'test-trace-id' });

const listTodos = (db: readonly Todo[], { searchParams }: URL): Response =>
  jsonResponse(
    200,
    applyTodosQuery(db, {
      limit: Number(searchParams.get('limit')),
      offset: Number(searchParams.get('offset')),
      order: searchParams.get('order') === 'desc' ? 'desc' : 'asc',
      search: searchParams.get('search') ?? '',
      sortBy: searchParams.get('sortBy') ?? undefined,
    }),
  );

const createTodo = (db: Todo[], body: Partial<Todo>): Response => {
  const created: Todo = { completed: false, description: '', id: `created-todo-${db.length}`, title: '', ...body };
  db.push(created);

  return jsonResponse(201, { data: created });
};

const handleTodo = (db: Todo[], id: string, { body, method }: FakeRequest): Response => {
  const index = db.findIndex((item) => item.id === id);

  if (index === -1) {
    return backendErrorResponse(404, 'TODO_NOT_FOUND');
  }

  if (method === 'DELETE') {
    db.splice(index, 1);

    return jsonResponse(204);
  }

  if (method === 'PATCH') {
    db[index] = { ...db[index], ...body };
  }

  return jsonResponse(200, { data: db[index] });
};

const route = (db: Todo[], request: FakeRequest): Response => {
  const path = request.url.pathname.replace('/api/v1/', '');

  if (path === 'todos') {
    return request.method === 'POST' ? createTodo(db, request.body) : listTodos(db, request.url);
  }

  const [, id] = path.split('/');

  return handleTodo(db, id, request);
};

// Answers like the real backend: a per-test copy of the test-data seed that POST, PATCH and DELETE mutate.
export const mockFakeBackend = (): jest.SpiedFunction<typeof fetch> => {
  const db: Todo[] = [...todos];

  return jest.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
    const url = new URL(input instanceof Request ? input.url : input);
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as Partial<Todo>) : {};

    return Promise.resolve(route(db, { body, method: init?.method ?? 'GET', url }));
  });
};

export const fetchCalls = (fetchMock: jest.SpiedFunction<typeof fetch>, method: string): string[] =>
  fetchMock.mock.calls
    .filter(([, init]) => (init?.method ?? 'GET') === method)
    .map(([input]) => (input instanceof Request ? input.url : input));

export const fetchBodies = (fetchMock: jest.SpiedFunction<typeof fetch>, method: string): unknown[] =>
  fetchMock.mock.calls
    .filter(([, init]) => init?.method === method)
    .map(([, init]) => (typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined));
