package com.carrental.backend.reservation;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReservationRequest {
    @NotNull
    private Integer userId;
    @NotNull
    private Integer vehicleId;
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String drivingLicenceId;
    private String insuranceType;
    private boolean youngDriver;
}
