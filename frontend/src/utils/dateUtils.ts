import { parse, format, differenceInDays } from 'date-fns';

export const formatDate = (dateString: string): string => {
  const date = typeof dateString === 'string' ? parse(dateString, 'yyyy-MM-dd', new Date()) : new Date(dateString);
  return format(date, 'MMM dd, yyyy');
};

export const calculateDays = (startDate: string, endDate: string): number => {
  const start = typeof startDate === 'string' ? parse(startDate, 'yyyy-MM-dd', new Date()) : new Date(startDate);
  const end = typeof endDate === 'string' ? parse(endDate, 'yyyy-MM-dd', new Date()) : new Date(endDate);
  return differenceInDays(end, start);
};

export const calculateTotalPrice = (pricePerDay: number, startDate: string, endDate: string): number => {
  const days = calculateDays(startDate, endDate);
  return days * pricePerDay;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(amount);
};
