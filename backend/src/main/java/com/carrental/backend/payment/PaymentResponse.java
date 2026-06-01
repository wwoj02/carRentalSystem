package com.carrental.backend.payment;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentResponse {
    private Integer paymentId;
    private Integer reservationId;
    private double amount;
    private String currency;
    private PaymentStatus status;
    private String paymentUrl;
    private String providerTransactionId;
}
