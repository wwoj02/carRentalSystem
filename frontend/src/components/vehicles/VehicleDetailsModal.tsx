import { Stack, Group, Text, Title, Badge, Image, Box, Divider } from '@mantine/core';
import { Modal, Spinner, Button } from '../common';
import { useVehicle } from '../../hooks/useVehicles';
import type { Vehicle } from '../../types/Vehicle';

interface VehicleDetailsModalProps {
  vehicleId: number | null;
  onClose: () => void;
  onReserve: (vehicle: Vehicle) => void;
}

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. This vehicle blends comfort and performance for both city commutes and long road trips. Enjoy a smooth ride, modern safety features, and reliable handling on every journey.';

export const VehicleDetailsModal = ({ vehicleId, onClose, onReserve }: VehicleDetailsModalProps) => {
  // Fetches GET /api/vehicles/{id} whenever a vehicle id is selected.
  const { vehicle, loading, error } = useVehicle(vehicleId ?? 0);
  const open = vehicleId !== null;

  return (
    <Modal open={open} onClose={onClose} size="lg">
      {loading || (!vehicle && !error) ? (
        <Spinner size="lg" label="Loading vehicle…" className="py-10" />
      ) : error ? (
        <Text ta="center" c="red" py="xl">
          {error}
        </Text>
      ) : vehicle ? (
        <Stack gap="md">
          <Box>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              {vehicle.type} &bull; {vehicle.driveType}
            </Text>
            <Title order={2}>
              {vehicle.brand} {vehicle.model}
            </Title>
          </Box>

          {vehicle.imageUrl && (
            <Image src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} radius="md" h={260} />
          )}

          {/* horizontal row of small pill-shaped tags */}
          <Group gap="xs">
            <Badge color="gray" variant="light" radius="xl">{vehicle.year}</Badge>
            <Badge color="gray" variant="light" radius="xl">{vehicle.type}</Badge>
            <Badge color="gray" variant="light" radius="xl">{vehicle.driveType}</Badge>
          </Group>

          <Text size="sm" c="dimmed">
            {vehicle.description || LOREM}
          </Text>

          <Divider />

          {/* bottom section: price on left, reserve now on right */}
          <Group justify="space-between" align="center">
            <Group gap={6} align="baseline">
              <Text size="sm" c="dimmed">
                price per day:
              </Text>
              <Text size="xl" fw={700}>
                $ {vehicle.pricePerDay}
              </Text>
            </Group>
            <Button
              variant="pill"
              size="lg"
              onClick={() => onReserve(vehicle)}
              disabled={!vehicle.available}
            >
              reserve now
            </Button>
          </Group>
        </Stack>
      ) : null}
    </Modal>
  );
};
