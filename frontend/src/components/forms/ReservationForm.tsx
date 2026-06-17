import React, { useState, useMemo } from 'react';
import { Input, Button } from '../common/index';
import type { CreateReservationRequest } from '../../types/Reservation';
import { calculateDays, calculateTotalPrice, formatCurrency } from '../../utils/dateUtils';

interface ReservationFormProps {
  vehicleId: number;
  pricePerDay: number;
  vehicleBrand: string;
  vehicleModel: string;
  onSubmit: (data: CreateReservationRequest) => Promise<void>;
  loading?: boolean;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  vehicleId,
  pricePerDay,
  vehicleBrand,
  vehicleModel,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    userId: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { days, totalPrice } = useMemo(() => {
    if (formData.startDate && formData.endDate) {
      try {
        const dayCount = calculateDays(formData.startDate, formData.endDate);
        if (dayCount > 0) {
          return {
            days: dayCount,
            totalPrice: calculateTotalPrice(pricePerDay, formData.startDate, formData.endDate),
          };
        }
      } catch (error) {
        console.error('Error calculating days:', error);
      }
    }
    return { days: 0, totalPrice: 0 };
  }, [formData.startDate, formData.endDate, pricePerDay]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.userId) {
      newErrors.userId = 'User ID is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        userId: parseInt(formData.userId, 10),
        vehicleId,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold">Reserve {vehicleBrand} {vehicleModel}</h3>

      <Input
        label="User ID"
        name="userId"
        type="number"
        value={formData.userId}
        onChange={handleChange}
        error={errors.userId}
        placeholder="Enter your user ID"
      />

      <Input
        label="Start Date"
        name="startDate"
        type="date"
        value={formData.startDate}
        onChange={handleChange}
        error={errors.startDate}
      />

      <Input
        label="End Date"
        name="endDate"
        type="date"
        value={formData.endDate}
        onChange={handleChange}
        error={errors.endDate}
      />

      {days > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Duration:</span>
            <span className="font-bold">{days} days</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Price per day:</span>
            <span className="font-bold">{formatCurrency(pricePerDay)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-bold">Total:</span>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      )}

      <Button type="submit" fullWidth loading={loading}>
        Reserve Now
      </Button>
    </form>
  );
};
