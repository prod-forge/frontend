import type { Order, SortBy, Todo } from './todos.types';

export const filterTodos = (items: Todo[], query: string): Todo[] => {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return items;
  }

  return items.filter(
    (todo) => todo.title.toLowerCase().includes(trimmed) || todo.description.toLowerCase().includes(trimmed),
  );
};

export const sortTodos = (items: Todo[], sortBy: SortBy, order: Order): Todo[] => {
  const direction = order === 'asc' ? 1 : -1;

  return items.toSorted((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title) * direction;
    }

    return (Number(a.completed) - Number(b.completed)) * direction;
  });
};
