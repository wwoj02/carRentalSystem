import api from './api';
import type { Payment, CreatePaymentRequest } from '../types/Payment';

export const paymentService = {
  async createPayment(request: CreatePaymentRequest): Promise<Payment> {
    const { data } = await api.post<Payment>('/payments', request);
    return data;
  },

  async getPayment(id: number): Promise<Payment> {
    const { data } = await api.get<Payment>(`/payments/${id}`);
    return data;
  },
};
