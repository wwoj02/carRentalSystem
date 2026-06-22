export const ReservationStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
} as const;

export type ReservationStatusType = typeof ReservationStatus[keyof typeof ReservationStatus];

export type Reservation = {
  id: number;
  user: { id: number; firstName: string; lastName: string; email: string };
  vehicle: { id: number; brand: string; model: string; year: number; type: string; pricePerDay: number; imageUrl?: string };
  startDate: string;
  endDate: string;
  totalPrice: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  drivingLicenceId?: string;
  insuranceType?: 'none' | 'regular' | 'premium';
  gpsIncluded: boolean;
  youngDriver: boolean;
  pickupNotes?: string;
  returnNotes?: string;
  damageNotes?: string;
  extraCharges?: number;
  status: ReservationStatusType;
};

export type ProcessPickupRequest = {
  pickupNotes?: string;
};

export type ProcessReturnRequest = {
  damageNotes?: string;
  extraCharges?: number;
};

export type UpdateReservationDatesRequest = {
  startDate: string;
  endDate: string;
};

export type CreateReservationRequest = {
  userId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  drivingLicenceId: string;
  insuranceType: 'none' | 'regular' | 'premium';
  gpsIncluded: boolean;
  youngDriver: boolean;
};
