import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Todo } from '../features/todos/todos.types';

vi.mock('./client', () => ({ apiRequest: vi.fn() }));

import { apiRequest } from './client';
import { todosApi } from './todos.api';

const todo: Todo = { completed: false, description: 'desc', id: 'real-uuid', title: 'Task' };

beforeEach(() => {
  vi.resetAllMocks();
});

describe('todosApi.create', () => {
  describe('negative cases', () => {
    it('does not return the wrapper object when the server responds with { data: Todo }', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: todo });

      const result = await todosApi.create({ description: todo.description, title: todo.title });

      expect(result).not.toHaveProperty('data');
    });
  });

  describe('positive cases', () => {
    it('returns the unwrapped Todo from { data: Todo }', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: todo });

      const result = await todosApi.create({ description: todo.description, title: todo.title });

      expect(result).toEqual(todo);
    });

    it('sends a POST request to the todos endpoint', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: todo });

      await todosApi.create({ description: todo.description, title: todo.title });

      expect(apiRequest).toHaveBeenCalledWith('todos', expect.objectContaining({ method: 'POST' }));
    });
  });
});

describe('todosApi.update', () => {
  describe('negative cases', () => {
    it('does not return the wrapper object when the server responds with { data: Todo }', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: todo });

      const result = await todosApi.update(todo.id, { title: 'Updated' });

      expect(result).not.toHaveProperty('data');
    });
  });

  describe('positive cases', () => {
    it('returns the unwrapped Todo from { data: Todo }', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: todo });

      const result = await todosApi.update(todo.id, { title: 'Updated' });

      expect(result).toEqual(todo);
    });

    it('sends a PATCH request to the correct todo endpoint', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: todo });

      await todosApi.update(todo.id, { title: 'Updated' });

      expect(apiRequest).toHaveBeenCalledWith(`todos/${todo.id}`, expect.objectContaining({ method: 'PATCH' }));
    });
  });
});

describe('todosApi.delete', () => {
  describe('positive cases', () => {
    it('sends a DELETE request to the correct todo endpoint', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce(undefined);

      await todosApi.delete(todo.id);

      expect(apiRequest).toHaveBeenCalledWith(`todos/${todo.id}`, expect.objectContaining({ method: 'DELETE' }));
    });

    it('returns undefined', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce(undefined);

      const result = await todosApi.delete(todo.id);

      expect(result).toBeUndefined();
    });
  });
});

describe('todosApi.getAll', () => {
  const filters = { limit: 10 as const, offset: 0, order: 'asc' as const, query: '', sortBy: 'title' as const };
  const response = { data: [todo], meta: { limit: 10, offset: 0, total: 1 } };

  describe('positive cases', () => {
    it('returns the response as-is', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce(response);

      const result = await todosApi.getAll(filters);

      expect(result).toEqual(response);
    });

    it('sends a GET request to the todos endpoint with limit, offset, order and sortBy params', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce(response);

      await todosApi.getAll(filters);

      expect(apiRequest).toHaveBeenCalledWith('todos?limit=10&offset=0&order=asc&sortBy=title');
    });

    it('includes query param when query is non-empty', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce(response);

      await todosApi.getAll({ ...filters, query: '  hello  ' });

      const [url] = vi.mocked(apiRequest).mock.calls[0] as [string];
      expect(url).toContain('query=hello');
    });

    it('omits query param when query is blank', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce(response);

      await todosApi.getAll({ ...filters, query: '   ' });

      const [url] = vi.mocked(apiRequest).mock.calls[0] as [string];
      expect(url).not.toContain('query=');
    });
  });
});

describe('todosApi.getOne', () => {
  describe('negative cases', () => {
    it('does not return the wrapper object when the server responds with { data: Todo }', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: todo });

      const result = await todosApi.getOne(todo.id);

      expect(result).not.toHaveProperty('data');
    });
  });

  describe('positive cases', () => {
    it('returns the unwrapped Todo from { data: Todo }', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: todo });

      const result = await todosApi.getOne(todo.id);

      expect(result).toEqual(todo);
    });

    it('sends a GET request to the correct todo endpoint', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: todo });

      await todosApi.getOne(todo.id);

      expect(apiRequest).toHaveBeenCalledWith(`todos/${todo.id}`);
    });
  });
});
