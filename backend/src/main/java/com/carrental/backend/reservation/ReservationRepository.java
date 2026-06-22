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
    AND r.status IN :blockingStatuses
    AND r.startDate < :endDate
    AND r.endDate > :startDate
    """)
    boolean existsOverlappingReservation(
            Integer vehicleId,
            LocalDate startDate,
            LocalDate endDate,
            List<ReservationStatus> blockingStatuses
    );

    @Query("""
    SELECT COALESCE(SUM(r.totalPrice), 0)
    FROM Reservation r
    WHERE r.status = 'COMPLETED'
    AND r.startDate < :to
    AND r.endDate > :from
    """)
    double sumCompletedRevenueInRange(LocalDate from, LocalDate to);

    @Query("""
    SELECT COUNT(r)
    FROM Reservation r
    WHERE r.startDate < :to
    AND r.endDate > :from
    AND r.status NOT IN ('CANCELLED', 'PAYMENT_FAILED')
    """)
    long countReservationsInRange(LocalDate from, LocalDate to);

    @Query("""
    SELECT COUNT(r)
    FROM Reservation r
    WHERE r.status = 'COMPLETED'
    AND r.startDate < :to
    AND r.endDate > :from
    """)
    long countCompletedInRange(LocalDate from, LocalDate to);

    @Query("""
    SELECT COUNT(DISTINCT r.vehicle.id)
    FROM Reservation r
    WHERE r.status IN ('COMPLETED', 'ACTIVE')
    AND r.startDate < :to
    AND r.endDate > :from
    """)
    long countUtilizedVehiclesInRange(LocalDate from, LocalDate to);
}