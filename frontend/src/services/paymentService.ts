import api from './api';
import type { PaymentResponse } from '../types/Payment';

export const paymentService = {
  // Initialize a payment for a reservation -> returns providerTransactionId.
  async initPayment(reservationId: number): Promise<PaymentResponse> {
    const { data } = await api.post<PaymentResponse>(`/reservations/${reservationId}/payment`);
    return data;
  },

  // Simulate a successful payment.
  async confirmPayment(providerTransactionId: string): Promise<PaymentResponse> {
    const { data } = await api.post<PaymentResponse>(`/payments/${providerTransactionId}/confirm`);
    return data;
  },

  // Simulate a failed payment.
  async failPayment(providerTransactionId: string): Promise<PaymentResponse> {
    const { data } = await api.post<PaymentResponse>(`/payments/${providerTransactionId}/fail`);
    return data;
  },
};
