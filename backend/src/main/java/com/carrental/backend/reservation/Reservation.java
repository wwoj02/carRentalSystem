package com.carrental.backend.reservation;


import com.carrental.backend.user.User;
import com.carrental.backend.vehicle.Vehicle;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name="reservations")
@NoArgsConstructor
@Getter
@Setter
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Vehicle vehicle;
    private LocalDate startDate;
    private LocalDate endDate;
    private double totalPrice;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String drivingLicenceId;
    private String insuranceType;
    @Column(name = "gps_included")
    private boolean gpsTrackingActive;
    private boolean youngDriver;

    @Column(length = 1000)
    private String returnNotes;

    @Column(name = "pickup_notes", length = 2000)
    private String pickupNotes;

    @Column(name = "damage_notes", length = 2000)
    private String damageNotes;

    @Column(name = "extra_charges", nullable = false)
    private double extraCharges = 0.0;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;
}
