export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  type: string;
  driveType: string;
  pricePerDay: number;
  available: boolean;
  imageUrl?: string;
  description?: string;
}

export interface VehicleFilter {
  type?: string;
  brand?: string;
  model?: string;
  driveType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
