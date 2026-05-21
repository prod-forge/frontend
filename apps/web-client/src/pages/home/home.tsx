import type { LimitValue } from '@prod-forge-todolist-frontend/core';
import type { TodoFormValues } from '@prod-forge-todolist-frontend/ui-web';
import type { ReactNode } from 'react';

import {
  addTodo,
  clearErrors,
  fetchTodos,
  LIMIT_OPTIONS,
  ORDER_OPTIONS,
  selectAuthUser,
  selectCompletedTodos,
  selectFilters,
  selectIsAuthenticated,
  selectStatus,
  selectTotalTodos,
  selectVisibleTodos,
  setLimit,
  setOffset,
  setOrder,
  setSortBy,
  SORT_BY_OPTIONS,
  toggleTodo,
  updateFilters,
} from '@prod-forge-todolist-frontend/core';
import {
  Accordion,
  AddTodoForm,
  EmptyState,
  ErrorBlock,
  Pagination,
  Preloader,
  RetryButton,
  SearchField,
  Select,
  TodoItem,
  TodoList,
} from '@prod-forge-todolist-frontend/ui-web';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks/redux/redux';

export const Home = (): ReactNode => {
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);
  const todos = useAppSelector(selectVisibleTodos);
  const filters = useAppSelector(selectFilters);
  const total = useAppSelector(selectTotalTodos);
  const completed = useAppSelector(selectCompletedTodos);
  const status = useAppSelector(selectStatus);

  useEffect(() => {
    if (isAuthenticated) {
      void dispatch(fetchTodos(filters));
    }
  }, [dispatch, filters, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center gap-6 py-16 text-center">
        <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-fg">Welcome to TodoAI</h1>
        <p className="text-lg text-fg-soft">
          Plan your day, capture your ideas, and tick things off as you go. Sign in to view your task list, or create a
          new account to get started.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-brand-fg transition duration-[120ms] hover:bg-brand-hover focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            to="/login"
          >
            Sign in
          </Link>
          <Link
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-line bg-card px-4 text-sm font-semibold text-fg transition duration-[120ms] hover:border-fg-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            to="/register"
          >
            Create account
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-fg">My Tasks</h1>

        <p className="mt-2 text-md text-fg-soft">
          {user?.name ? `${user.name} — ` : ''}
          {completed} of {total} completed
        </p>
      </div>

      <div className="mb-6">
        <AddTodoForm
          onSubmit={(values: TodoFormValues) =>
            void dispatch(addTodo({ description: values.description, title: values.title }))
          }
        />
      </div>

      <div className="mb-3">
        <SearchField
          id="search"
          onChange={(value) => dispatch(updateFilters({ query: value }))}
          placeholder="Search tasks…"
          value={filters.query}
        />
      </div>

      {status === 'loading' && todos.length === 0 ? (
        <Preloader />
      ) : status === 'error' && todos.length === 0 ? (
        <ErrorBlock
          action={
            <RetryButton
              onClick={() => {
                dispatch(clearErrors());
                void dispatch(fetchTodos(filters));
              }}
            />
          }
          message="Failed to load tasks. Please refresh the page."
        />
      ) : todos.length === 0 ? (
        <EmptyState message="No tasks match your search." />
      ) : (
        <TodoList>
          {todos.map((todo) => (
            <TodoItem key={todo.id} onToggle={(id) => void dispatch(toggleTodo(id))} todo={todo} />
          ))}
        </TodoList>
      )}

      <div className="mb-5">
        <Accordion title="Filters">
          <div className="flex flex-wrap items-center gap-4 max-[480px]:flex-col max-[480px]:items-stretch max-[480px]:gap-3">
            <Select
              id="sort-by"
              label="Sort by"
              onChange={(value) => dispatch(setSortBy(value))}
              options={SORT_BY_OPTIONS}
              value={filters.sortBy}
            />

            <Select
              id="order"
              label="Order"
              onChange={(value) => dispatch(setOrder(value))}
              options={ORDER_OPTIONS}
              value={filters.order}
            />

            <Select
              id="limit"
              label="Per page"
              onChange={(value) => dispatch(setLimit(Number(value) as LimitValue))}
              options={LIMIT_OPTIONS}
              value={String(filters.limit)}
            />
          </div>
        </Accordion>
      </div>

      <Pagination
        limit={filters.limit}
        offset={filters.offset}
        onOffsetChange={(offset) => dispatch(setOffset(offset))}
        total={total}
      />
    </div>
  );
};
