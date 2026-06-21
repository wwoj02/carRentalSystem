import api from './api';
import type { Vehicle, VehicleFilter } from '../types/Vehicle';

export const vehicleService = {
  async getVehicles(filters?: VehicleFilter): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.model) params.append('model', filters.model);
    if (filters?.driveType) params.append('driveType', filters.driveType);
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortDirection) params.append('sortDirection', filters.sortDirection);

    const { data } = await api.get<Vehicle[]>('/vehicles', { params });
    return data;
  },

  async getVehicle(id: number): Promise<Vehicle> {
    const { data } = await api.get<Vehicle>(`/vehicles/${id}`);
    return data;
  },

  async createVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const { data } = await api.post<Vehicle>('/vehicles', vehicle);
    return data;
  },

  async updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const { data } = await api.put<Vehicle>(`/vehicles/${id}`, vehicle);
    return data;
  },

  async deleteVehicle(id: number): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },
};
