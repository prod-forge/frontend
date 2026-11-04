import type { Todo, TodosResponse } from '@prod-forge-todolist-frontend/core';

export type TodosQuery = {
  completed?: boolean;
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
  search?: string;
  sortBy?: string;
};

const DEFAULT_LIMIT = 10;

const matchesSearch = (todo: Todo, search: string): boolean => {
  const needle = search.trim().toLowerCase();

  return !needle || todo.title.toLowerCase().includes(needle);
};

const sortItems = (items: readonly Todo[], sortBy: string | undefined, order: 'asc' | 'desc'): readonly Todo[] => {
  const direction = order === 'asc' ? 1 : -1;

  if (sortBy === 'title') return items.toSorted((a, b) => a.title.localeCompare(b.title) * direction);
  if (sortBy === 'completed') return items.toSorted((a, b) => (Number(a.completed) - Number(b.completed)) * direction);

  // createdAt (the backend default): items are stored in creation order
  return order === 'asc' ? items : items.toReversed();
};

export const applyTodosQuery = (items: readonly Todo[], query: TodosQuery): TodosResponse => {
  const { completed, limit = DEFAULT_LIMIT, offset = 0, order = 'desc', search = '', sortBy } = query;

  const filtered = items.filter(
    (todo) => matchesSearch(todo, search) && (completed === undefined || todo.completed === completed),
  );
  const sorted = sortItems(filtered, sortBy, order);

  return {
    data: sorted.slice(offset, offset + limit),
    meta: { limit, offset, total: sorted.length },
  };
};
