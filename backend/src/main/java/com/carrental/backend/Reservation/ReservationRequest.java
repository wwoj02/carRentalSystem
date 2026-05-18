package com.carrental.backend.Reservation;

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
}
