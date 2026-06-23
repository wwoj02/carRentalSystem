import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Title, Box, Paper, Text, Group, Stack, Image, SimpleGrid, ThemeIcon, Tabs } from '@mantine/core';
import { useVehicles } from '../hooks/useVehicles';
import { useAppStore } from '../store/appStore';
import type { Vehicle } from '../types/Vehicle';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleDetailsModal } from '../components/vehicles/VehicleDetailsModal';
import { FilterSidebar } from '../components/vehicles/FilterSidebar';
import type { CatalogFilters, CatalogSort } from '../components/vehicles/FilterSidebar';
import { Button, Spinner } from '../components/common';
import { formatCurrency } from '../utils/dateUtils';
import heroImage from '../assets/hero.png';

const uniqueSorted = (values: string[]) => [...new Set(values.filter(Boolean))].sort();

const FAQ_TABS = [
  {
    value: 'booking',
    label: 'Booking',
    items: [
      {
        question: 'Do I need an account to reserve a car?',
        answer: 'Yes. You can browse the fleet without logging in, but reservations require a customer account.',
      },
      {
        question: 'Can I choose extra options?',
        answer: 'During reservation you can add optional insurance and GPS before confirming the booking.',
      },
    ],
  },
  {
    value: 'payment',
    label: 'Payment',
    items: [
      {
        question: 'Is payment real?',
        answer: 'No. Payment is simulated for this project, so no real card or external payment provider is used.',
      },
      {
        question: 'What happens after payment confirmation?',
        answer: 'The reservation changes status and appears in your dashboard as an active booking flow.',
      },
    ],
  },
  {
    value: 'pickup',
    label: 'Pickup',
    items: [
      {
        question: 'Who handles pickup and return?',
        answer: 'Employees use the staff panel to process pickup, activate rentals, and complete returns.',
      },
      {
        question: 'Can return notes be added?',
        answer: 'Yes. The staff return flow supports damage notes and extra charges when needed.',
      },
    ],
  },
  {
    value: 'account',
    label: 'Account',
    items: [
      {
        question: 'Where can I see my reservations?',
        answer: 'After logging in, open Dashboard from the account menu to view active and historical reservations.',
      },
      {
        question: 'Can I cancel a reservation?',
        answer: 'Pending payment and confirmed reservations can be cancelled from the customer dashboard.',
      },
    ],
  },
];

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
  const currentUser = useAppStore((s) => s.currentUser);
  const setSelectedVehicle = useAppStore((s) => s.setSelectedVehicle);
  // No filters passed -> plain GET /api/vehicles. All filtering happens client-side.
  const { vehicles, loading, error } = useVehicles();
  const [detailsId, setDetailsId] = useState<number | null>(null);

  const availableVehicles = useMemo(() => vehicles.filter((v) => v.available), [vehicles]);
  const featuredVehicles = useMemo(
    () => sortVehicles(availableVehicles, 'price-asc').slice(0, 3),
    [availableVehicles],
  );

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

  const catalogStats = useMemo(() => {
    const brands = uniqueSorted(availableVehicles.map((v) => v.brand));
    const types = uniqueSorted(availableVehicles.map((v) => v.type));
    return [
      { label: 'available cars', value: availableVehicles.length.toString() },
      { label: 'brands', value: brands.length.toString() },
      {
        label: 'from per day',
        value: availableVehicles.length > 0 ? formatCurrency(priceBounds.min) : '—',
      },
      { label: 'vehicle classes', value: types.length.toString() },
    ];
  }, [availableVehicles, priceBounds.min]);

  const scrollToCatalog = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleReserve = (vehicle: Vehicle) => {
    if (!vehicle.available) return;
    setSelectedVehicle(vehicle);
    setDetailsId(null);
    navigate(`/reserve/${vehicle.id}`);
  };

  return (
    <Box bg="gray.1" style={{ minHeight: '100%' }}>
      <Box bg="white">
        <Container size="xl" py={{ base: 'xl', md: 56 }}>
          <Grid align="center" gap={{ base: 'xl', md: 56 }}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="lg">
                <Box>
                  <Text size="sm" fw={800} tt="uppercase" c="dimmed">
                    Rent-A-Car booking
                  </Text>
                  <Title order={1} mt="xs" style={{ fontSize: 'clamp(2.25rem, 4vw, 4.5rem)', lineHeight: 1 }}>
                    Choose a car and book it in minutes
                  </Title>
                </Box>

                <Text size="lg" c="dimmed" maw={560}>
                  Browse currently available vehicles, compare prices, open details, and continue straight to reservation when you find the right fit.
                </Text>

                <Group gap="sm">
                  <Button size="lg" variant="pill" onClick={scrollToCatalog}>
                    Browse cars
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate(currentUser ? '/dashboard' : '/auth')}>
                    {currentUser ? 'My dashboard' : 'Log in'}
                  </Button>
                </Group>

                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" maw={640}>
                  {catalogStats.map((stat) => (
                    <Paper key={stat.label} p="md" radius="md" withBorder bg="gray.0">
                      <Text fw={800} size="xl">
                        {stat.value}
                      </Text>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        {stat.label}
                      </Text>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box
                style={{
                  position: 'relative',
                  minHeight: 360,
                  display: 'grid',
                  alignItems: 'center',
                  justifyItems: 'center',
                  overflow: 'hidden',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #111827 0%, #374151 45%, #e5e7eb 45%, #f8fafc 100%)',
                }}
              >
                <Image
                  src={heroImage}
                  alt="Modern rental car"
                  fit="contain"
                  mah={360}
                  maw="85%"
                  style={{ filter: 'drop-shadow(0 28px 36px rgba(15, 23, 42, 0.35))' }}
                />
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {featuredVehicles.length > 0 && (
        <Container size="xl" pt="xl">
          <Group justify="space-between" mb="md" align="end">
            <Box>
              <Text size="sm" fw={800} tt="uppercase" c="dimmed">
                Quick picks
              </Text>
              <Title order={2}>Best prices available now</Title>
            </Box>
            <Button variant="ghost" onClick={scrollToCatalog}>
              View all
            </Button>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {featuredVehicles.map((vehicle) => (
              <Paper key={vehicle.id} p="md" radius="md" withBorder bg="white">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Group gap="md" wrap="nowrap">
                    <ThemeIcon color="gray" variant="light" radius="md" size={44}>
                      {vehicle.brand[0]}
                    </ThemeIcon>
                    <Box>
                      <Text fw={800}>
                        {vehicle.brand} {vehicle.model}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {vehicle.type} · {vehicle.driveType}
                      </Text>
                    </Box>
                  </Group>
                  <Text fw={800}>{formatCurrency(vehicle.pricePerDay)}</Text>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      )}

      <Container id="catalog" size="xl" py="xl">
        <Group justify="space-between" mb="lg" align="end">
          <Box>
            <Text size="sm" fw={800} tt="uppercase" c="dimmed">
              Fleet catalog
            </Text>
            <Title order={2}>Find your ride</Title>
          </Box>
          <Text size="sm" c="dimmed">
            Showing {sorted.length} of {availableVehicles.length} available vehicles
          </Text>
        </Group>

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

      <Box bg="white">
        <Container size="xl" py="xl">
          <Grid gap="xl" align="flex-start">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Text size="sm" fw={800} tt="uppercase" c="dimmed">
                Mini FAQ
              </Text>
              <Title order={2} mt="xs">
                Before you book
              </Title>
              <Text c="dimmed" mt="sm">
                Quick answers for the core customer flow: booking, payment, pickup, and account management.
              </Text>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper p="lg" radius="md" withBorder>
                <Tabs defaultValue="booking" color="dark" radius="xl">
                  <Tabs.List mb="lg">
                    {FAQ_TABS.map((tab) => (
                      <Tabs.Tab key={tab.value} value={tab.value}>
                        {tab.label}
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>

                  {FAQ_TABS.map((tab) => (
                    <Tabs.Panel key={tab.value} value={tab.value}>
                      <Stack gap="lg">
                        {tab.items.map((item) => (
                          <Box key={item.question}>
                            <Text fw={800}>{item.question}</Text>
                            <Text c="dimmed" mt={4}>
                              {item.answer}
                            </Text>
                          </Box>
                        ))}
                      </Stack>
                    </Tabs.Panel>
                  ))}
                </Tabs>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <VehicleDetailsModal vehicleId={detailsId} onClose={() => setDetailsId(null)} onReserve={handleReserve} />
    </Box>
  );
};
