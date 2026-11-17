export type Todo = {
  completed: boolean;
  description: string;
  id: string;
  title: string;
};

export type TodosResponse = {
  data: Todo[];
  meta: TodosMeta;
};

type TodosMeta = {
  completed: number;
  limit: number;
  offset: number;
  total: number;
};
