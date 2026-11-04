import type { RegisterValues } from '@prod-forge-todolist-frontend/core';
import type { ReactNode } from 'react';

import { register, registerSchema } from '@prod-forge-todolist-frontend/core';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import type { FieldErrors } from '../utils/field-errors';

import { AuthHeader } from '../components/auth-header';
import { PrimaryButton } from '../components/primary-button';
import { Screen } from '../components/screen';
import { TextField } from '../components/text-field';
import { useAppDispatch } from '../hooks/use-app-dispatch';
import { useRedirectWhenAuthenticated } from '../hooks/use-redirect-when-authenticated';
import { toFieldErrors } from '../utils/field-errors';

const emptyValues: RegisterValues = { email: '', name: '', password: '' };

export default function RegisterScreen(): ReactNode {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [values, setValues] = useState<RegisterValues>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors<RegisterValues>>({});

  useRedirectWhenAuthenticated();

  const submit = (): void => {
    const result = registerSchema.safeParse(values);

    if (!result.success) {
      setErrors(toFieldErrors<RegisterValues>(result.error.issues));

      return;
    }

    setErrors({});
    dispatch(register({ email: result.data.email, name: result.data.name }));
  };

  return (
    <Screen>
      <AuthHeader subtitle="Start organizing your tasks." title="Create an account" />
      <TextField
        error={errors.name}
        label="Name"
        onChangeText={(name) => {
          setValues((current) => ({ ...current, name }));
        }}
        value={values.name}
      />
      <TextField
        autoCapitalize="none"
        error={errors.email}
        keyboardType="email-address"
        label="Email"
        onChangeText={(email) => {
          setValues((current) => ({ ...current, email }));
        }}
        value={values.email}
      />
      <TextField
        autoCapitalize="none"
        error={errors.password}
        label="Password"
        onChangeText={(password) => {
          setValues((current) => ({ ...current, password }));
        }}
        secureTextEntry
        value={values.password}
      />
      <PrimaryButton onPress={submit} title="Create account" />
      <PrimaryButton
        onPress={() => {
          router.replace('/login');
        }}
        title="I already have an account"
        variant="secondary"
      />
    </Screen>
  );
}
