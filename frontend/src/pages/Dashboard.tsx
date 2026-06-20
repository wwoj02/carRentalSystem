import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Group, Tabs, Paper, Image, Stack, Box } from '@mantine/core';
import { useAppStore } from '../store/appStore';
import { reservationService } from '../services/reservationService';
import type { Reservation } from '../types/Reservation';
import { ReservationStatus } from '../types/Reservation';
import { Button, Modal, Spinner, Badge } from '../components/common';
import { formatDate, formatCurrency } from '../utils/dateUtils';
import { RESERVATION_STATUS_LABELS } from '../utils/constants';

const ACTIVE_STATUSES = [
  ReservationStatus.PENDING_PAYMENT,
  ReservationStatus.CONFIRMED,
  ReservationStatus.ACTIVE,
] as string[];

// Mantine color per reservation status.
const STATUS_COLOR: Record<string, string> = {
  PENDING_PAYMENT: 'yellow',
  CONFIRMED: 'blue',
  ACTIVE: 'green',
  COMPLETED: 'gray',
  CANCELLED: 'red',
  PAYMENT_FAILED: 'red',
};

type Tab = 'active' | 'history';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, showNotify } = useAppStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('active');
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    // When not logged in we render the prompt below, so no fetch is needed.
    if (!currentUser) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reservationService.getUserReservations(currentUser.id);
        if (active) setReservations(data);
      } catch {
        if (active) setError('Failed to load your reservations.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [currentUser]);

  const { activeList, historyList } = useMemo(() => {
    const activeList = reservations.filter((r) => ACTIVE_STATUSES.includes(r.status));
    const historyList = reservations.filter((r) => !ACTIVE_STATUSES.includes(r.status));
    return { activeList, historyList };
  }, [reservations]);

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const updated = await reservationService.cancelReservation(cancelTarget.id);
      // Update local state so the booking moves to the History tab.
      setReservations((prev) =>
        prev.map((r) => (r.id === cancelTarget.id ? { ...r, status: updated.status ?? ReservationStatus.CANCELLED } : r)),
      );
      showNotify('Reservation cancelled.', 'success');
      setCancelTarget(null);
    } catch {
      showNotify('Could not cancel the reservation.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (!currentUser) {
    return (
      <Container size="xs" py={80} ta="center">
        <Title order={1}>Your dashboard</Title>
        <Text c="dimmed" mt="xs">
          Please register or log in to view your reservations.
        </Text>
        <Button mt="lg" onClick={() => navigate('/auth')}>
          Register / Log in
        </Button>
      </Container>
    );
  }

  const renderList = (list: Reservation[], isActive: boolean) => {
    if (loading) return <Spinner size="lg" label="Loading reservations…" className="py-24" />;
    if (error)
      return (
        <Paper p="xl" radius="lg" withBorder c="red" ta="center">
          {error}
        </Paper>
      );
    if (list.length === 0)
      return (
        <Paper p="xl" radius="lg" shadow="sm" ta="center">
          <Text c="dimmed">{isActive ? 'You have no active reservations.' : 'No rental history yet.'}</Text>
        </Paper>
      );
    return (
      <Stack gap="md">
        {list.map((r) => (
          <Paper key={r.id} p="md" radius="lg" shadow="sm">
            <Group justify="space-between" wrap="wrap">
              <Group>
                <Box w={80} h={64} style={{ overflow: 'hidden', borderRadius: 8, background: 'var(--mantine-color-gray-1)' }}>
                  <Image src={r.vehicle.imageUrl} alt={r.vehicle.model} h={64} w={80} fit="cover" fallbackSrc="https://placehold.co/80x64?text=Car" />
                </Box>
                <Box>
                  <Text fw={700}>
                    {r.vehicle.brand} {r.vehicle.model}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {formatDate(r.startDate)} → {formatDate(r.endDate)}
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatCurrency(r.totalPrice)}
                  </Text>
                </Box>
              </Group>
              <Group>
                <Badge color={STATUS_COLOR[r.status] ?? 'gray'}>
                  {RESERVATION_STATUS_LABELS[r.status] ?? r.status}
                </Badge>
                {isActive && (
                  <Button variant="danger" size="sm" onClick={() => setCancelTarget(r)}>
                    Cancel booking
                  </Button>
                )}
              </Group>
            </Group>
          </Paper>
        ))}
      </Stack>
    );
  };

  return (
    <Box bg="gray.1" style={{ minHeight: '100%' }}>
      <Container size="md" py="xl">
        <Group justify="space-between" mb="lg">
          <Box>
            <Title order={1}>Welcome, {currentUser.firstName}</Title>
            <Text size="sm" c="dimmed">
              {currentUser.email}
            </Text>
          </Box>
          <Button variant="outline" onClick={() => navigate('/')}>
            Browse vehicles
          </Button>
        </Group>

        <Tabs value={tab} onChange={(v) => setTab((v as Tab) ?? 'active')} color="dark" radius="xl">
          <Tabs.List mb="md">
            <Tabs.Tab value="active">Active ({activeList.length})</Tabs.Tab>
            <Tabs.Tab value="history">History ({historyList.length})</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="active">{renderList(activeList, true)}</Tabs.Panel>
          <Tabs.Panel value="history">{renderList(historyList, false)}</Tabs.Panel>
        </Tabs>
      </Container>

      <Modal
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Cancel reservation?"
        footer={
          <Group justify="flex-end">
            <Button variant="ghost" onClick={() => setCancelTarget(null)} disabled={cancelling}>
              Keep booking
            </Button>
            <Button variant="danger" onClick={confirmCancel} loading={cancelling}>
              Yes, cancel
            </Button>
          </Group>
        }
      >
        {cancelTarget && (
          <Text size="sm" c="dimmed">
            Are you sure you want to cancel your reservation for{' '}
            <Text span fw={600} c="dark">
              {cancelTarget.vehicle.brand} {cancelTarget.vehicle.model}
            </Text>{' '}
            ({formatDate(cancelTarget.startDate)} → {formatDate(cancelTarget.endDate)})? This action cannot be undone.
          </Text>
        )}
      </Modal>
    </Box>
  );
};
