import type { Todo } from '@prod-forge-todolist-frontend/core';
import type { ReactNode } from 'react';

import { useState } from 'react';
import { View } from 'react-native';

import type { FieldErrors } from '../utils/field-errors';
import type { TodoFields } from '../utils/todo-fields';

import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';
import { parseTodoPatch } from '../utils/todo-fields';
import { PrimaryButton } from './primary-button';
import { TextField } from './text-field';

type TodoEditorProps = {
  readonly onDelete: () => void;
  readonly onSave: (patch: Partial<TodoFields>) => void;
  readonly todo: Todo;
};

const createStyles = createThemedStyles(({ space }) => ({
  actions: {
    gap: space['2'],
  },
  root: {
    gap: space['3'],
  },
}));

// Remount with `key={todo.id}` to reset the draft when another todo is opened.
export const TodoEditor = ({ onDelete, onSave, todo }: TodoEditorProps): ReactNode => {
  const styles = useThemedStyles(createStyles);
  const [values, setValues] = useState<TodoFields>({ description: todo.description, title: todo.title });
  const [errors, setErrors] = useState<FieldErrors<TodoFields>>({});

  // Only edited fields are sent, the same partial PATCH the web inline editors use.
  const save = (): void => {
    const result = parseTodoPatch({
      ...(values.title === todo.title ? {} : { title: values.title }),
      ...(values.description === todo.description ? {} : { description: values.description }),
    });

    if (!result.success) {
      setErrors(result.errors);

      return;
    }

    setErrors({});

    if (Object.keys(result.data).length > 0) {
      onSave(result.data);
    }
  };

  return (
    <View style={styles.root}>
      <TextField
        error={errors.title}
        label="Title"
        onChangeText={(title) => {
          setValues((current) => ({ ...current, title }));
        }}
        value={values.title}
      />
      <TextField
        error={errors.description}
        label="Description"
        multiline
        onChangeText={(description) => {
          setValues((current) => ({ ...current, description }));
        }}
        value={values.description}
      />
      <View style={styles.actions}>
        <PrimaryButton onPress={save} title="Save changes" />
        <PrimaryButton onPress={onDelete} title="Delete task" variant="danger" />
      </View>
    </View>
  );
};
