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
  Checkbox,
} from '@mantine/core';
import { reservationService } from '../services/reservationService';
import { vehicleService } from '../services/vehicleService';
import type { Reservation, ReservationStatusType } from '../types/Reservation';
import type { Vehicle } from '../types/Vehicle';
import { ReservationStatus } from '../types/Reservation';
import { Button, Badge, Modal, Spinner, Input } from '../components/common';
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

type Tab = 'open' | 'all' | 'fleet';

type VehicleForm = Omit<Vehicle, 'id'>;

const emptyVehicleForm: VehicleForm = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  type: '',
  driveType: '',
  pricePerDay: 0,
  available: true,
  imageUrl: '',
  description: '',
};

export const StaffPanel = () => {
  const { currentUser, showNotify } = useAppStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [returnTarget, setReturnTarget] = useState<Reservation | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [tab, setTab] = useState<Tab>('open');
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>(emptyVehicleForm);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState<number | null>(null);

  useEffect(() => {
    if (currentUser?.role !== 'EMPLOYEE' && currentUser?.role !== 'ADMIN') {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [reservationData, vehicleData] = await Promise.all([
          reservationService.getAllReservations(),
          vehicleService.getVehicles(),
        ]);
        if (active) {
          setReservations(reservationData);
          setVehicles(vehicleData);
        }
      } catch {
        if (active) showNotify('Failed to load staff data.', 'error');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [currentUser?.role, showNotify]);

  const visibleReservations = useMemo(() => {
    if (tab === 'all') return reservations;
    if (tab === 'fleet') return [];
    return reservations.filter((reservation) =>
      [ReservationStatus.CONFIRMED, ReservationStatus.ACTIVE].includes(
        reservation.status as Extract<ReservationStatusType, 'CONFIRMED' | 'ACTIVE'>,
      ),
    );
  }, [reservations, tab]);

  if (currentUser?.role !== 'EMPLOYEE' && currentUser?.role !== 'ADMIN') {
    return (
      <Container size="xs" py={80} ta="center">
        <Title order={1}>Staff access required</Title>
        <Text c="dimmed" mt="xs">
          Log in with an employee account to use this panel.
        </Text>
      </Container>
    );
  }

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

  const openCreateVehicle = () => {
    setEditingVehicleId(null);
    setVehicleForm(emptyVehicleForm);
    setVehicleModalOpen(true);
  };

  const openEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      driveType: vehicle.driveType,
      pricePerDay: vehicle.pricePerDay,
      available: vehicle.available,
      imageUrl: vehicle.imageUrl ?? '',
      description: vehicle.description ?? '',
    });
    setVehicleModalOpen(true);
  };

  const saveVehicle = async () => {
    if (!vehicleForm.brand.trim() || !vehicleForm.model.trim() || !vehicleForm.type.trim()) {
      showNotify('Brand, model and type are required.', 'error');
      return;
    }

    setSavingVehicle(true);
    try {
      const payload = {
        ...vehicleForm,
        brand: vehicleForm.brand.trim(),
        model: vehicleForm.model.trim(),
        type: vehicleForm.type.trim(),
        driveType: vehicleForm.driveType.trim(),
        imageUrl: vehicleForm.imageUrl?.trim(),
        description: vehicleForm.description?.trim(),
      };
      const saved = editingVehicleId
        ? await vehicleService.updateVehicle(editingVehicleId, payload)
        : await vehicleService.createVehicle(payload);

      setVehicles((prev) =>
        editingVehicleId
          ? prev.map((vehicle) => (vehicle.id === saved.id ? saved : vehicle))
          : [...prev, saved],
      );
      showNotify(editingVehicleId ? 'Vehicle updated.' : 'Vehicle added.', 'success');
      setVehicleModalOpen(false);
    } catch {
      showNotify('Could not save vehicle.', 'error');
    } finally {
      setSavingVehicle(false);
    }
  };

  const deleteVehicle = async (vehicle: Vehicle) => {
    if (!window.confirm(`Delete ${vehicle.brand} ${vehicle.model}?`)) return;
    setDeletingVehicleId(vehicle.id);
    try {
      await vehicleService.deleteVehicle(vehicle.id);
      setVehicles((prev) => prev.filter((item) => item.id !== vehicle.id));
      showNotify('Vehicle deleted.', 'success');
    } catch {
      showNotify('Could not delete vehicle.', 'error');
    } finally {
      setDeletingVehicleId(null);
    }
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

  const vehicleRows = vehicles.map((vehicle) => (
    <Table.Tr key={vehicle.id}>
      <Table.Td>
        <Text size="sm" fw={700}>
          {vehicle.brand} {vehicle.model}
        </Text>
        <Text size="xs" c="dimmed">
          #{vehicle.id} · {vehicle.year}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{vehicle.type}</Text>
        <Text size="xs" c="dimmed">
          {vehicle.driveType || '-'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600}>
          {formatCurrency(vehicle.pricePerDay)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={vehicle.available ? 'green' : 'red'}>
          {vehicle.available ? 'Available' : 'Unavailable'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          <Button size="sm" variant="outline" onClick={() => openEditVehicle(vehicle)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            loading={deletingVehicleId === vehicle.id}
            onClick={() => deleteVehicle(vehicle)}
          >
            Delete
          </Button>
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
              Process rentals and manage the fleet.
            </Text>
          </Box>
          {tab === 'fleet' && (
            <Button onClick={openCreateVehicle}>
              Add vehicle
            </Button>
          )}
        </Group>

        <Tabs value={tab} onChange={(value) => setTab((value as Tab) ?? 'open')} color="dark">
          <Tabs.List mb="md">
            <Tabs.Tab value="open">To process</Tabs.Tab>
            <Tabs.Tab value="all">All reservations</Tabs.Tab>
            <Tabs.Tab value="fleet">Fleet</Tabs.Tab>
          </Tabs.List>

          <Paper radius="lg" shadow="sm" withBorder>
            {loading ? (
              <Spinner size="lg" label="Loading staff data..." className="py-24" />
            ) : tab === 'fleet' ? (
              vehicles.length === 0 ? (
                <Stack align="center" py="xl">
                  <Text c="dimmed">No vehicles to show.</Text>
                </Stack>
              ) : (
                <Table.ScrollContainer minWidth={900}>
                  <Table verticalSpacing="md">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Vehicle</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Price / day</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{vehicleRows}</Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )
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
        open={vehicleModalOpen}
        onClose={() => setVehicleModalOpen(false)}
        title={editingVehicleId ? 'Edit vehicle' : 'Add vehicle'}
        size="lg"
        footer={
          <Group justify="flex-end">
            <Button variant="ghost" onClick={() => setVehicleModalOpen(false)} disabled={savingVehicle}>
              Cancel
            </Button>
            <Button onClick={saveVehicle} loading={savingVehicle}>
              Save vehicle
            </Button>
          </Group>
        }
      >
        <Stack gap="md">
          <Group grow align="flex-start">
            <Input
              label="Brand"
              value={vehicleForm.brand}
              onChange={(event) => setVehicleForm({ ...vehicleForm, brand: event.currentTarget.value })}
            />
            <Input
              label="Model"
              value={vehicleForm.model}
              onChange={(event) => setVehicleForm({ ...vehicleForm, model: event.currentTarget.value })}
            />
          </Group>
          <Group grow align="flex-start">
            <Input
              label="Year"
              type="number"
              value={vehicleForm.year}
              onChange={(event) => setVehicleForm({ ...vehicleForm, year: Number(event.currentTarget.value) })}
            />
            <Input
              label="Price per day"
              type="number"
              value={vehicleForm.pricePerDay}
              onChange={(event) => setVehicleForm({ ...vehicleForm, pricePerDay: Number(event.currentTarget.value) })}
            />
          </Group>
          <Group grow align="flex-start">
            <Input
              label="Type"
              value={vehicleForm.type}
              onChange={(event) => setVehicleForm({ ...vehicleForm, type: event.currentTarget.value })}
            />
            <Input
              label="Drive type"
              value={vehicleForm.driveType}
              onChange={(event) => setVehicleForm({ ...vehicleForm, driveType: event.currentTarget.value })}
            />
          </Group>
          <Input
            label="Image URL"
            value={vehicleForm.imageUrl}
            onChange={(event) => setVehicleForm({ ...vehicleForm, imageUrl: event.currentTarget.value })}
          />
          <Textarea
            label="Description"
            minRows={3}
            value={vehicleForm.description}
            onChange={(event) => setVehicleForm({ ...vehicleForm, description: event.currentTarget.value })}
          />
          <Checkbox
            label="Available"
            checked={vehicleForm.available}
            onChange={(event) => setVehicleForm({ ...vehicleForm, available: event.currentTarget.checked })}
          />
        </Stack>
      </Modal>

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
