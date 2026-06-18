package com.carrental.backend.payment;

import com.carrental.backend.security.AuthorizationService;
import com.carrental.backend.reservation.Reservation;
import com.carrental.backend.reservation.ReservationRepository;
import com.carrental.backend.reservation.ReservationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final AuthorizationService authorizationService;

    @Transactional
    public PaymentResponse createPayment(Integer reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reservation not found"
                ));
        if (reservation.getStatus() != ReservationStatus.PENDING_PAYMENT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment can only be created for pending reservations"
            );
        }

        authorizationService.requireSelfOrAdmin(reservation.getUser().getId());

        paymentRepository.findByReservationId(reservationId)
                .ifPresent(payment -> {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Payment already exists for this reservation"
                    );
                });

        String transactionId = UUID.randomUUID().toString();

        Payment payment = new Payment();
        payment.setReservation(reservation);
        payment.setAmount(reservation.getTotalPrice());
        payment.setCurrency("PLN");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProviderTransactionId(transactionId);
        payment.setPaymentUrl("http://localhost:8080/mock-payment/" + transactionId);
        payment.setCreatedAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        return toResponse(savedPayment);
    }

    @Transactional
    public PaymentResponse confirmPayment(String providerTransactionId) {
        Payment payment = paymentRepository.findByProviderTransactionId(providerTransactionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment not found"
                ));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending payments can be confirmed"
            );
        }

        authorizationService.requireSelfOrAdmin(payment.getReservation().getUser().getId());

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());

        Reservation reservation = payment.getReservation();
        reservation.setStatus(ReservationStatus.CONFIRMED);

        reservationRepository.save(reservation);
        Payment savedPayment = paymentRepository.save(payment);

        return toResponse(savedPayment);
    }

    @Transactional
    public PaymentResponse failPayment(String providerTransactionId) {
        Payment payment = paymentRepository.findByProviderTransactionId(providerTransactionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment not found"
                ));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending payments can be failed"
            );
        }

        authorizationService.requireSelfOrAdmin(payment.getReservation().getUser().getId());

        payment.setStatus(PaymentStatus.FAILED);

        Reservation reservation = payment.getReservation();
        reservation.setStatus(ReservationStatus.PAYMENT_FAILED);

        reservationRepository.save(reservation);
        Payment savedPayment = paymentRepository.save(payment);

        return toResponse(savedPayment);
    }

    private PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getReservation().getId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getPaymentUrl(),
                payment.getProviderTransactionId()
        );
    }
}
