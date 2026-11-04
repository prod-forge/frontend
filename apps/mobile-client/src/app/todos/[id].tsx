import type { ReactNode } from 'react';

import {
  deleteTodo,
  fetchTodoById,
  selectCurrentTodo,
  selectCurrentTodoStatus,
  selectIsAuthenticated,
  updateTodo,
} from '@prod-forge-todolist-frontend/core';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';

import type { TodoFields } from '../../utils/todo-fields';

import { ErrorBanner } from '../../components/error-banner';
import { NotFound } from '../../components/not-found';
import { Preloader } from '../../components/preloader';
import { Screen } from '../../components/screen';
import { TodoEditor } from '../../components/todo-editor';
import { useAppDispatch } from '../../hooks/use-app-dispatch';
import { useAppSelector } from '../../hooks/use-app-selector';

export default function TodoDetailScreen(): ReactNode {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const todo = useAppSelector(selectCurrentTodo);
  const status = useAppSelector(selectCurrentTodoStatus);

  useEffect(() => {
    if (isAuthenticated) {
      void dispatch(fetchTodoById(id));
    }
  }, [dispatch, id, isAuthenticated]);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const save = (patch: Partial<TodoFields>): void => {
    void dispatch(updateTodo({ id, ...patch }));
  };

  const remove = async (): Promise<void> => {
    const result = await dispatch(deleteTodo(id));

    if (deleteTodo.fulfilled.match(result)) {
      router.back();
    }
  };

  const confirmDelete = (): void => {
    Alert.alert('Delete task', 'This task will be removed permanently.', [
      { style: 'cancel', text: 'Cancel' },
      {
        onPress: (): void => {
          void remove();
        },
        style: 'destructive',
        text: 'Delete',
      },
    ]);
  };

  if (status === 'not-found') {
    return (
      <Screen>
        <NotFound message="This task does not exist or was deleted." onBack={() => router.back()} />
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen>
        <ErrorBanner message="Failed to load the task." onRetry={() => void dispatch(fetchTodoById(id))} />
      </Screen>
    );
  }

  return (
    <Screen>
      {todo?.id === id ? (
        <TodoEditor key={todo.id} onDelete={confirmDelete} onSave={save} todo={todo} />
      ) : (
        <Preloader />
      )}
    </Screen>
  );
}
