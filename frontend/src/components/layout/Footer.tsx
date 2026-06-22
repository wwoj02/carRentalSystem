import { Container, Group, Text, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer
    style={{
      borderTop: '1px solid var(--mantine-color-gray-2)',
      background: 'var(--mantine-color-gray-0)',
      marginTop: 'auto',
    }}
  >
    <Container size="xl" py="md">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          © {new Date().getFullYear()} Rent-A-Car
        </Text>
        <Anchor component={Link} to="/privacy" size="sm" c="dimmed">
          Privacy policy
        </Anchor>
      </Group>
    </Container>
  </footer>
);
