import type { LoginValues } from '@prod-forge-todolist-frontend/core';
import type { ReactNode } from 'react';

import { login, loginSchema } from '@prod-forge-todolist-frontend/core';
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

const emptyValues: LoginValues = { email: '', password: '' };

export default function LoginScreen(): ReactNode {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [values, setValues] = useState<LoginValues>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});
  const [submitting, setSubmitting] = useState(false);

  useRedirectWhenAuthenticated();

  const submit = (): void => {
    const result = loginSchema.safeParse(values);

    if (!result.success) {
      setErrors(toFieldErrors<LoginValues>(result.error.issues));

      return;
    }

    setErrors({});
    setSubmitting(true);
    void dispatch(login({ email: result.data.email })).finally(() => {
      setSubmitting(false);
    });
  };

  return (
    <Screen>
      <AuthHeader subtitle="Sign in to access your tasks." title="Welcome back" />
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
      <PrimaryButton disabled={submitting} onPress={submit} title="Sign in" />
      <PrimaryButton
        onPress={() => {
          router.push('/register');
        }}
        title="Create an account"
        variant="secondary"
      />
    </Screen>
  );
}
