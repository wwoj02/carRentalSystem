import api from './api';
import type { Payment } from '../types/Payment';

export type PaymentResponse = {
  paymentId: number;
  reservationId: number;
  amount: number;
  currency: string;
  status: string;
  paymentUrl: string;
  providerTransactionId: string;
};

export const paymentService = {
  async createPayment(reservationId: number): Promise<PaymentResponse> {
    const { data } = await api.post<PaymentResponse>(`/reservations/${reservationId}/payment`);
    return data;
  },

  async confirmPayment(providerTransactionId: string): Promise<PaymentResponse> {
    const { data } = await api.post<PaymentResponse>(`/payments/${providerTransactionId}/confirm`);
    return data;
  },

  async failPayment(providerTransactionId: string): Promise<PaymentResponse> {
    const { data } = await api.post<PaymentResponse>(`/payments/${providerTransactionId}/fail`);
    return data;
  },

  toPayment(response: PaymentResponse): Payment {
    return {
      id: response.paymentId,
      reservation: { id: response.reservationId },
      amount: response.amount,
      currency: response.currency,
      status: response.status === 'PAID' ? 'COMPLETED' : response.status as Payment['status'],
      providerTransactionId: response.providerTransactionId,
      paymentUrl: response.paymentUrl,
      createdAt: new Date().toISOString(),
    };
  },
};
