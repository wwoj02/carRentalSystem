import { useState, useEffect } from 'react';
import type { Vehicle, VehicleFilter } from '../types/Vehicle';
import { vehicleService } from '../services/vehicleService';

export const useVehicles = (filters?: VehicleFilter) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await vehicleService.getVehicles(filters);
        setVehicles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [filters?.type, filters?.brand, filters?.model, filters?.driveType, filters?.minPrice, filters?.maxPrice, filters?.sortBy, filters?.sortDirection]);

  return { vehicles, loading, error };
};

export const useVehicle = (id: number) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await vehicleService.getVehicle(id);
        setVehicle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vehicle');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  return { vehicle, loading, error };
};
