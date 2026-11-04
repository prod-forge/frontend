import type { ReactNode } from 'react';

import { useState } from 'react';
import { Text, View } from 'react-native';

import type { FieldErrors } from '../utils/field-errors';
import type { TodoFields } from '../utils/todo-fields';

import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';
import { parseTodoFields } from '../utils/todo-fields';
import { PrimaryButton } from './primary-button';
import { TextField } from './text-field';

type AddTodoFormProps = {
  readonly onSubmit: (values: TodoFields) => void;
};

const emptyFields: TodoFields = { description: '', title: '' };

const createStyles = createThemedStyles(({ colors, fontSize, fontWeight, radius, space }) => ({
  heading: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  root: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: space['3'],
    padding: space['4'],
  },
}));

export const AddTodoForm = ({ onSubmit }: AddTodoFormProps): ReactNode => {
  const styles = useThemedStyles(createStyles);
  const [values, setValues] = useState<TodoFields>(emptyFields);
  const [errors, setErrors] = useState<FieldErrors<TodoFields>>({});

  const submit = (): void => {
    const result = parseTodoFields(values);

    if (!result.success) {
      setErrors(result.errors);

      return;
    }

    setErrors({});
    setValues(emptyFields);
    onSubmit(result.data);
  };

  return (
    <View style={styles.root}>
      <Text accessibilityRole="header" style={styles.heading}>
        Add a task
      </Text>
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
      <PrimaryButton onPress={submit} title="Add task" />
    </View>
  );
};
