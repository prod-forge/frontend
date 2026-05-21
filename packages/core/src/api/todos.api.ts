import type { Todo, TodoFilters } from '../features/todos/todos.types';
import type { TodosResponse } from '../interfaces/todos';

import { apiRequest } from './client';

type CreatePayload = Pick<Todo, 'description' | 'title'>;
type UpdatePayload = Partial<Pick<Todo, 'completed' | 'description' | 'title'>>;

export const todosApi = {
  create: (data: CreatePayload): Promise<Todo> =>
    apiRequest<{ data: Todo }>('todos', { body: JSON.stringify(data), method: 'POST' }).then((r) => r.data),

  delete: (id: string): Promise<void> => apiRequest<void>(`todos/${id}`, { method: 'DELETE' }),

  getAll: (filters: TodoFilters): Promise<TodosResponse> => {
    const params = new URLSearchParams({
      limit: String(filters.limit),
      offset: String(filters.offset),
      order: filters.order,
      sortBy: filters.sortBy,
    });

    if (filters.query.trim()) {
      params.set('query', filters.query.trim());
    }

    return apiRequest<TodosResponse>(`todos?${params.toString()}`);
  },

  getOne: (id: string): Promise<Todo> => apiRequest<{ data: Todo }>(`todos/${id}`).then((r) => r.data),

  update: (id: string, data: UpdatePayload): Promise<Todo> =>
    apiRequest<{ data: Todo }>(`todos/${id}`, { body: JSON.stringify(data), method: 'PATCH' }).then((r) => r.data),
};
