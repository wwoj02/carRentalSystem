import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Grid,
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
import { userService } from '../services/userService';
import { reportService, type ReportSummary } from '../services/reportService';
import type { Reservation, ReservationStatusType } from '../types/Reservation';
import type { Vehicle } from '../types/Vehicle';
import type { User } from '../types/User';
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

type Tab = 'open' | 'all' | 'fleet' | 'customers' | 'reports';

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
  const [pickupTarget, setPickupTarget] = useState<Reservation | null>(null);
  const [pickupNotes, setPickupNotes] = useState('');
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [damageNotes, setDamageNotes] = useState('');
  const [extraCharges, setExtraCharges] = useState(0);
  const [tab, setTab] = useState<Tab>('open');
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
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

  useEffect(() => {
    if (tab !== 'customers' || (currentUser?.role !== 'EMPLOYEE' && currentUser?.role !== 'ADMIN')) return;
    let active = true;
    (async () => {
      setUsersLoading(true);
      try {
        const data = await userService.getUsers();
        if (active) setUsers(data);
      } catch {
        if (active) showNotify('Failed to load customers.', 'error');
      } finally {
        if (active) setUsersLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [tab, currentUser?.role, showNotify]);

  const visibleReservations = useMemo(() => {
    if (tab === 'all') return reservations;
    if (tab === 'fleet' || tab === 'customers' || tab === 'reports') return [];
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

  const openPickupModal = (reservation: Reservation) => {
    setPickupTarget(reservation);
    setPickupNotes('');
  };

  const handlePickup = async () => {
    if (!pickupTarget) return;
    setActionId(pickupTarget.id);
    try {
      const updated = await reservationService.processPickup(pickupTarget.id, {
        pickupNotes: pickupNotes.trim() || undefined,
      });
      updateReservation(updated);
      showNotify('Vehicle pickup processed.', 'success');
      setPickupTarget(null);
      setPickupNotes('');
    } catch {
      showNotify('Could not process pickup.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleStaffCancel = async () => {
    if (!cancelTarget) return;
    setActionId(cancelTarget.id);
    try {
      const updated = await reservationService.staffCancelReservation(cancelTarget.id);
      updateReservation(updated);
      showNotify('Reservation cancelled.', 'success');
      setCancelTarget(null);
    } catch {
      showNotify('Could not cancel reservation.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleReturn = async () => {
    if (!returnTarget) return;
    setActionId(returnTarget.id);
    try {
      const updated = await reservationService.processReturn(returnTarget.id, {
        damageNotes: damageNotes.trim() || undefined,
        extraCharges: extraCharges > 0 ? extraCharges : undefined,
      });
      updateReservation(updated);
      showNotify('Vehicle return processed.', 'success');
      setReturnTarget(null);
      setDamageNotes('');
      setExtraCharges(0);
    } catch {
      showNotify('Could not process return.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const openReturnModal = (reservation: Reservation) => {
    setReturnTarget(reservation);
    setDamageNotes(reservation.damageNotes ?? reservation.returnNotes ?? '');
    setExtraCharges(reservation.extraCharges ?? 0);
  };

  const loadReport = async () => {
    if (!reportFrom || !reportTo) {
      showNotify('Select both start and end dates.', 'error');
      return;
    }
    setReportLoading(true);
    try {
      const summary = await reportService.getSummary(reportFrom, reportTo);
      setReportSummary(summary);
    } catch {
      showNotify('Failed to load report.', 'error');
    } finally {
      setReportLoading(false);
    }
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

  const customerRows = users.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td>
        <Text size="sm" fw={600}>
          {user.firstName} {user.lastName}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{user.email}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={user.role === 'CUSTOMER' ? 'blue' : 'dark'}>{user.role}</Badge>
      </Table.Td>
    </Table.Tr>
  ));

  const reportCards = reportSummary && (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Paper p="md" radius="lg" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Total revenue
          </Text>
          <Text size="xl" fw={700} mt={4}>
            {formatCurrency(reportSummary.totalRevenue)}
          </Text>
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Paper p="md" radius="lg" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Reservations
          </Text>
          <Text size="xl" fw={700} mt={4}>
            {reportSummary.reservationCount}
          </Text>
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Paper p="md" radius="lg" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Completed
          </Text>
          <Text size="xl" fw={700} mt={4}>
            {reportSummary.completedCount}
          </Text>
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Paper p="md" radius="lg" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            Fleet utilization
          </Text>
          <Text size="xl" fw={700} mt={4}>
            {reportSummary.fleetUtilizationPercent.toFixed(1)}%
          </Text>
        </Paper>
      </Grid.Col>
    </Grid>
  );

  const cancellableStatuses = [ReservationStatus.CONFIRMED, ReservationStatus.PENDING_PAYMENT] as string[];

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
              onClick={() => openPickupModal(reservation)}
            >
              Pickup
            </Button>
          )}
          {cancellableStatuses.includes(reservation.status) && (
            <Button
              size="sm"
              variant="danger"
              loading={actionId === reservation.id}
              onClick={() => setCancelTarget(reservation)}
            >
              Cancel
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
            <Tabs.Tab value="customers">Customers</Tabs.Tab>
            <Tabs.Tab value="reports">Reports</Tabs.Tab>
          </Tabs.List>

          <Paper radius="lg" shadow="sm" withBorder>
            {tab === 'customers' ? (
              usersLoading ? (
                <Spinner size="lg" label="Loading customers..." className="py-24" />
              ) : users.length === 0 ? (
                <Stack align="center" py="xl">
                  <Text c="dimmed">No customers to show.</Text>
                </Stack>
              ) : (
                <Table.ScrollContainer minWidth={600}>
                  <Table verticalSpacing="md">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Role</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{customerRows}</Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )
            ) : tab === 'reports' ? (
              <Stack p="lg" gap="lg">
                <Group align="flex-end" wrap="wrap">
                  <Input
                    label="From"
                    type="date"
                    value={reportFrom}
                    onChange={(event) => setReportFrom(event.currentTarget.value)}
                  />
                  <Input
                    label="To"
                    type="date"
                    value={reportTo}
                    onChange={(event) => setReportTo(event.currentTarget.value)}
                  />
                  <Button onClick={loadReport} loading={reportLoading}>
                    Generate report
                  </Button>
                </Group>
                {reportSummary ? (
                  reportCards
                ) : (
                  <Text c="dimmed" size="sm">
                    Select a date range and generate a report.
                  </Text>
                )}
              </Stack>
            ) : loading ? (
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
        open={pickupTarget !== null}
        onClose={() => setPickupTarget(null)}
        title="Verify pickup"
        size="lg"
        footer={
          <Group justify="flex-end">
            <Button variant="ghost" onClick={() => setPickupTarget(null)} disabled={actionId !== null}>
              Cancel
            </Button>
            <Button onClick={handlePickup} loading={pickupTarget ? actionId === pickupTarget.id : false}>
              Confirm pickup
            </Button>
          </Group>
        }
      >
        {pickupTarget && (
          <Stack gap="sm">
            <Text size="sm">
              <Text span fw={600}>
                Reservation ID:
              </Text>{' '}
              #{pickupTarget.id}
            </Text>
            <Text size="sm">
              <Text span fw={600}>
                Customer:
              </Text>{' '}
              {pickupTarget.customerName || `${pickupTarget.user.firstName} ${pickupTarget.user.lastName}`}
            </Text>
            <Text size="sm">
              <Text span fw={600}>
                Email:
              </Text>{' '}
              {pickupTarget.customerEmail || pickupTarget.user.email}
            </Text>
            <Text size="sm">
              <Text span fw={600}>
                Phone:
              </Text>{' '}
              {pickupTarget.customerPhone || '—'}
            </Text>
            <Text size="sm">
              <Text span fw={600}>
                Driving licence:
              </Text>{' '}
              {pickupTarget.drivingLicenceId || '—'}
            </Text>
            <Text size="sm">
              <Text span fw={600}>
                Vehicle:
              </Text>{' '}
              {pickupTarget.vehicle.brand} {pickupTarget.vehicle.model} ({pickupTarget.vehicle.year})
            </Text>
            <Text size="sm">
              <Text span fw={600}>
                Dates:
              </Text>{' '}
              {formatDate(pickupTarget.startDate)} – {formatDate(pickupTarget.endDate)}
            </Text>
            <Text size="sm">
              <Text span fw={600}>
                Total price:
              </Text>{' '}
              {formatCurrency(pickupTarget.totalPrice)}
            </Text>
            <Textarea
              label="Pickup notes (optional)"
              minRows={3}
              placeholder="Condition at handover, fuel level, etc."
              value={pickupNotes}
              onChange={(event) => setPickupNotes(event.currentTarget.value)}
            />
          </Stack>
        )}
      </Modal>

      <Modal
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Cancel reservation?"
        footer={
          <Group justify="flex-end">
            <Button variant="ghost" onClick={() => setCancelTarget(null)} disabled={actionId !== null}>
              Keep reservation
            </Button>
            <Button
              variant="danger"
              onClick={handleStaffCancel}
              loading={cancelTarget ? actionId === cancelTarget.id : false}
            >
              Yes, cancel
            </Button>
          </Group>
        }
      >
        {cancelTarget && (
          <Text size="sm" c="dimmed">
            Cancel reservation #{cancelTarget.id} for{' '}
            <Text span fw={600} c="dark">
              {cancelTarget.vehicle.brand} {cancelTarget.vehicle.model}
            </Text>{' '}
            ({formatDate(cancelTarget.startDate)} – {formatDate(cancelTarget.endDate)})? This cannot be undone.
          </Text>
        )}
      </Modal>

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
            label="Damage notes"
            minRows={4}
            placeholder="No damage"
            value={damageNotes}
            onChange={(event) => setDamageNotes(event.currentTarget.value)}
          />
          <Input
            label="Extra charges"
            type="number"
            min={0}
            step={0.01}
            value={extraCharges}
            onChange={(event) => setExtraCharges(Number(event.currentTarget.value) || 0)}
          />
        </Stack>
      </Modal>
    </Box>
  );
};
