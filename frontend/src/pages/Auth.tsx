import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Paper, Tabs, Stack, PasswordInput } from '@mantine/core';
import { useUser } from '../hooks/useUser';
import { useAppStore } from '../store/appStore';
import { Button, Input } from '../components/common';

type Tab = 'login' | 'register';

export const Auth = () => {
  const navigate = useNavigate();
  const { createUser, loading } = useUser();
  const { setCurrentUser, showNotify } = useAppStore();
  const [tab, setTab] = useState<Tab>('login');

  // login form (mock)
  const [loginEmail, setLoginEmail] = useState('');

  // register form
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    // No actual login endpoint exists, per the API contract.
    showNotify('No login endpoint available', 'info');
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required';
    if (!form.lastName.trim()) next.lastName = 'Last name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'A valid email is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const user = await createUser(form);
      setCurrentUser(user);
      showNotify(`Welcome, ${user.firstName}! Your account is ready.`, 'success');
      navigate('/');
    } catch {
      showNotify('Registration failed. Please try again.', 'error');
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
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.currentTarget.value)}
                  />
                  <PasswordInput label="Password" placeholder="••••••••" />
                  <Button type="submit" size="lg" fullWidth>
                    Log In
                  </Button>
                  <Text ta="center" size="xs" c="dimmed">
                    Demo only — no login endpoint is available.
                  </Text>
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
