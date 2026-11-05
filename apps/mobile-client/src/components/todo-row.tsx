import type { Todo } from '@prod-forge-todolist-frontend/core';
import type { ReactNode } from 'react';

import { Pressable, Text, View } from 'react-native';

import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';

type TodoRowProps = {
  readonly onOpen: (id: string) => void;
  readonly onToggle: (id: string) => void;
  readonly todo: Todo;
};

const createStyles = createThemedStyles(({ colors, fontSize, fontWeight, radius, space }) => ({
  body: {
    flex: 1,
    gap: space['1'],
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.accentForeground,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  root: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: space['3'],
    padding: space['3'],
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  titleCompleted: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
}));

export const TodoRow = ({ onOpen, onToggle, todo }: TodoRowProps): ReactNode => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root} testID="todo-row">
      <Pressable
        accessibilityLabel={todo.completed ? `Mark "${todo.title}" as to do` : `Mark "${todo.title}" as done`}
        // An action label that changes with the state, so no checked state that would announce it twice
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => {
          onToggle(todo.id);
        }}
        style={[styles.checkbox, todo.completed && styles.checkboxChecked]}
      >
        {todo.completed ? <Text style={styles.checkmark}>✓</Text> : null}
      </Pressable>
      <Pressable
        accessibilityLabel={`Open "${todo.title}"`}
        accessibilityRole="button"
        onPress={() => {
          onOpen(todo.id);
        }}
        style={styles.body}
      >
        <Text style={[styles.title, todo.completed && styles.titleCompleted]}>{todo.title}</Text>
        {todo.description ? (
          <Text numberOfLines={1} style={styles.description}>
            {todo.description}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
};
