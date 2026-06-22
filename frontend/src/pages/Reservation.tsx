import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Grid,
  Group,
  Radio,
  Checkbox,
  Divider,
  Alert,
  Box,
  ThemeIcon,
} from '@mantine/core';
import { useVehicle } from '../hooks/useVehicles';
import { useAppStore } from '../store/appStore';
import { reservationService } from '../services/reservationService';
import { paymentService } from '../services/paymentService';
import { Button, Input, Modal, Spinner } from '../components/common';
import { formatCurrency, calculateDays } from '../utils/dateUtils';

const INSURANCE = { none: 0, regular: 15, premium: 30 } as const;
const GPS_PER_DAY = 5;
const YOUNG_DRIVER_FEE = 25;

type Insurance = keyof typeof INSURANCE;
type Step = 'form' | 'awaiting-confirm' | 'done';

const todayPlus = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

// Dark wireframe-style block inside the lighter container.
const Block = ({ title, children }: { title: string; children: ReactNode }) => (
  <Paper radius="lg" p="lg" bg="dark.6" c="gray.0">
    <Title order={3} mb="md" c="white">
      {title}
    </Title>
    <Paper radius="md" p="md" bg="dark.5">
      {children}
    </Paper>
  </Paper>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <Group justify="space-between">
    <Text size="sm" c="gray.4" tt="capitalize">
      {label}
    </Text>
    <Text size="sm" c="gray.1">
      {value}
    </Text>
  </Group>
);

export const Reservation = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { currentUser, showNotify } = useAppStore();
  const { vehicle, loading, error } = useVehicle(Number(vehicleId));

  const [details, setDetails] = useState({
    name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
    email: currentUser?.email ?? '',
    phone: '',
    licence: '',
  });
  const [startDate, setStartDate] = useState(todayPlus(1));
  const [endDate, setEndDate] = useState(todayPlus(4));
  const [insurance, setInsurance] = useState<Insurance>('regular');
  const [gps, setGps] = useState(false);
  const [youngDriver, setYoungDriver] = useState(false);

  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const locked = step !== 'form';
  const days = useMemo(() => Math.max(0, calculateDays(startDate, endDate)), [startDate, endDate]);

  const resetPaymentFlow = () => {
    setStep('form');
    setTxId(null);
    setReservationId(null);
  };

  const breakdown = useMemo(() => {
    if (!vehicle) return null;
    const base = days * vehicle.pricePerDay;
    const ins = days * INSURANCE[insurance];
    const gpsCost = gps ? days * GPS_PER_DAY : 0;
    const young = youngDriver ? YOUNG_DRIVER_FEE : 0;
    return { base, ins, gpsCost, young, total: base + ins + gpsCost + young };
  }, [vehicle, days, insurance, gps, youngDriver]);

  const canSubmit =
    !!currentUser &&
    !!vehicle &&
    days > 0 &&
    !!details.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email) &&
    !!details.phone.trim() &&
    !!details.licence.trim();

  const handleCreateReservation = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !currentUser || !vehicle) {
      showNotify('Please complete all required fields.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const reservation = await reservationService.createReservation({
        userId: currentUser.id,
        vehicleId: vehicle.id,
        startDate,
        endDate,
        customerName: details.name,
        customerEmail: details.email,
        customerPhone: details.phone,
        drivingLicenceId: details.licence,
        insuranceType: insurance,
        gpsIncluded: gps,
        youngDriver,
      });
      setReservationId(reservation.id);
      // Immediately initialize the payment to obtain a providerTransactionId.
      const payment = await paymentService.initPayment(reservation.id);
      setTxId(payment.providerTransactionId);
      setStep('awaiting-confirm');
      showNotify('Reservation created. Please confirm your payment.', 'success');
    } catch {
      showNotify('Could not create the reservation. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!txId) return;
    setSubmitting(true);
    try {
      await paymentService.confirmPayment(txId);
      setStep('done');
      setSuccessOpen(true);
    } catch {
      showNotify('Payment confirmation failed.', 'error');
      resetPaymentFlow();
    } finally {
      setSubmitting(false);
    }
  };

  const handleFailPayment = async () => {
    if (!txId) return;
    setSubmitting(true);
    try {
      await paymentService.failPayment(txId);
      resetPaymentFlow();
      showNotify('Payment failed. You can adjust your booking and try again.', 'error');
    } catch {
      showNotify('Could not simulate payment failure.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner size="lg" label="Loading…" className="py-24" />;
  if (error || !vehicle)
    return (
      <Container size="sm" py={80} ta="center">
        <Text c="dimmed">{error || 'Vehicle not found.'}</Text>
        <Button mt="md" onClick={() => navigate('/')}>
          Back to catalog
        </Button>
      </Container>
    );

  if (!vehicle.available)
    return (
      <Container size="sm" py={80} ta="center">
        <Text c="dimmed">This vehicle is not available for reservation.</Text>
        <Button mt="md" onClick={() => navigate('/')}>
          Back to catalog
        </Button>
      </Container>
    );

  return (
    <Box bg="gray.1" style={{ minHeight: '100%' }}>
      <Container size="md" py="xl">
        <Title order={1}>Reserve</Title>
        <Text c="dimmed" mb="lg">
          {vehicle.brand} {vehicle.model} &bull; {formatCurrency(vehicle.pricePerDay)} / day
        </Text>

        {!currentUser && (
          <Alert color="yellow" mb="lg" title="Account required">
            <Group justify="space-between">
              <Text size="sm">You need an account to make a reservation.</Text>
              <Button size="sm" onClick={() => navigate('/auth')}>
                Register / Log in
              </Button>
            </Group>
          </Alert>
        )}

        <form onSubmit={handleCreateReservation}>
          <Stack gap="lg">
            {/* 1. Personal details */}
            <Block title="Personal details">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Input
                    label="Full name"
                    value={details.name}
                    onChange={(e) => setDetails({ ...details, name: e.currentTarget.value })}
                    disabled={locked}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Input
                    label="Email"
                    type="email"
                    value={details.email}
                    onChange={(e) => setDetails({ ...details, email: e.currentTarget.value })}
                    disabled={locked}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Input
                    label="Telephone"
                    value={details.phone}
                    onChange={(e) => setDetails({ ...details, phone: e.currentTarget.value })}
                    disabled={locked}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Input
                    label="Driving licence ID"
                    value={details.licence}
                    onChange={(e) => setDetails({ ...details, licence: e.currentTarget.value })}
                    disabled={locked}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Input
                    label="Pick-up date"
                    type="date"
                    value={startDate}
                    min={todayPlus(0)}
                    onChange={(e) => setStartDate(e.currentTarget.value)}
                    disabled={locked}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Input
                    label="Return date"
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.currentTarget.value)}
                    disabled={locked}
                  />
                </Grid.Col>
              </Grid>
              {days <= 0 && (
                <Text size="xs" c="red.4" mt="xs">
                  Return date must be after the pick-up date.
                </Text>
              )}
            </Block>

            {/* 2. Insurance & add-ons */}
            <Block title="Insurance & add-ons">
              <Stack gap="md">
                <Radio.Group
                  label="Insurance"
                  value={insurance}
                  onChange={(v) => setInsurance(v as Insurance)}
                  styles={{ label: { color: 'var(--mantine-color-gray-2)' } }}
                >
                  <Group mt="xs">
                    {(['none', 'regular', 'premium'] as Insurance[]).map((opt) => (
                      <Radio
                        key={opt}
                        value={opt}
                        disabled={locked}
                        label={
                          <Text size="sm" c="gray.1" tt="capitalize">
                            {opt}
                            {INSURANCE[opt] > 0 && ` (+${formatCurrency(INSURANCE[opt])}/day)`}
                          </Text>
                        }
                      />
                    ))}
                  </Group>
                </Radio.Group>
                <Checkbox
                  checked={gps}
                  onChange={(e) => setGps(e.currentTarget.checked)}
                  disabled={locked}
                  label={
                    <Text size="sm" c="gray.1">
                      GPS navigation (+{formatCurrency(GPS_PER_DAY)}/day)
                    </Text>
                  }
                />
                <Checkbox
                  checked={youngDriver}
                  onChange={(e) => setYoungDriver(e.currentTarget.checked)}
                  disabled={locked}
                  label={
                    <Text size="sm" c="gray.1">
                      Young driver fee (+{formatCurrency(YOUNG_DRIVER_FEE)})
                    </Text>
                  }
                />
              </Stack>
            </Block>

            {/* 3. Summary */}
            <Block title="Summary">
              {breakdown && (
                <Stack gap="xs">
                  <Row
                    label={`${vehicle.brand} ${vehicle.model} — ${days} day(s) × ${formatCurrency(vehicle.pricePerDay)}`}
                    value={formatCurrency(breakdown.base)}
                  />
                  {breakdown.ins > 0 && <Row label={`${insurance} insurance`} value={formatCurrency(breakdown.ins)} />}
                  {breakdown.gpsCost > 0 && <Row label="GPS navigation" value={formatCurrency(breakdown.gpsCost)} />}
                  {breakdown.young > 0 && <Row label="Young driver fee" value={formatCurrency(breakdown.young)} />}
                  <Divider color="dark.3" my={4} />
                  <Group justify="space-between">
                    <Text fw={700} c="white">
                      Total
                    </Text>
                    <Text fw={700} c="white">
                      {formatCurrency(breakdown.total)}
                    </Text>
                  </Group>
                </Stack>
              )}
            </Block>

            {/* 4. Payment */}
            <Block title="Payment">
              {step === 'form' ? (
                <Stack gap="md">
                  <Text size="sm" c="gray.4">
                    Confirm your booking to initialize a secure payment. You'll review and confirm the charge in the next step.
                  </Text>
                  <Button type="submit" size="lg" loading={submitting} disabled={!canSubmit}>
                    Reserve &amp; proceed to payment
                  </Button>
                </Stack>
              ) : (
                <Stack gap="md">
                  <Paper bg="dark.7" p="md" radius="md">
                    <Text size="sm" c="gray.4">
                      Reservation <Text span c="white" ff="monospace">#{reservationId}</Text> created.
                    </Text>
                    <Text size="sm" c="gray.4" mt={4}>
                      Transaction: <Text span c="white" ff="monospace">{txId}</Text>
                    </Text>
                  </Paper>
                  <Group>
                    <Button type="button" size="lg" loading={submitting} onClick={handleConfirmPayment}>
                      Confirm Payment
                    </Button>
                    <Button type="button" variant="danger" size="lg" disabled={submitting} onClick={handleFailPayment}>
                      Simulate failure
                    </Button>
                  </Group>
                </Stack>
              )}
            </Block>
          </Stack>
        </form>
      </Container>

      <Modal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          navigate('/dashboard');
        }}
        size="sm"
      >
        <Stack align="center" gap="md" py="sm" ta="center">
          <ThemeIcon color="green" radius="xl" size={64} variant="light">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </ThemeIcon>
          <Title order={3}>Payment successful!</Title>
          <Text size="sm" c="dimmed">
            Your booking is confirmed. Redirecting you to your dashboard.
          </Text>
          <Button
            fullWidth
            onClick={() => {
              setSuccessOpen(false);
              navigate('/dashboard');
            }}
          >
            Go to dashboard
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
};
