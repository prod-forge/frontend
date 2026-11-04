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

const listTodos = ({ searchParams }: URL): Response =>
  jsonResponse(
    200,
    applyTodosQuery(todos, {
      limit: Number(searchParams.get('limit')),
      offset: Number(searchParams.get('offset')),
      order: searchParams.get('order') === 'desc' ? 'desc' : 'asc',
      search: searchParams.get('query') ?? '',
      sortBy: searchParams.get('sortBy') ?? undefined,
    }),
  );

const handleTodo = (id: string, { body, method }: FakeRequest): Response => {
  const todo = todos.find((item) => item.id === id);

  if (!todo) {
    return backendErrorResponse(404, 'TODO_NOT_FOUND');
  }

  if (method === 'DELETE') {
    return jsonResponse(204);
  }

  return jsonResponse(200, { data: method === 'PATCH' ? { ...todo, ...body } : todo });
};

const route = (request: FakeRequest): Response => {
  const path = request.url.pathname.replace('/api/v1/', '');

  if (path === 'todos') {
    return request.method === 'POST'
      ? jsonResponse(201, { data: { completed: false, id: 'created-todo-id', ...request.body } })
      : listTodos(request.url);
  }

  const [, id] = path.split('/');

  return handleTodo(id, request);
};

// Answers like the real backend, backed by the shared seed data from test-data.
export const mockFakeBackend = (): jest.SpiedFunction<typeof fetch> =>
  jest.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
    const url = new URL(input instanceof Request ? input.url : input);
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as Partial<Todo>) : {};

    return Promise.resolve(route({ body, method: init?.method ?? 'GET', url }));
  });

export const fetchCalls = (fetchMock: jest.SpiedFunction<typeof fetch>, method: string): string[] =>
  fetchMock.mock.calls
    .filter(([, init]) => (init?.method ?? 'GET') === method)
    .map(([input]) => (input instanceof Request ? input.url : input));

export const fetchBodies = (fetchMock: jest.SpiedFunction<typeof fetch>, method: string): unknown[] =>
  fetchMock.mock.calls
    .filter(([, init]) => init?.method === method)
    .map(([, init]) => (typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined));
