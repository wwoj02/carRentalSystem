import { Link, useNavigate } from 'react-router-dom';
import { Group, Container, Avatar, Text, UnstyledButton, ThemeIcon } from '@mantine/core';
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
            {currentUser ? (
              <>
                <UnstyledButton onClick={() => navigate('/dashboard')} title="Go to dashboard">
                  <Group gap="xs">
                    <Avatar color="gray" radius="xl" size="md">
                      {currentUser.firstName?.[0]?.toUpperCase()}
                    </Avatar>
                    <Text size="sm" fw={500} visibleFrom="sm">
                      {currentUser.firstName}
                    </Text>
                  </Group>
                </UnstyledButton>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
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
