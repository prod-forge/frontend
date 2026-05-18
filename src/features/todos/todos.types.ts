export type LimitValue = 10 | 20 | 50;

export type Order = 'asc' | 'desc';

export type SortBy = 'completed' | 'title';

export interface Todo {
  completed: boolean;
  description: string;
  id: string;
  title: string;
}

export interface TodoFilters {
  limit: LimitValue;
  offset: number;
  order: Order;
  query: string;
  sortBy: SortBy;
}

export interface TodosState {
  /** @internal rollback data for in-flight deletes keyed by requestId */
  _pendingDeletes: Record<string, { index: number; item: Todo }>;
  /** @internal original field values for in-flight updates keyed by requestId */
  _pendingUpdates: Record<string, Pick<Todo, 'description' | 'title'>>;
  currentTodo: null | Todo;
  currentTodoStatus: CurrentTodoStatus;
  filters: TodoFilters;
  items: Todo[];
  status: TodosStatus;
  total: number;
}

type CurrentTodoStatus = 'error' | 'idle' | 'loading' | 'not-found';

type TodosStatus = 'error' | 'idle' | 'loading';
