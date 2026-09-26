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
  limit: number;
  offset: number;
  total: number;
};
