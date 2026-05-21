import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '../../store';

const selectTodosState = (state: RootState): RootState['todos'] => state.todos;

export const selectItems = createSelector(selectTodosState, (state) => state.items);

export const selectFilters = createSelector(selectTodosState, (state) => state.filters);

export const selectStatus = createSelector(selectTodosState, (state) => state.status);

export const selectVisibleTodos = createSelector(selectTodosState, (state) => state.items);

export const selectCompletedTodos = createSelector(selectItems, (items) => items.filter((t) => t.completed).length);

export const selectTotalTodos = createSelector(selectTodosState, (state) => state.total);

export const selectCurrentTodo = createSelector(selectTodosState, (state) => state.currentTodo);

export const selectCurrentTodoStatus = createSelector(selectTodosState, (state) => state.currentTodoStatus);
