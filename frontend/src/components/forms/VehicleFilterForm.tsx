import React, { useState } from 'react';
import { Input, Select, Card, CardBody } from '../common/index';
import { Button } from '../common/Button';
import type { VehicleFilter } from '../../types/Vehicle';

interface VehicleFilterProps {
  onFilterChange: (filters: Partial<VehicleFilter>) => void;
}

export const VehicleFilterForm: React.FC<VehicleFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    type: '',
    brand: '',
    model: '',
    driveType: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'id',
    sortDirection: 'asc',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '')
    );
    onFilterChange(cleanedFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      type: '',
      brand: '',
      model: '',
      driveType: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'id',
      sortDirection: 'asc',
    };
    setFilters(resetFilters);
    onFilterChange({});
  };

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardBody className="p-7">
        <div className="flex items-center gap-2 mb-6 text-slate-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <h3 className="text-xl font-bold">Filters</h3>
        </div>

        <div className="space-y-5">
          <Input
            label="Car Type"
            name="type"
            placeholder="e.g. SUV, Sedan"
            value={filters.type}
            onChange={handleChange}
          />
          <Input
            label="Brand"
            name="brand"
            placeholder="e.g. BMW, Tesla"
            value={filters.brand}
            onChange={handleChange}
          />
          
          <div className="grid grid-cols-2 gap-3">
             <Input
                label="Min Price"
                name="minPrice"
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={handleChange}
              />
              <Input
                label="Max Price"
                name="maxPrice"
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={handleChange}
              />
          </div>

          <Select
            label="Sort By"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
            options={[
              { value: 'id', label: 'Default' },
              { value: 'brand', label: 'Brand Name' },
              { value: 'pricePerDay', label: 'Price' },
              { value: 'year', label: 'Manufacturing Year' },
            ]}
          />

          <div className="pt-4 space-y-3">
            <Button onClick={handleApply} fullWidth className="h-12">
              Apply Filters
            </Button>
            <Button onClick={handleReset} variant="secondary" fullWidth className="h-12">
              Reset
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
