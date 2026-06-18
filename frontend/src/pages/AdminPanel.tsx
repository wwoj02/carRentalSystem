import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Spinner, Badge, Button, Input } from '../components/common/index';
import { useVehicles } from '../hooks/useVehicles';
import { useReservations } from '../hooks/useReservations';
import { vehicleService } from '../services/vehicleService';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '../services/api';
import { useAppStore } from '../store/appStore';
import { formatDate, formatCurrency } from '../utils/dateUtils';
import { RESERVATION_STATUS_LABELS } from '../utils/constants';
import type { Vehicle } from '../types/Vehicle';
import type { User } from '../types/User';
import { Modal } from '../components/common/Modal';

export const AdminPanel: React.FC = () => {
  const { currentUser } = useAppStore();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { reservations, loading: reservationsLoading } = useReservations();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState<Partial<Vehicle>>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: '',
    driveType: '',
    pricePerDay: 0,
    available: true,
    description: '',
  });

  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const data = await userService.getUsers();
        setAllUsers(data);
      } catch (error) {
        console.error('Error loading users:', getApiErrorMessage(error, 'Failed to load users'));
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleSaveVehicle = async () => {
    try {
      if (editingVehicle && editingVehicle.id) {
        await vehicleService.updateVehicle(editingVehicle.id, vehicleForm);
      } else {
        await vehicleService.createVehicle(vehicleForm as Vehicle);
      }
      setShowVehicleModal(false);
      setEditingVehicle(null);
      setVehicleForm({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        type: '',
        driveType: '',
        pricePerDay: 0,
        available: true,
        description: '',
      });
      // Reload vehicles
      window.location.reload();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.deleteVehicle(id);
        window.location.reload();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm(vehicle);
    setShowVehicleModal(true);
  };

  const handleNewVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      type: '',
      driveType: '',
      pricePerDay: 0,
      available: true,
      description: '',
    });
    setShowVehicleModal(true);
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-600 text-lg">Please login to access the admin panel</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-600 text-lg">Admin access required</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-blue-600">{vehicles.length}</div>
            <p className="text-gray-600">Total Vehicles</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-green-600">{allUsers.length}</div>
            <p className="text-gray-600">Total Users</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-3xl font-bold text-purple-600">{reservations.length}</div>
            <p className="text-gray-600">Total Reservations</p>
          </CardBody>
        </Card>
      </div>

      {/* Vehicles Section */}
      <Card className="mb-8">
        <CardHeader title="Vehicles Management" />
        <CardBody>
          <Button className="mb-4" onClick={handleNewVehicle}>
            + Add New Vehicle
          </Button>

          {vehiclesLoading ? (
            <Spinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Brand</th>
                    <th className="px-4 py-2 text-left">Model</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Price/Day</th>
                    <th className="px-4 py-2 text-left">Available</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{vehicle.brand}</td>
                      <td className="px-4 py-3">{vehicle.model}</td>
                      <td className="px-4 py-3">{vehicle.type}</td>
                      <td className="px-4 py-3">{formatCurrency(vehicle.pricePerDay)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          label={vehicle.available ? 'Yes' : 'No'}
                          variant={vehicle.available ? 'success' : 'danger'}
                        />
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => handleEditVehicle(vehicle)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteVehicle(vehicle.id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Users Section */}
      <Card className="mb-8">
        <CardHeader title="Users" />
        <CardBody>
          {usersLoading ? (
            <Spinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">First Name</th>
                    <th className="px-4 py-2 text-left">Last Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{user.firstName}</td>
                      <td className="px-4 py-3">{user.lastName}</td>
                      <td className="px-4 py-3">{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Reservations Section */}
      <Card>
        <CardHeader title="Recent Reservations" />
        <CardBody>
          {reservationsLoading ? (
            <Spinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">User</th>
                    <th className="px-4 py-2 text-left">Vehicle</th>
                    <th className="px-4 py-2 text-left">Start Date</th>
                    <th className="px-4 py-2 text-left">End Date</th>
                    <th className="px-4 py-2 text-left">Total Price</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.slice(0, 10).map((reservation) => (
                    <tr key={reservation.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {reservation.user.firstName} {reservation.user.lastName}
                      </td>
                      <td className="px-4 py-3">
                        {reservation.vehicle.brand} {reservation.vehicle.model}
                      </td>
                      <td className="px-4 py-3">{formatDate(reservation.startDate)}</td>
                      <td className="px-4 py-3">{formatDate(reservation.endDate)}</td>
                      <td className="px-4 py-3">{formatCurrency(reservation.totalPrice)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          label={RESERVATION_STATUS_LABELS[reservation.status] || reservation.status}
                          variant="info"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Vehicle Modal */}
      <Modal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowVehicleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVehicle}>
              {editingVehicle ? 'Update' : 'Create'}
            </Button>
          </>
        }
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Brand"
            value={vehicleForm.brand || ''}
            onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
          />
          <Input
            label="Model"
            value={vehicleForm.model || ''}
            onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
          />
          <Input
            label="Year"
            type="number"
            value={vehicleForm.year || ''}
            onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value, 10) })}
          />
          <Input
            label="Type"
            value={vehicleForm.type || ''}
            onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
          />
          <Input
            label="Drive Type"
            value={vehicleForm.driveType || ''}
            onChange={(e) => setVehicleForm({ ...vehicleForm, driveType: e.target.value })}
          />
          <Input
            label="Price Per Day"
            type="number"
            step="0.01"
            value={vehicleForm.pricePerDay || ''}
            onChange={(e) => setVehicleForm({ ...vehicleForm, pricePerDay: parseFloat(e.target.value) })}
          />
          <Input
            label="Description"
            value={vehicleForm.description || ''}
            onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={vehicleForm.available || false}
              onChange={(e) => setVehicleForm({ ...vehicleForm, available: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="available" className="text-sm font-medium">
              Available for Rental
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};
