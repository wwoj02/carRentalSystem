import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehicle } from '../hooks/useVehicles';
import { useReservations } from '../hooks/useReservations';
import { Card, CardBody, CardHeader, LoadingPage, Badge } from '../components/common/index';
import { ReservationForm } from '../components/forms/ReservationForm';
import { Button } from '../components/common/Button';
import { useAppStore } from '../store/appStore';
import { formatCurrency } from '../utils/dateUtils';
import { getApiErrorMessage } from '../services/api';
import type { CreateReservationRequest } from '../types/Reservation';

export const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicle, loading, error } = useVehicle(parseInt(id || '0', 10));
  const { createReservation } = useReservations();
  const { currentUser, showNotify } = useAppStore();
  const [isReserving, setIsReserving] = useState(false);

  const handleReserve = async (data: Pick<CreateReservationRequest, 'startDate' | 'endDate'>) => {
    if (!currentUser) {
      showNotify('Please login first', 'error');
      navigate('/login');
      return;
    }

    setIsReserving(true);
    try {
      await createReservation({
        userId: currentUser.id,
        vehicleId: parseInt(id || '0', 10),
        startDate: data.startDate,
        endDate: data.endDate,
      });
      showNotify('Reservation created successfully!', 'success');
      navigate('/bookings');
    } catch (error) {
      showNotify(getApiErrorMessage(error, 'Failed to create reservation'), 'error');
    } finally {
      setIsReserving(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-800 p-6 rounded-lg">
          <h2 className="font-bold mb-2">Error</h2>
          <p>{error || 'Vehicle not found'}</p>
        </div>
        <Button className="mt-4" onClick={() => navigate('/vehicles')}>
          Back to Vehicles
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={() => navigate('/vehicles')} variant="secondary" className="mb-6">
        ← Back to Vehicles
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            {vehicle.imageUrl && (
              <img
                src={vehicle.imageUrl}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
            )}
            <CardHeader
              title={`${vehicle.brand} ${vehicle.model}`}
              subtitle={`Year: ${vehicle.year} | Type: ${vehicle.type}`}
            />
            <CardBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-gray-600">Drive Type</h4>
                    <p className="text-lg">{vehicle.driveType}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-600">Availability</h4>
                    <div className="mt-1">
                      <Badge
                        label={vehicle.available ? 'Available' : 'Unavailable'}
                        variant={vehicle.available ? 'success' : 'danger'}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-600 mb-2">Description</h4>
                  <p className="text-gray-700">{vehicle.description || 'No description available'}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-600 mb-2">Pricing</h4>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(vehicle.pricePerDay)}</p>
                  <p className="text-gray-600">per day</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader title="Make a Reservation" />
            {vehicle.available ? (
              <CardBody>
                <ReservationForm
                  pricePerDay={vehicle.pricePerDay}
                  vehicleBrand={vehicle.brand}
                  vehicleModel={vehicle.model}
                  onSubmit={handleReserve}
                  loading={isReserving}
                />
              </CardBody>
            ) : (
              <CardBody>
                <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
                  <p>This vehicle is currently unavailable for reservation.</p>
                </div>
              </CardBody>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
