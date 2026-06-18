import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useReservations } from '../hooks/useReservations';
import { Card, CardBody, Badge, Button, Spinner } from '../components/common/index';
import { formatDate, formatCurrency } from '../utils/dateUtils';
import { RESERVATION_STATUS_LABELS } from '../utils/constants';
import { getApiErrorMessage } from '../services/api';
import { paymentService } from '../services/paymentService';
import { Modal } from '../components/common/Modal';

export const BookingHistory: React.FC = () => {
  const { currentUser, showNotify } = useAppStore();
  const { reservations, loading, error, cancelReservation, refetch } = useReservations(currentUser?.id);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);

  const handleCancelClick = (id: number) => {
    setCancelingId(id);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (cancelingId) {
      try {
        await cancelReservation(cancelingId);
        setShowCancelModal(false);
        setCancelingId(null);
        showNotify('Reservation cancelled', 'success');
      } catch (error) {
        showNotify(getApiErrorMessage(error, 'Failed to cancel reservation'), 'error');
      }
    }
  };

  const handlePay = async (reservationId: number) => {
    setPayingId(reservationId);
    try {
      const payment = await paymentService.createPayment(reservationId);
      await paymentService.confirmPayment(payment.providerTransactionId);
      showNotify('Payment confirmed successfully', 'success');
      await refetch();
    } catch (error) {
      showNotify(getApiErrorMessage(error, 'Payment failed'), 'error');
    } finally {
      setPayingId(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-6 py-20 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-6">🔒</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-8 max-w-sm">Please sign in to your account to view and manage your booking history.</p>
        <Button to="/login" size="lg">Sign In Now</Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Bookings</h1>
            <p className="text-slate-500">Manage your current and past car rental reservations.</p>
          </div>
          <Button to="/vehicles" variant="secondary" size="md">
            Rent Another Car
          </Button>
        </header>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 p-6 rounded-2xl mb-8 flex items-center gap-3">
             <span>⚠️</span>
             <p className="font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-32">
            <Spinner size="lg" />
          </div>
        ) : reservations.length === 0 ? (
          <Card className="border-none bg-white shadow-xl py-20 text-center">
            <CardBody>
              <div className="text-5xl mb-6">🚗</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">You haven't made any reservations yet. Explore our fleet and find your perfect ride!</p>
              <Button to="/vehicles" className="mt-8">Browse Vehicles</Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="border-none shadow-md hover:shadow-xl transition-shadow overflow-hidden bg-white">
                <div className="flex flex-col lg:flex-row">
                  {/* Vehicle Mini-Hero */}
                  <div className="lg:w-64 h-48 lg:h-auto relative overflow-hidden bg-slate-100">
                    {reservation.vehicle.imageUrl ? (
                      <img
                        src={reservation.vehicle.imageUrl}
                        alt={reservation.vehicle.brand}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">🚗</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden"></div>
                    <div className="absolute bottom-4 left-4 lg:hidden">
                       <h3 className="text-white font-bold text-xl">{reservation.vehicle.brand} {reservation.vehicle.model}</h3>
                    </div>
                  </div>

                  <div className="flex-1 p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center">
                    <div className="hidden lg:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vehicle</p>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">
                        {reservation.vehicle.brand} {reservation.vehicle.model}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">{reservation.vehicle.year} • {reservation.vehicle.type}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                      <div className="flex items-center gap-3">
                         <div className="text-center">
                            <p className="text-sm font-bold text-slate-900">{formatDate(reservation.startDate)}</p>
                         </div>
                         <span className="text-slate-300">→</span>
                         <div className="text-center">
                            <p className="text-sm font-bold text-slate-900">{formatDate(reservation.endDate)}</p>
                         </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                      <p className="text-2xl font-black text-indigo-600">
                        {formatCurrency(reservation.totalPrice)}
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col lg:items-end justify-between md:justify-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 hidden md:block">Status</p>
                        <Badge
                          label={RESERVATION_STATUS_LABELS[reservation.status] || reservation.status}
                          variant={
                            reservation.status === 'COMPLETED'
                              ? 'success'
                              : reservation.status === 'CANCELLED' || reservation.status === 'PAYMENT_FAILED'
                              ? 'danger'
                              : 'warning'
                          }
                        />
                      </div>

                      {reservation.status === 'PENDING_PAYMENT' && (
                        <Button
                          size="sm"
                          onClick={() => handlePay(reservation.id)}
                          loading={payingId === reservation.id}
                          className="h-9 px-4 text-xs"
                        >
                          Pay Now
                        </Button>
                      )}

                      {['PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE'].includes(reservation.status) && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleCancelClick(reservation.id)}
                          className="h-9 px-4 text-xs"
                        >
                          Cancel Trip
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Reservation"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="secondary" onClick={() => setShowCancelModal(false)} className="flex-1">
              Keep Reservation
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel} className="flex-1">
              Cancel Trip
            </Button>
          </div>
        }
      >
        <div className="py-4">
           <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">⚠️</div>
           <p className="text-center text-slate-600 leading-relaxed">Are you sure you want to cancel this reservation? This action will release the vehicle and cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
};
