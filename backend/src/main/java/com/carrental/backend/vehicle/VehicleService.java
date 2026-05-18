package com.carrental.backend.vehicle;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicle(Integer id) {
        return vehicleRepository.findById(id)
                .orElseThrow();
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Integer id) {
        vehicleRepository.deleteById(id);
    }

    public Vehicle updateVehicle(Integer id, Vehicle updatedVehicle){
        Vehicle vehicle = vehicleRepository.findById(id).orElseThrow();

        vehicle.setBrand(updatedVehicle.getBrand());
        vehicle.setModel(updatedVehicle.getModel());
        vehicle.setYear(updatedVehicle.getYear());
        vehicle.setType(updatedVehicle.getType());
        vehicle.setDriveType(updatedVehicle.getDriveType());
        vehicle.setPricePerDay(updatedVehicle.getPricePerDay());
        vehicle.setAvailable(updatedVehicle.isAvailable());
        vehicle.setDescription(updatedVehicle.getDescription());
        vehicle.setImageUrl(updatedVehicle.getImageUrl());

        return vehicleRepository.save(vehicle);
    }
}