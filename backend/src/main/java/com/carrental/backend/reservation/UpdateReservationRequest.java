package com.carrental.backend.reservation;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UpdateReservationRequest(
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate
) {
}
