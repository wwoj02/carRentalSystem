import { useState, useEffect } from 'react';
import type { Reservation, CreateReservationRequest } from '../types/Reservation';
import { reservationService } from '../services/reservationService';

export const useReservations = (userId?: number) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = userId
          ? await reservationService.getUserReservations(userId)
          : await reservationService.getAllReservations();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reservations');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [userId]);

  const createReservation = async (request: CreateReservationRequest): Promise<Reservation> => {
    return reservationService.createReservation(request);
  };

  const cancelReservation = async (id: number): Promise<void> => {
    await reservationService.cancelReservation(id);
    setReservations(reservations.filter((r) => r.id !== id));
  };

  return { reservations, loading, error, createReservation, cancelReservation };
};
