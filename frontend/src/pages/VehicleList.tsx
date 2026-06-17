import React, { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { VehicleFilterForm } from '../components/forms/VehicleFilterForm';
import { Card, CardBody, Spinner, Badge, Button } from '../components/common/index';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/dateUtils';
import type { VehicleFilter } from '../types/Vehicle';

export const VehicleList: React.FC = () => {
  const [filters, setFilters] = useState<VehicleFilter>({});
  const { vehicles, loading, error } = useVehicles(filters);

  const handleFilterChange = (newFilters: VehicleFilter) => {
    setFilters(newFilters);
  };

  if (error && !loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-8 rounded-2xl flex items-center gap-4">
          <div className="text-3xl">⚠️</div>
          <div>
            <h2 className="font-bold text-lg">Error Loading Vehicles</h2>
            <p className="text-rose-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Explore Our Fleet</h1>
          <p className="text-slate-500 text-lg">Find the perfect match for your next trip from our premium collection.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <VehicleFilterForm onFilterChange={handleFilterChange} />
            </div>
          </aside>

          {/* Vehicles Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Spinner size="lg" />
                <p className="text-slate-400 font-medium animate-pulse">Searching for best deals...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <Card className="border-dashed border-2 bg-transparent">
                <CardBody className="text-center py-20">
                  <div className="text-5xl mb-6">🔍</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No vehicles found</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">We couldn't find any vehicle matching your current filters. Try adjusting your search.</p>
                  <Button 
                    variant="secondary" 
                    className="mt-8"
                    onClick={() => handleFilterChange({})}
                  >
                    Clear All Filters
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                {vehicles.map((vehicle) => (
                  <Link key={vehicle.id} to={`/vehicles/${vehicle.id}`} className="group">
                    <Card className="h-full overflow-hidden flex flex-col border-none shadow-md hover:shadow-2xl transition-all duration-500">
                      {/* Image Container */}
                      <div className="relative h-64 overflow-hidden bg-slate-100">
                        {vehicle.imageUrl ? (
                          <img
                            src={vehicle.imageUrl}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                           <Badge 
                            label={vehicle.available ? 'Available Now' : 'Reserved'} 
                            variant={vehicle.available ? 'success' : 'danger'}
                            className="shadow-sm backdrop-blur-md bg-white/90"
                          />
                        </div>
                      </div>

                      <CardBody className="flex-1 p-6 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">{vehicle.type}</p>
                            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{vehicle.brand} {vehicle.model}</h3>
                          </div>
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">
                            {vehicle.year}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 my-4 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                             <span>⚙️</span>
                             <span>{vehicle.driveType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span>⛽</span>
                             <span>Petrol/Hybrid</span>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 flex justify-between items-center">
                          <div>
                            <span className="text-3xl font-black text-slate-900">{formatCurrency(vehicle.pricePerDay)}</span>
                            <span className="text-slate-400 text-sm ml-1">/ day</span>
                          </div>
                          <Button size="sm" className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                            View Details
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
