package com.carrental.backend.report;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReportSummaryResponse {
    private final double totalRevenue;
    private final long reservationCount;
    private final long completedCount;
    private final double fleetUtilizationPercent;
}
