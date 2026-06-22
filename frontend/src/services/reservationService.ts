import api from './api';
import type {
  Reservation,
  CreateReservationRequest,
  ProcessPickupRequest,
  ProcessReturnRequest,
  UpdateReservationDatesRequest,
} from '../types/Reservation';

export const reservationService = {
  async createReservation(request: CreateReservationRequest): Promise<Reservation> {
    const { data } = await api.post<Reservation>('/reservations', request);
    return data;
  },

  async getAllReservations(): Promise<Reservation[]> {
    const { data } = await api.get<Reservation[]>('/reservations');
    return data;
  },

  async updateReservation(id: number, request: UpdateReservationDatesRequest): Promise<Reservation> {
    const { data } = await api.patch<Reservation>(`/reservations/${id}`, request);
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

  async processPickup(id: number, payload?: ProcessPickupRequest): Promise<Reservation> {
    const { data } = await api.patch<Reservation>(`/reservations/${id}/pickup`, payload ?? {});
    return data;
  },

  async staffCancelReservation(id: number): Promise<Reservation> {
    const { data } = await api.patch<Reservation>(`/reservations/${id}/staff-cancel`);
    return data;
  },

  async processReturn(id: number, payload: ProcessReturnRequest): Promise<Reservation> {
    const { data } = await api.patch<Reservation>(`/reservations/${id}/return`, payload);
    return data;
  },

  async downloadAgreement(id: number): Promise<Blob> {
    const { data } = await api.get<Blob>(`/reservations/${id}/agreement`, {
      responseType: 'blob',
    });
    return data;
  },
};
