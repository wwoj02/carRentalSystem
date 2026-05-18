package com.carrental.backend.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository
        extends JpaRepository<Vehicle, Integer> {
}
