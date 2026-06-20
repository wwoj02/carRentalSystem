import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Title, Box, Paper, Text } from '@mantine/core';
import { useVehicles } from '../hooks/useVehicles';
import { useAppStore } from '../store/appStore';
import type { Vehicle } from '../types/Vehicle';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleDetailsModal } from '../components/vehicles/VehicleDetailsModal';
import { FilterSidebar } from '../components/vehicles/FilterSidebar';
import type { CatalogFilters } from '../components/vehicles/FilterSidebar';
import { Spinner } from '../components/common';

const uniqueSorted = (values: string[]) => [...new Set(values.filter(Boolean))].sort();

export const Home = () => {
  const navigate = useNavigate();
  const setSelectedVehicle = useAppStore((s) => s.setSelectedVehicle);
  // No filters passed -> plain GET /api/vehicles. All filtering happens client-side.
  const { vehicles, loading, error } = useVehicles();
  const [detailsId, setDetailsId] = useState<number | null>(null);

  const priceBounds = useMemo(() => {
    if (vehicles.length === 0) return { min: 0, max: 1000 };
    const prices = vehicles.map((v) => v.pricePerDay);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [vehicles]);

  const options = useMemo(
    () => ({
      types: uniqueSorted(vehicles.map((v) => v.type)),
      brands: uniqueSorted(vehicles.map((v) => v.brand)),
      driveTypes: uniqueSorted(vehicles.map((v) => v.driveType)),
    }),
    [vehicles],
  );

  const defaultFilters = (): CatalogFilters => ({
    search: '',
    types: [],
    brands: [],
    driveTypes: [],
    maxPrice: priceBounds.max,
  });

  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters());
  const effectiveMaxPrice = filters.maxPrice || priceBounds.max;

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (q && !`${v.brand} ${v.model}`.toLowerCase().includes(q)) return false;
      if (filters.types.length && !filters.types.includes(v.type)) return false;
      if (filters.brands.length && !filters.brands.includes(v.brand)) return false;
      if (filters.driveTypes.length && !filters.driveTypes.includes(v.driveType)) return false;
      if (v.pricePerDay > effectiveMaxPrice) return false;
      return true;
    });
  }, [vehicles, filters, effectiveMaxPrice]);

  const handleReserve = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsId(null);
    navigate(`/reserve/${vehicle.id}`);
  };

  return (
    <Box bg="gray.1" style={{ minHeight: '100%' }}>
      <Container size="xl" py="xl">
        <Title order={1} mb="lg">
          Find your ride
        </Title>

        <Grid gap="lg">
          {/* narrower left sidebar */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <FilterSidebar
              filters={{ ...filters, maxPrice: effectiveMaxPrice }}
              onChange={setFilters}
              options={options}
              priceBounds={priceBounds}
              onReset={() => setFilters(defaultFilters())}
            />
          </Grid.Col>

          {/* wider vehicle grid */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            {loading ? (
              <Spinner size="lg" label="Loading vehicles…" className="py-24" />
            ) : error ? (
              <Paper p="xl" radius="lg" withBorder c="red" ta="center">
                {error}
              </Paper>
            ) : filtered.length === 0 ? (
              <Paper p="xl" radius="lg" shadow="sm" ta="center">
                <Text c="dimmed">No vehicles match your filters.</Text>
              </Paper>
            ) : (
              <Grid gap="md">
                {filtered.map((v) => (
                  <Grid.Col key={v.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <VehicleCard vehicle={v} onDetails={(veh) => setDetailsId(veh.id)} onReserve={handleReserve} />
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Grid.Col>
        </Grid>
      </Container>

      <VehicleDetailsModal vehicleId={detailsId} onClose={() => setDetailsId(null)} onReserve={handleReserve} />
    </Box>
  );
};
