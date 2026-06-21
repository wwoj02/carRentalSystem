package com.carrental.backend.reservation;

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
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final ReservationRepository reservationRepository;

    private static final double REGULAR_INSURANCE_PER_DAY = 15.0;
    private static final double PREMIUM_INSURANCE_PER_DAY = 30.0;
    private static final double GPS_PER_DAY = 5.0;
    private static final double YOUNG_DRIVER_FEE = 25.0;

    public Reservation createReservation(ReservationRequest request) {
        User user = userRepository.findById(
                request.getUserId()
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "User not found"
        ));

        Vehicle vehicle = vehicleRepository.findById(
                request.getVehicleId()
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Vehicle not found"
        ));

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "End date must be after start date"
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

        double totalPrice = calculateTotalPrice(request, vehicle, days);

        Reservation reservation = new Reservation();

        reservation.setUser(user);
        reservation.setVehicle(vehicle);

        reservation.setStartDate(request.getStartDate());
        reservation.setEndDate(request.getEndDate());

        reservation.setTotalPrice(totalPrice);
        reservation.setCustomerName(valueOrDefault(
                request.getCustomerName(),
                user.getFirstName() + " " + user.getLastName()
        ));
        reservation.setCustomerEmail(valueOrDefault(request.getCustomerEmail(), user.getEmail()));
        reservation.setCustomerPhone(request.getCustomerPhone());
        reservation.setDrivingLicenceId(request.getDrivingLicenceId());
        reservation.setInsuranceType(normalizeInsuranceType(request.getInsuranceType()));
        reservation.setGpsIncluded(request.isGpsIncluded());
        reservation.setYoungDriver(request.isYoungDriver());
        reservation.setStatus(ReservationStatus.PENDING_PAYMENT);

        return reservationRepository.save(reservation);
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Reservation cancelReservation(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reservation not found"
                ));

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
        return reservationRepository.findByUserId(userId);
    }

    public Reservation getReservation(Integer id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reservation not found"
                ));
    }

    public String generateAgreement(Integer id) {
        Reservation reservation = getReservation(id);

        return """
                RENTAL AGREEMENT

                Agreement no.: %d
                Status: %s

                Customer:
                Name: %s
                Email: %s
                Phone: %s
                Driving licence ID: %s

                Vehicle:
                %s %s, year %d
                Type: %s
                Drive type: %s

                Rental period:
                Pick-up date: %s
                Return date: %s

                Options:
                Insurance: %s
                GPS navigation: %s
                Young driver: %s

                Total price: %.2f PLN

                This agreement was generated automatically after reservation confirmation.
                """.formatted(
                reservation.getId(),
                reservation.getStatus(),
                blankToDash(reservation.getCustomerName()),
                blankToDash(reservation.getCustomerEmail()),
                blankToDash(reservation.getCustomerPhone()),
                blankToDash(reservation.getDrivingLicenceId()),
                reservation.getVehicle().getBrand(),
                reservation.getVehicle().getModel(),
                reservation.getVehicle().getYear(),
                reservation.getVehicle().getType(),
                reservation.getVehicle().getDriveType(),
                reservation.getStartDate(),
                reservation.getEndDate(),
                blankToDash(reservation.getInsuranceType()),
                yesNo(reservation.isGpsIncluded()),
                yesNo(reservation.isYoungDriver()),
                reservation.getTotalPrice()
        );
    }

    private double calculateTotalPrice(ReservationRequest request, Vehicle vehicle, long days) {
        double total = days * vehicle.getPricePerDay();
        total += days * insurancePricePerDay(normalizeInsuranceType(request.getInsuranceType()));
        if (request.isGpsIncluded()) {
            total += days * GPS_PER_DAY;
        }
        if (request.isYoungDriver()) {
            total += YOUNG_DRIVER_FEE;
        }
        return total;
    }

    private double insurancePricePerDay(String insuranceType) {
        return switch (insuranceType) {
            case "regular" -> REGULAR_INSURANCE_PER_DAY;
            case "premium" -> PREMIUM_INSURANCE_PER_DAY;
            default -> 0.0;
        };
    }

    private String normalizeInsuranceType(String insuranceType) {
        if (insuranceType == null || insuranceType.isBlank()) {
            return "none";
        }
        String normalized = insuranceType.trim().toLowerCase(Locale.ROOT);
        if (List.of("none", "regular", "premium").contains(normalized)) {
            return normalized;
        }
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Unsupported insurance type"
        );
    }

    private String valueOrDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value.trim();
    }

    private String blankToDash(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }

    private String yesNo(boolean value) {
        return value ? "yes" : "no";
    }
}
