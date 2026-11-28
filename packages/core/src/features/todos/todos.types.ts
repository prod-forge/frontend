import type { SerializedApiError } from '../../errors/serialize-api-error';
import type { Todo } from '../../interfaces/todos';

export type { Todo };

export type LimitValue = 10 | 20 | 50;

export type Order = 'asc' | 'desc';

export type SortBy = 'completed' | 'title';

export type TodoFilters = {
  limit: LimitValue;
  offset: number;
  order: Order;
  query: string;
  sortBy: SortBy;
};

export type TodosState = {
  /** @internal rollback data for in-flight deletes keyed by requestId */
  _pendingDeletes: Partial<Record<string, { index: number; item: Todo }>>;
  /** @internal original field values for in-flight updates keyed by requestId */
  _pendingUpdates: Partial<Record<string, Pick<Todo, 'description' | 'title'>>>;
  /** Completed todos among all that match the filters (server count, adjusted by optimistic toggles and deletes). */
  completed: number;
  currentTodo: null | Todo;
  currentTodoStatus: CurrentTodoStatus;
  /** Last fetchTodos error, if the list failed to load; the UI shows its message and Retry-After wait. */
  error?: null | SerializedApiError;
  filters: TodoFilters;
  items: Todo[];
  /** Server position after the last loaded page; optimistic inserts do not move it. */
  nextOffset: number;
  status: TodosStatus;
  total: number;
};

type CurrentTodoStatus = 'error' | 'idle' | 'loading' | 'not-found';

type TodosStatus = 'error' | 'idle' | 'loading';
