export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

// Mirrors the backend PaymentResponse DTO.
export type PaymentResponse = {
  paymentId: number;
  reservationId: number;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  paymentUrl?: string;
  providerTransactionId: string;
};
