import { Card, Image, Text, Badge, Group, Box, Stack } from '@mantine/core';
import type { Vehicle } from '../../types/Vehicle';
import { Button } from '../common';

interface VehicleCardProps {
  vehicle: Vehicle;
  onDetails: (vehicle: Vehicle) => void;
  onReserve: (vehicle: Vehicle) => void;
}

export const VehicleCard = ({ vehicle, onDetails, onReserve }: VehicleCardProps) => (
  <Card shadow="sm" radius="lg" withBorder padding="md" h="100%">
    <Card.Section>
      <Box pos="relative">
        <Image
          src={vehicle.imageUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          h={180}
          fallbackSrc="https://placehold.co/400x300?text=No+Image"
        />
        {/* price tag badge, top-right corner */}
        <Badge
          color="dark"
          size="lg"
          radius="xl"
          style={{ position: 'absolute', top: 12, right: 12 }}
        >
          $ {vehicle.pricePerDay}
        </Badge>
        {!vehicle.available && (
          <Badge color="red" radius="xl" style={{ position: 'absolute', top: 12, left: 12 }}>
            Unavailable
          </Badge>
        )}
      </Box>
    </Card.Section>

    <Stack gap="sm" mt="md" h="100%" justify="space-between">
      <Box>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          {vehicle.type} &bull; {vehicle.driveType}
        </Text>
        <Text size="lg" fw={700}>
          {vehicle.brand} {vehicle.model}
        </Text>
      </Box>

      {/* pill-shaped action buttons */}
      <Group grow gap="xs">
        <Button variant="outline" size="sm" radius="xl" onClick={() => onDetails(vehicle)}>
          details
        </Button>
        <Button variant="pill" size="sm" disabled={!vehicle.available} onClick={() => onReserve(vehicle)}>
          reserve
        </Button>
      </Group>
    </Stack>
  </Card>
);
