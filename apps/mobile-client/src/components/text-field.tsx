import type { ReactNode } from 'react';
import type { TextInputProps } from 'react-native';

import { Text, TextInput, View } from 'react-native';

import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';

type TextFieldProps = {
  readonly autoCapitalize?: TextInputProps['autoCapitalize'];
  readonly error?: string;
  readonly keyboardType?: TextInputProps['keyboardType'];
  readonly label: string;
  readonly multiline?: boolean;
  readonly onChangeText: (value: string) => void;
  readonly secureTextEntry?: boolean;
  readonly value: string;
};

const createStyles = createThemedStyles(({ colors, fontSize, fontWeight, radius, space }) => ({
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
  },
  field: {
    gap: space['1'],
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    minHeight: 44,
    paddingHorizontal: space['3'],
    paddingVertical: space['2'],
  },
  inputInvalid: {
    borderColor: colors.danger,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
}));

export const TextField = ({
  autoCapitalize = 'sentences',
  error,
  keyboardType = 'default',
  label,
  multiline = false,
  onChangeText,
  secureTextEntry = false,
  value,
}: TextFieldProps): ReactNode => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={[styles.input, multiline && styles.multiline, error ? styles.inputInvalid : null]}
        value={value}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};
