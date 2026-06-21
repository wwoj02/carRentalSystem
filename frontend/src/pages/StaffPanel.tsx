import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Group,
  Paper,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { reservationService } from '../services/reservationService';
import type { Reservation, ReservationStatusType } from '../types/Reservation';
import { ReservationStatus } from '../types/Reservation';
import { Button, Badge, Modal, Spinner } from '../components/common';
import { formatCurrency, formatDate } from '../utils/dateUtils';
import { RESERVATION_STATUS_LABELS } from '../utils/constants';
import { useAppStore } from '../store/appStore';

const STATUS_COLOR: Record<string, string> = {
  PENDING_PAYMENT: 'yellow',
  CONFIRMED: 'blue',
  ACTIVE: 'green',
  COMPLETED: 'gray',
  CANCELLED: 'red',
  PAYMENT_FAILED: 'red',
};

type Tab = 'open' | 'all';

export const StaffPanel = () => {
  const { showNotify } = useAppStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [returnTarget, setReturnTarget] = useState<Reservation | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [tab, setTab] = useState<Tab>('open');

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await reservationService.getAllReservations();
        if (active) setReservations(data);
      } catch {
        if (active) showNotify('Failed to load reservations.', 'error');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [showNotify]);

  const visibleReservations = useMemo(() => {
    if (tab === 'all') return reservations;
    return reservations.filter((reservation) =>
      [ReservationStatus.CONFIRMED, ReservationStatus.ACTIVE].includes(
        reservation.status as Extract<ReservationStatusType, 'CONFIRMED' | 'ACTIVE'>,
      ),
    );
  }, [reservations, tab]);

  const updateReservation = (updated: Reservation) => {
    setReservations((prev) => prev.map((reservation) => (reservation.id === updated.id ? updated : reservation)));
  };

  const handlePickup = async (reservation: Reservation) => {
    setActionId(reservation.id);
    try {
      const updated = await reservationService.processPickup(reservation.id);
      updateReservation(updated);
      showNotify('Vehicle pickup processed.', 'success');
    } catch {
      showNotify('Could not process pickup.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleReturn = async () => {
    if (!returnTarget) return;
    setActionId(returnTarget.id);
    try {
      const updated = await reservationService.processReturn(returnTarget.id, returnNotes);
      updateReservation(updated);
      showNotify('Vehicle return processed.', 'success');
      setReturnTarget(null);
      setReturnNotes('');
    } catch {
      showNotify('Could not process return.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const openReturnModal = (reservation: Reservation) => {
    setReturnTarget(reservation);
    setReturnNotes(reservation.returnNotes ?? '');
  };

  const rows = visibleReservations.map((reservation) => (
    <Table.Tr key={reservation.id}>
      <Table.Td>
        <Text size="sm" fw={700}>
          #{reservation.id}
        </Text>
        <Text size="xs" c="dimmed">
          {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {reservation.customerName || `${reservation.user.firstName} ${reservation.user.lastName}`}
        </Text>
        <Text size="xs" c="dimmed">
          {reservation.customerPhone || reservation.customerEmail || reservation.user.email}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {reservation.vehicle.brand} {reservation.vehicle.model}
        </Text>
        <Text size="xs" c="dimmed">
          {reservation.vehicle.type}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={STATUS_COLOR[reservation.status] ?? 'gray'}>
          {RESERVATION_STATUS_LABELS[reservation.status] ?? reservation.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600}>
          {formatCurrency(reservation.totalPrice)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          {reservation.status === ReservationStatus.CONFIRMED && (
            <Button
              size="sm"
              loading={actionId === reservation.id}
              onClick={() => handlePickup(reservation)}
            >
              Pickup
            </Button>
          )}
          {reservation.status === ReservationStatus.ACTIVE && (
            <Button
              size="sm"
              variant="outline"
              loading={actionId === reservation.id}
              onClick={() => openReturnModal(reservation)}
            >
              Return
            </Button>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box bg="gray.1" style={{ minHeight: '100%' }}>
      <Container size="xl" py="xl">
        <Group justify="space-between" mb="lg">
          <Box>
            <Title order={1}>Staff panel</Title>
            <Text size="sm" c="dimmed">
              Process vehicle pickup and return.
            </Text>
          </Box>
        </Group>

        <Tabs value={tab} onChange={(value) => setTab((value as Tab) ?? 'open')} color="dark">
          <Tabs.List mb="md">
            <Tabs.Tab value="open">To process</Tabs.Tab>
            <Tabs.Tab value="all">All reservations</Tabs.Tab>
          </Tabs.List>

          <Paper radius="lg" shadow="sm" withBorder>
            {loading ? (
              <Spinner size="lg" label="Loading reservations..." className="py-24" />
            ) : visibleReservations.length === 0 ? (
              <Stack align="center" py="xl">
                <Text c="dimmed">No reservations to show.</Text>
              </Stack>
            ) : (
              <Table.ScrollContainer minWidth={900}>
                <Table verticalSpacing="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Reservation</Table.Th>
                      <Table.Th>Customer</Table.Th>
                      <Table.Th>Vehicle</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Total</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Tabs>
      </Container>

      <Modal
        open={returnTarget !== null}
        onClose={() => setReturnTarget(null)}
        title="Process vehicle return"
        footer={
          <Group justify="flex-end">
            <Button variant="ghost" onClick={() => setReturnTarget(null)} disabled={actionId !== null}>
              Cancel
            </Button>
            <Button onClick={handleReturn} loading={returnTarget ? actionId === returnTarget.id : false}>
              Complete return
            </Button>
          </Group>
        }
      >
        <Stack>
          {returnTarget && (
            <Text size="sm" c="dimmed">
              {returnTarget.vehicle.brand} {returnTarget.vehicle.model} for{' '}
              {returnTarget.customerName || `${returnTarget.user.firstName} ${returnTarget.user.lastName}`}
            </Text>
          )}
          <Textarea
            label="Return notes"
            minRows={4}
            placeholder="No damage"
            value={returnNotes}
            onChange={(event) => setReturnNotes(event.currentTarget.value)}
          />
        </Stack>
      </Modal>
    </Box>
  );
};
