import type { Todo } from '@prod-forge-todolist-frontend/core';
import type { ReactNode } from 'react';

import {
  addTodo,
  clearErrors,
  fetchMoreTodos,
  fetchTodos,
  logout,
  selectAuthUser,
  selectCompletedTodos,
  selectFilters,
  selectIsAuthenticated,
  selectStatus,
  selectTotalTodos,
  selectVisibleTodos,
  toggleTodo,
} from '@prod-forge-todolist-frontend/core';
import { Redirect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, View } from 'react-native';

import { AddTodoForm } from '../../components/add-todo-form';
import { EmptyState } from '../../components/empty-state';
import { ErrorBanner } from '../../components/error-banner';
import { ListFooter } from '../../components/list-footer';
import { ListSummary } from '../../components/list-summary';
import { Screen } from '../../components/screen';
import { TodoRow } from '../../components/todo-row';
import { useAppDispatch } from '../../hooks/use-app-dispatch';
import { useAppSelector } from '../../hooks/use-app-selector';
import { useThemedStyles } from '../../hooks/use-themed-styles';
import { createThemedStyles } from '../../theme/create-themed-styles';

const createStyles = createThemedStyles(({ space }) => ({
  header: {
    gap: space['4'],
    paddingBottom: space['4'],
  },
  list: {
    gap: space['2'],
  },
}));

// Two default pages render in the first batch; longer lists are windowed by FlatList as usual.
const INITIAL_ROWS = 20;

const keyExtractor = (todo: Todo): string => todo.id;

export default function TodosScreen(): ReactNode {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);
  const items = useAppSelector(selectVisibleTodos);
  const filters = useAppSelector(selectFilters);
  const total = useAppSelector(selectTotalTodos);
  const completed = useAppSelector(selectCompletedTodos);
  const status = useAppSelector(selectStatus);
  const nextOffset = useAppSelector((state) => state.todos.nextOffset);

  useEffect(() => {
    if (isAuthenticated) {
      void dispatch(fetchTodos(filters));
    }
  }, [dispatch, filters, isAuthenticated]);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // nextOffset counts only rows the server returned; items.length also counts optimistic adds and would skip a row.
  const loadMore = (): void => {
    void dispatch(fetchMoreTodos({ ...filters, offset: nextOffset }));
  };

  const retry = (): void => {
    dispatch(clearErrors());

    if (items.length === 0) {
      void dispatch(fetchTodos(filters));
    } else {
      loadMore();
    }
  };

  return (
    <Screen>
      <FlatList
        contentContainerStyle={styles.list}
        data={items}
        initialNumToRender={INITIAL_ROWS}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          status === 'idle' ? <EmptyState message="No tasks yet. Add the first one above." /> : undefined
        }
        ListFooterComponent={
          <ListFooter hasMore={items.length < total} isLoading={status === 'loading'} onLoadMore={loadMore} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ListSummary
              completed={completed}
              onLogout={() => dispatch(logout())}
              total={total}
              userName={user?.name}
            />
            <AddTodoForm onSubmit={(values) => void dispatch(addTodo(values))} />
            {status === 'error' ? <ErrorBanner message="Failed to load tasks." onRetry={retry} /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <TodoRow
            onOpen={(id) => {
              router.push(`/todos/${id}`);
            }}
            onToggle={(id) => void dispatch(toggleTodo(id))}
            todo={item}
          />
        )}
      />
    </Screen>
  );
}
