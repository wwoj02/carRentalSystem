package com.carrental.backend.payment;

import com.carrental.backend.reservation.Reservation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@NoArgsConstructor
@Getter
@Setter
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    private Reservation reservation;

    private double amount;
    private String currency;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String providerTransactionId;
    private String paymentUrl;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
