import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, Group, Tabs, Paper, Image, Stack, Box } from '@mantine/core';
import { useAppStore } from '../store/appStore';
import { reservationService } from '../services/reservationService';
import { userService } from '../services/userService';
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

const AGREEMENT_STATUSES = [
  ReservationStatus.CONFIRMED,
  ReservationStatus.ACTIVE,
  ReservationStatus.COMPLETED,
] as string[];

const CANCELLABLE_STATUSES = [
  ReservationStatus.PENDING_PAYMENT,
  ReservationStatus.CONFIRMED,
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
  const { currentUser, setCurrentUser, showNotify } = useAppStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('active');
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

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

  const confirmDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await userService.deleteAccount();
      setCurrentUser(null);
      showNotify('Your account has been deleted.', 'success');
      navigate('/');
    } catch {
      showNotify('Could not delete your account. Cancel active reservations first.', 'error');
    } finally {
      setDeletingAccount(false);
      setDeleteAccountOpen(false);
    }
  };

  const downloadAgreement = async (reservation: Reservation) => {
    setDownloadingId(reservation.id);
    try {
      const blob = await reservationService.downloadAgreement(reservation.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rental-agreement-${reservation.id}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      showNotify('Could not download the rental agreement.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!currentUser) {
    return null;
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
                {AGREEMENT_STATUSES.includes(r.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={downloadingId === r.id}
                    onClick={() => downloadAgreement(r)}
                  >
                    Agreement
                  </Button>
                )}
                {isActive && CANCELLABLE_STATUSES.includes(r.status) && (
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

        <Paper p="lg" radius="lg" withBorder mt="xl">
          <Group justify="space-between" wrap="wrap">
            <Box>
              <Text fw={600}>Delete account</Text>
              <Text size="sm" c="dimmed">
                Permanently remove your account and reservation history. Not available with active bookings.
              </Text>
            </Box>
            <Button variant="danger" onClick={() => setDeleteAccountOpen(true)}>
              Delete my account
            </Button>
          </Group>
        </Paper>
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

      <Modal
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        title="Delete your account?"
        footer={
          <Group justify="flex-end">
            <Button variant="ghost" onClick={() => setDeleteAccountOpen(false)} disabled={deletingAccount}>
              Keep account
            </Button>
            <Button variant="danger" onClick={confirmDeleteAccount} loading={deletingAccount}>
              Yes, delete permanently
            </Button>
          </Group>
        }
      >
        <Text size="sm" c="dimmed">
          This will permanently delete your account and associated data. You must have no active reservations. This
          action cannot be undone.
        </Text>
      </Modal>
    </Box>
  );
};
