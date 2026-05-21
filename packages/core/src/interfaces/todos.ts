export interface Todo {
  completed: boolean;
  description: string;
  id: string;
  title: string;
}

export interface TodosResponse {
  data: Todo[];
  meta: TodosMeta;
}

interface TodosMeta {
  limit: number;
  offset: number;
  total: number;
}
