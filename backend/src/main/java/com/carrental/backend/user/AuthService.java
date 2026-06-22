package com.carrental.backend.user;

import com.carrental.backend.payment.PaymentRepository;
import com.carrental.backend.reservation.Reservation;
import com.carrental.backend.reservation.ReservationRepository;
import com.carrental.backend.reservation.ReservationStatus;
import com.carrental.backend.security.SecurityUtils;
import com.carrental.backend.security.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;

    private static final List<ReservationStatus> ACTIVE_STATUSES = List.of(
            ReservationStatus.PENDING_PAYMENT,
            ReservationStatus.CONFIRMED,
            ReservationStatus.ACTIVE
    );

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User with this email already exists"
            );
        }

        User user = new User();
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.CUSTOMER);

        User savedUser = userRepository.save(user);
        return new AuthResponse(UserResponse.from(savedUser), tokenService.createToken(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> invalidCredentials());

        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }

        return new AuthResponse(UserResponse.from(user), tokenService.createToken(user));
    }

    @Transactional
    public void deleteCurrentUser() {
        User current = SecurityUtils.getCurrentUser();
        List<Reservation> reservations = reservationRepository.findByUser_Id(current.getId());

        boolean hasActive = reservations.stream()
                .anyMatch(reservation -> ACTIVE_STATUSES.contains(reservation.getStatus()));
        if (hasActive) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot delete account with active reservations"
            );
        }

        for (Reservation reservation : reservations) {
            paymentRepository.findByReservationId(reservation.getId()).ifPresent(paymentRepository::delete);
        }
        reservationRepository.deleteAll(reservations);
        userRepository.delete(current);
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
        );
    }
}
