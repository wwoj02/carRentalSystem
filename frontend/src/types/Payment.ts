export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

export type Payment = {
  id: number;
  reservation: { id: number };
  amount: number;
  currency: string;
  status: PaymentStatusType;
  providerTransactionId?: string;
  paymentUrl?: string;
  createdAt: string;
  paidAt?: string;
};

export type CreatePaymentRequest = {
  reservationId: number;
  amount: number;
  currency: string;
};
