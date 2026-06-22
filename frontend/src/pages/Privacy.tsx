import { Container, Title, Text, Stack, List, Anchor, Box } from '@mantine/core';
import { Link } from 'react-router-dom';

export const Privacy = () => (
  <Box bg="gray.1" style={{ minHeight: '100%' }}>
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Box>
          <Title order={1}>Privacy Policy</Title>
          <Text size="sm" c="dimmed" mt="xs">
            Last updated: June 2026
          </Text>
        </Box>

        <Stack gap="md">
          <Text>
            Rent-A-Car processes personal data to provide car rental services. This policy describes what we
            collect, why we use it, how long we keep it, and how you can contact us.
          </Text>

          <Box>
            <Title order={3} size="h4">
              Data we collect
            </Title>
            <List size="sm" mt="xs" spacing="xs">
              <List.Item>Account details: name, email address, and password (stored securely hashed).</List.Item>
              <List.Item>
                Reservation details: phone number, driving licence ID, rental dates, vehicle choice, and optional
                extras (insurance, GPS, young driver).
              </List.Item>
              <List.Item>Payment-related records linked to your reservations.</List.Item>
              <List.Item>Staff notes recorded at vehicle pickup or return (e.g. condition, damage).</List.Item>
            </List>
          </Box>

          <Box>
            <Title order={3} size="h4">
              Purpose of processing
            </Title>
            <List size="sm" mt="xs" spacing="xs">
              <List.Item>Creating and managing your account and reservations.</List.Item>
              <List.Item>Processing payments and issuing rental agreements.</List.Item>
              <List.Item>Contacting you about your booking when necessary.</List.Item>
              <List.Item>Meeting legal obligations related to vehicle rental.</List.Item>
            </List>
          </Box>

          <Box>
            <Title order={3} size="h4">
              Data retention
            </Title>
            <Text size="sm" mt="xs">
              We keep account and reservation data for as long as your account is active and as required to fulfil
              contracts and legal obligations. Completed rental records may be retained for up to 5 years for
              accounting and dispute resolution. You may request account deletion from your dashboard; deletion is
              blocked while you have active reservations.
            </Text>
          </Box>

          <Box>
            <Title order={3} size="h4">
              Your rights
            </Title>
            <Text size="sm" mt="xs">
              You may access, correct, or delete your account data where applicable. To exercise other GDPR rights
              (e.g. data portability or restriction), contact us using the details below.
            </Text>
          </Box>

          <Box>
            <Title order={3} size="h4">
              Contact
            </Title>
            <Text size="sm" mt="xs">
              Data controller: Rent-A-Car · Email:{' '}
              <Anchor href="mailto:privacy@rent-a-car.example">privacy@rent-a-car.example</Anchor>
            </Text>
          </Box>

          <Text size="sm" c="dimmed">
            <Link to="/">Back to home</Link>
          </Text>
        </Stack>
      </Stack>
    </Container>
  </Box>
);
