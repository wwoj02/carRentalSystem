package com.carrental.backend.Reservation;

import com.carrental.backend.user.User;
import com.carrental.backend.user.UserRepository;
import com.carrental.backend.vehicle.Vehicle;
import com.carrental.backend.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final ReservationRepository reservationRepository;

    public Reservation createReservation(ReservationRequest request) {
        User user = userRepository.findById(
                request.getUserId()
                ).orElseThrow();

        Vehicle vehicle = vehicleRepository.findById(
                request.getVehicleId()
        ).orElseThrow();

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "End date must be after start date"
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
        reservation.setStatus(ReservationStatus.CONFIRMED);

        return reservationRepository.save(reservation);
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }
}
