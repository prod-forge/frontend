import type { ReactNode } from 'react';

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../components/button/button';
import { EditableDescription } from '../../components/editable-description/editable-description';
import { EditableTitle } from '../../components/editable-title/editable-title';
import { ErrorBlock } from '../../components/error-block/error-block';
import { Modal } from '../../components/modal/modal';
import { Preloader } from '../../components/preloader/preloader';
import { RetryButton } from '../../components/retry-button/retry-button';
import { TodoStatus } from '../../components/todo-status/todo-status';
import { selectIsAuthenticated } from '../../features/auth/auth.selectors';
import { clearErrors } from '../../features/errors/errors.slice';
import {
  DESCRIPTION_MAX_LENGTH,
  descriptionSchema,
  TITLE_MAX_LENGTH,
  titleSchema,
} from '../../features/todos/todos.schemas';
import { selectCurrentTodo, selectCurrentTodoStatus } from '../../features/todos/todos.selectors';
import { clearCurrentTodo, deleteTodo, fetchTodoById, updateTodo } from '../../features/todos/todos.slices';
import { useAppDispatch, useAppSelector } from '../../hooks/redux/redux';

export const TodoDetail = (): ReactNode => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentTodo = useAppSelector(selectCurrentTodo);
  const currentTodoStatus = useAppSelector(selectCurrentTodoStatus);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    dispatch(clearCurrentTodo());
    void dispatch(fetchTodoById(id));
  }, [dispatch, id, isAuthenticated]);

  if (!isAuthenticated) return null;

  if (currentTodoStatus === 'loading') {
    return <Preloader />;
  }

  if (currentTodoStatus === 'error') {
    return (
      <ErrorBlock
        action={
          <RetryButton
            onClick={() => {
              dispatch(clearErrors());
              if (id) void dispatch(fetchTodoById(id));
            }}
          />
        }
        message="Failed to load task. Please try again."
      />
    );
  }

  if (currentTodoStatus === 'not-found' || !currentTodo) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-semibold text-fg">Task not found</h2>
        <Link className="mt-4 inline-block font-medium text-brand hover:underline" to="/">
          Go back to home
        </Link>
      </div>
    );
  }

  const todo = currentTodo;

  const handleConfirmDelete = (): void => {
    setConfirmOpen(false);
    void dispatch(deleteTodo(todo.id));
    void navigate('/');
  };

  return (
    <div>
      <Link
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-fg-soft transition-colors duration-[120ms] hover:text-brand"
        to="/"
      >
        <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
        Back to Home
      </Link>

      <div className="rounded-xl border border-line bg-card p-8 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <TodoStatus completed={todo.completed} />
          <button
            aria-label="Delete task"
            className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent text-fg-muted transition duration-[120ms] outline-none hover:border-line hover:bg-page-soft hover:text-err focus-visible:border-brand focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            onClick={() => setConfirmOpen(true)}
            type="button"
          >
            <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
        <div className="mt-4">
          <EditableTitle
            maxLength={TITLE_MAX_LENGTH * 2}
            onSubmit={(title) => void dispatch(updateTodo({ id: todo.id, title }))}
            schema={titleSchema}
            value={todo.title}
          />
        </div>
        <div className="mt-6">
          <EditableDescription
            maxLength={DESCRIPTION_MAX_LENGTH * 2}
            onSubmit={(description) => void dispatch(updateTodo({ description, id: todo.id }))}
            schema={descriptionSchema}
            value={todo.description}
          />
        </div>
      </div>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Are you sure you want to delete?">
        <p>This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={() => setConfirmOpen(false)} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="danger">
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
