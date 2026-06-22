import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Title, Box, Paper, Text } from '@mantine/core';
import { useVehicles } from '../hooks/useVehicles';
import { useAppStore } from '../store/appStore';
import type { Vehicle } from '../types/Vehicle';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleDetailsModal } from '../components/vehicles/VehicleDetailsModal';
import { FilterSidebar } from '../components/vehicles/FilterSidebar';
import type { CatalogFilters, CatalogSort } from '../components/vehicles/FilterSidebar';
import { Spinner } from '../components/common';

const uniqueSorted = (values: string[]) => [...new Set(values.filter(Boolean))].sort();

const sortVehicles = (list: Vehicle[], sort: CatalogSort): Vehicle[] => {
  const sorted = [...list];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
    case 'price-desc':
      return sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
    case 'year-asc':
      return sorted.sort((a, b) => a.year - b.year);
    case 'year-desc':
      return sorted.sort((a, b) => b.year - a.year);
    case 'brand-asc':
      return sorted.sort((a, b) => a.brand.localeCompare(b.brand));
    default:
      return sorted;
  }
};

export const Home = () => {
  const navigate = useNavigate();
  const setSelectedVehicle = useAppStore((s) => s.setSelectedVehicle);
  // No filters passed -> plain GET /api/vehicles. All filtering happens client-side.
  const { vehicles, loading, error } = useVehicles();
  const [detailsId, setDetailsId] = useState<number | null>(null);

  const availableVehicles = useMemo(() => vehicles.filter((v) => v.available), [vehicles]);

  const priceBounds = useMemo(() => {
    if (availableVehicles.length === 0) return { min: 0, max: 1000 };
    const prices = availableVehicles.map((v) => v.pricePerDay);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [availableVehicles]);

  const options = useMemo(
    () => ({
      types: uniqueSorted(availableVehicles.map((v) => v.type)),
      brands: uniqueSorted(availableVehicles.map((v) => v.brand)),
      models: uniqueSorted(availableVehicles.map((v) => v.model)),
      driveTypes: uniqueSorted(availableVehicles.map((v) => v.driveType)),
    }),
    [availableVehicles],
  );

  const defaultFilters = (): CatalogFilters => ({
    search: '',
    types: [],
    brands: [],
    models: [],
    driveTypes: [],
    maxPrice: priceBounds.max,
    sort: 'price-asc',
  });

  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters());

  useEffect(() => {
    if (availableVehicles.length > 0) {
      setFilters((prev) => ({ ...prev, maxPrice: priceBounds.max }));
    }
  }, [priceBounds.max, availableVehicles.length]);

  const effectiveMaxPrice = filters.maxPrice || priceBounds.max;

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return availableVehicles.filter((v) => {
      if (q && !`${v.brand} ${v.model}`.toLowerCase().includes(q)) return false;
      if (filters.types.length && !filters.types.includes(v.type)) return false;
      if (filters.brands.length && !filters.brands.includes(v.brand)) return false;
      if (filters.models.length && !filters.models.includes(v.model)) return false;
      if (filters.driveTypes.length && !filters.driveTypes.includes(v.driveType)) return false;
      if (v.pricePerDay > effectiveMaxPrice) return false;
      return true;
    });
  }, [availableVehicles, filters, effectiveMaxPrice]);

  const sorted = useMemo(
    () => sortVehicles(filtered, filters.sort),
    [filtered, filters.sort],
  );

  const handleReserve = (vehicle: Vehicle) => {
    if (!vehicle.available) return;
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
            ) : sorted.length === 0 ? (
              <Paper p="xl" radius="lg" shadow="sm" ta="center">
                <Text c="dimmed">No vehicles match your filters.</Text>
              </Paper>
            ) : (
              <Grid gap="md">
                {sorted.map((v) => (
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
