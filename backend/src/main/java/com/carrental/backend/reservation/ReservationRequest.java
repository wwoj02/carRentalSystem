package com.carrental.backend.reservation;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReservationRequest {
    private Integer userId;
    private Integer vehicleId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String drivingLicenceId;
    private String insuranceType;
    private boolean gpsIncluded;
    private boolean youngDriver;
}
