package com.carrental.backend.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/reservations/{reservationId}/payment")
    public PaymentResponse createPayment(@PathVariable Integer reservationId) {
        return paymentService.createPayment(reservationId);
    }

    @PostMapping("/payments/{providerTransactionId}/confirm")
    public PaymentResponse confirmPayment(@PathVariable String providerTransactionId) {
        return paymentService.confirmPayment(providerTransactionId);
    }

    @PostMapping("/payments/{providerTransactionId}/fail")
    public PaymentResponse failPayment(@PathVariable String providerTransactionId) {
        return paymentService.failPayment(providerTransactionId);
    }
}
