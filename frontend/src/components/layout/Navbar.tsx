import { Link, useNavigate } from 'react-router-dom';
import { Group, Container, Avatar, Text, UnstyledButton, ThemeIcon, Menu, Divider, Box } from '@mantine/core';
import { useAppStore } from '../../store/appStore';
import { userService } from '../../services/userService';
import { Button } from '../common';

export const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, showNotify } = useAppStore();

  const handleLogout = () => {
    userService.clearCurrentUser();
    setCurrentUser(null);
    showNotify('You have been logged out', 'info');
    navigate('/');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderBottom: '1px solid var(--mantine-color-gray-2)',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container size="xl" py="sm">
        <Group justify="space-between">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group gap="xs">
              <ThemeIcon color="dark" radius="md" size="lg">
                R
              </ThemeIcon>
              <Text fw={700} size="lg" c="dark">
                Rent-A-Car
              </Text>
            </Group>
          </Link>

          <Group gap="sm">
            {(currentUser?.role === 'EMPLOYEE' || currentUser?.role === 'ADMIN') && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/staff')}>
                Staff
              </Button>
            )}
            {currentUser ? (
              <Menu position="bottom-end" width={240} shadow="md" withArrow>
                <Menu.Target>
                  <UnstyledButton title="Open account menu">
                    <Group gap="xs">
                      <Avatar color="gray" radius="xl" size="md">
                        {currentUser.firstName?.[0]?.toUpperCase()}
                      </Avatar>
                      <Text size="sm" fw={500} visibleFrom="sm">
                        {currentUser.firstName}
                      </Text>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Box px="sm" py={6}>
                    <Text size="sm" fw={700}>
                      {currentUser.firstName} {currentUser.lastName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {currentUser.email}
                    </Text>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mt={4}>
                      {currentUser.role}
                    </Text>
                  </Box>

                  <Divider my={4} />

                  <Menu.Item onClick={() => navigate('/dashboard')}>Dashboard</Menu.Item>
                  <Menu.Item onClick={() => navigate('/')}>Browse vehicles</Menu.Item>
                  {(currentUser.role === 'EMPLOYEE' || currentUser.role === 'ADMIN') && (
                    <Menu.Item onClick={() => navigate('/staff')}>Staff panel</Menu.Item>
                  )}

                  <Divider my={4} />

                  <Menu.Item color="red" onClick={handleLogout}>
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button variant="primary" size="sm" onClick={() => navigate('/auth')}>
                Log in
              </Button>
            )}
          </Group>
        </Group>
      </Container>
    </header>
  );
};
