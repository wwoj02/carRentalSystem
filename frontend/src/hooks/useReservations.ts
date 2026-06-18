import { useState, useEffect, useCallback } from 'react';
import type { Reservation, CreateReservationRequest } from '../types/Reservation';
import { reservationService } from '../services/reservationService';
import { getApiErrorMessage } from '../services/api';

export const useReservations = (userId?: number) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = userId
        ? await reservationService.getUserReservations(userId)
        : await reservationService.getAllReservations();
      setReservations(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch reservations'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const createReservation = async (request: CreateReservationRequest): Promise<Reservation> => {
    return reservationService.createReservation(request);
  };

  const cancelReservation = async (id: number): Promise<void> => {
    const updated = await reservationService.cancelReservation(id);
    setReservations((current) =>
      current.map((reservation) => (reservation.id === id ? updated : reservation))
    );
  };

  return { reservations, loading, error, createReservation, cancelReservation, refetch: fetchReservations };
};
