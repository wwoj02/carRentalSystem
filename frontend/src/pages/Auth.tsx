import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Paper, Tabs, Stack, PasswordInput, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useAppStore } from '../store/appStore';
import { Button, Input } from '../components/common';

type Tab = 'login' | 'register';

export const Auth = () => {
  const navigate = useNavigate();
  const { register, login, loading } = useUser();
  const { setCurrentUser, showNotify } = useAppStore();
  const [tab, setTab] = useState<Tab>('login');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getErrorMessage = (err: unknown, fallback: string) => {
    const maybeAxios = err as { response?: { data?: { message?: string } } };
    return maybeAxios.response?.data?.message ?? fallback;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(loginForm);
      setCurrentUser(user);
      showNotify(`Welcome back, ${user.firstName}!`, 'success');
      navigate(user.role === 'EMPLOYEE' || user.role === 'ADMIN' ? '/staff' : '/dashboard');
    } catch (err) {
      showNotify(getErrorMessage(err, 'Invalid email or password.'), 'error');
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required';
    if (!form.lastName.trim()) next.lastName = 'Last name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'A valid email is required';
    if (form.password.length < 6) next.password = 'Password must have at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const user = await register(form);
      setCurrentUser(user);
      showNotify(`Welcome, ${user.firstName}! Your account is ready.`, 'success');
      navigate('/');
    } catch (err) {
      showNotify(getErrorMessage(err, 'Registration failed. Please try again.'), 'error');
    }
  };

  return (
    <Container size={420} py={60}>
      <Stack gap="lg">
        <Stack gap={4} align="center">
          <Title order={1}>Customer Portal</Title>
          <Text size="sm" c="dimmed">
            Sign in or create an account to start renting.
          </Text>
          <Anchor component={Link} to="/privacy" size="xs" c="dimmed">
            Privacy policy
          </Anchor>
        </Stack>

        <Paper radius="lg" shadow="sm" withBorder>
          <Tabs value={tab} onChange={(v) => setTab((v as Tab) ?? 'login')} color="dark">
            <Tabs.List grow>
              <Tabs.Tab value="login">Log in</Tabs.Tab>
              <Tabs.Tab value="register">Register</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="login" p="lg">
              <form onSubmit={handleLogin}>
                <Stack gap="md">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.currentTarget.value })}
                  />
                  <PasswordInput
                    label="Password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.currentTarget.value })}
                  />
                  <Button type="submit" size="lg" fullWidth loading={loading}>
                    Log In
                  </Button>
                </Stack>
              </form>
            </Tabs.Panel>

            <Tabs.Panel value="register" p="lg">
              <form onSubmit={handleRegister}>
                <Stack gap="md">
                  <Input
                    label="First name"
                    value={form.firstName}
                    error={errors.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.currentTarget.value })}
                  />
                  <Input
                    label="Last name"
                    value={form.lastName}
                    error={errors.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.currentTarget.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    error={errors.email}
                    onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
                  />
                  <PasswordInput
                    label="Password"
                    value={form.password}
                    error={errors.password}
                    onChange={(e) => setForm({ ...form, password: e.currentTarget.value })}
                  />
                  <Button type="submit" size="lg" fullWidth loading={loading}>
                    Create account
                  </Button>
                </Stack>
              </form>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </Container>
  );
};
