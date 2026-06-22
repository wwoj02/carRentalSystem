package com.carrental.backend.report;

import com.carrental.backend.reservation.ReservationRepository;
import com.carrental.backend.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReservationRepository reservationRepository;
    private final VehicleRepository vehicleRepository;

    public ReportSummaryResponse getSummary(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from and to dates are required");
        }
        if (!to.isAfter(from) && !to.isEqual(from)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "to must be on or after from");
        }

        double totalRevenue = reservationRepository.sumCompletedRevenueInRange(from, to);
        long reservationCount = reservationRepository.countReservationsInRange(from, to);
        long completedCount = reservationRepository.countCompletedInRange(from, to);

        long totalVehicles = vehicleRepository.count();
        double fleetUtilizationPercent = 0.0;
        if (totalVehicles > 0) {
            long utilizedVehicles = reservationRepository.countUtilizedVehiclesInRange(from, to);
            fleetUtilizationPercent = (utilizedVehicles * 100.0) / totalVehicles;
        }

        return new ReportSummaryResponse(
                totalRevenue,
                reservationCount,
                completedCount,
                fleetUtilizationPercent
        );
    }
}
