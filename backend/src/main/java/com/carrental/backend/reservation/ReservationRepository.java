package com.carrental.backend.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository
        extends JpaRepository<Reservation, Integer> {
    List<Reservation> findByUserId(Integer userId);

    @Query("""
        SELECT COUNT(r) > 0
        FROM Reservation r
        WHERE r.vehicle.id = :vehicleId
        AND r.status <> :excludedStatus
        AND r.startDate < :endDate
        AND r.endDate > :startDate
        """)
    boolean existsOverlappingReservation(
            Integer vehicleId,
            LocalDate startDate,
            LocalDate endDate,
            ReservationStatus excludedStatus
    );
}