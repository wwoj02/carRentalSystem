import api from './api';

export type ReportSummary = {
  totalRevenue: number;
  reservationCount: number;
  completedCount: number;
  fleetUtilizationPercent: number;
};

export const reportService = {
  async getSummary(from: string, to: string): Promise<ReportSummary> {
    const { data } = await api.get<ReportSummary>('/reports/summary', { params: { from, to } });
    return data;
  },
};
