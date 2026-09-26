export type LimitValue = 10 | 20 | 50;

export type Order = 'asc' | 'desc';

export type SortBy = 'completed' | 'title';

export type Todo = {
  completed: boolean;
  description: string;
  id: string;
  title: string;
};

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
  currentTodo: null | Todo;
  currentTodoStatus: CurrentTodoStatus;
  filters: TodoFilters;
  items: Todo[];
  status: TodosStatus;
  total: number;
};

type CurrentTodoStatus = 'error' | 'idle' | 'loading' | 'not-found';

type TodosStatus = 'error' | 'idle' | 'loading';
