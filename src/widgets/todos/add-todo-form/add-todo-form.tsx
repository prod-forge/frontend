import type { ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../../../components/button/button';
import { Input } from '../../../components/input/input';
import {
  DESCRIPTION_MAX_LENGTH,
  descriptionSchema,
  TITLE_MAX_LENGTH,
  titleSchema,
} from '../../../features/todos/todos.schemas';

const formSchema = z.object({
  description: descriptionSchema,
  title: titleSchema,
});

export interface Props {
  onSubmit: (values: TodoFormValues) => void;
}

export type TodoFormValues = z.infer<typeof formSchema>;

const defaultValues: TodoFormValues = { description: '', title: '' };

export const AddTodoForm = ({ onSubmit }: Props): ReactNode => {
  const { formState, handleSubmit, register, reset } = useForm<TodoFormValues>({
    defaultValues,
    mode: 'onSubmit',
    resolver: zodResolver(formSchema),
  });

  const submit = handleSubmit((data) => {
    onSubmit(data);
    reset(defaultValues);
  });

  return (
    <form className="rounded-xl border border-line bg-card p-6 shadow-md" noValidate onSubmit={(e) => void submit(e)}>
      <h2 className="mb-4 text-lg font-semibold text-fg">Add a task</h2>

      <div className="flex flex-col gap-3">
        <Input
          autoComplete="off"
          error={formState.errors.title?.message}
          id="todo-form-title"
          label="Title"
          maxLength={TITLE_MAX_LENGTH * 2}
          placeholder="What needs to be done?"
          {...register('title')}
        />

        <Input
          autoComplete="off"
          error={formState.errors.description?.message}
          id="todo-form-description"
          label="Description"
          maxLength={DESCRIPTION_MAX_LENGTH * 2}
          placeholder="Optional details"
          {...register('description')}
        />

        <div className="flex justify-end">
          <Button disabled={formState.isSubmitting} type="submit">
            Add task
          </Button>
        </div>
      </div>
    </form>
  );
};
