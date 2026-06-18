package com.carrental.backend.reservation;

import com.carrental.backend.security.AuthorizationService;
import com.carrental.backend.user.User;
import com.carrental.backend.user.UserRepository;
import com.carrental.backend.vehicle.Vehicle;
import com.carrental.backend.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final ReservationRepository reservationRepository;
    private final AuthorizationService authorizationService;

    @Transactional
    public Reservation createReservation(ReservationRequest request) {
        authorizationService.requireSelfOrAdmin(request.getUserId());

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        Vehicle vehicle = vehicleRepository.findByIdForUpdate(request.getVehicleId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Vehicle not found"
                ));

        if (!vehicle.isAvailable()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vehicle is not available for rental"
            );
        }

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End date must be after start date"
            );
        }

        boolean alreadyReserved = reservationRepository.existsOverlappingReservation(
                vehicle.getId(),
                request.getStartDate(),
                request.getEndDate(),
                List.of(
                        ReservationStatus.PENDING_PAYMENT,
                        ReservationStatus.CONFIRMED,
                        ReservationStatus.ACTIVE
                )
        );

        if (alreadyReserved) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vehicle is already reserved in this period"
            );
        }

        long days = ChronoUnit.DAYS.between(
                request.getStartDate(),
                request.getEndDate()
        );

        double totalPrice = days * vehicle.getPricePerDay();

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setVehicle(vehicle);
        reservation.setStartDate(request.getStartDate());
        reservation.setEndDate(request.getEndDate());
        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.PENDING_PAYMENT);

        return reservationRepository.save(reservation);
    }

    public List<Reservation> getAllReservations() {
        authorizationService.requireAdmin();
        return reservationRepository.findAll();
    }

    @Transactional
    public Reservation cancelReservation(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reservation not found"
                ));

        authorizationService.requireSelfOrAdmin(reservation.getUser().getId());

        if (reservation.getStatus() != ReservationStatus.CONFIRMED
                && reservation.getStatus() != ReservationStatus.PENDING_PAYMENT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "only confirmed/pending reservations can be cancelled"
            );
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        return reservationRepository.save(reservation);
    }

    public List<Reservation> getReservationByUser(Integer userId) {
        authorizationService.requireSelfOrAdmin(userId);
        return reservationRepository.findByUser_Id(userId);
    }
}
