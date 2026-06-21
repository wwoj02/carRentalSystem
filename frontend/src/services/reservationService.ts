import api from './api';
import type { Reservation, CreateReservationRequest } from '../types/Reservation';

export const reservationService = {
  async createReservation(request: CreateReservationRequest): Promise<Reservation> {
    const { data } = await api.post<Reservation>('/reservations', request);
    return data;
  },

  async getAllReservations(): Promise<Reservation[]> {
    const { data } = await api.get<Reservation[]>('/reservations');
    return data;
  },

  async getUserReservations(userId: number): Promise<Reservation[]> {
    const { data } = await api.get<Reservation[]>(`/reservations/user/${userId}`);
    return data;
  },

  async cancelReservation(id: number): Promise<Reservation> {
    const { data } = await api.patch<Reservation>(`/reservations/${id}/cancel`);
    return data;
  },

  async downloadAgreement(id: number): Promise<Blob> {
    const { data } = await api.get<Blob>(`/reservations/${id}/agreement`, {
      responseType: 'blob',
    });
    return data;
  },
};
