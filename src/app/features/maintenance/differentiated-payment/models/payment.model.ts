/**
 * Payment Models
 *
 * Models for differentiated payment scheduling including payments,
 * calendar events, and API request/response structures
 */

/**
 * Main payment interface representing a scheduled payment
 */
export interface Payment {
  id: number;
  launchDate: string;           // ISO date string
  launchScaleValue: number;      // Payment scale percentage
  scheduled: boolean;            // Confirmation status
  cities: number[];              // Array of city IDs
}

/**
 * DTO for creating/updating payments
 */
export interface CreatePaymentDto {
  ammountCustomer: number;
  ammountDriver: number;
  cities: number[];
  scheduleDate: string;          // ISO date string
}

/**
 * Calendar day representation
 */
export interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

/**
 * Calendar event (payment visualization)
 */
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  backgroundColor: string;
  textColor: string;
  payment: Payment;
}

/**
 * City color assignment
 */
export interface CityColor {
  cityId: number;
  color: string;
}

/**
 * Default color palette for cities
 */
export const DEFAULT_CITY_COLORS = [
  '#fb0021',  // Rojo BipBip (brand color)
  '#10b981',  // Verde
  '#3b82f6',  // Azul
  '#f59e0b',  // Amarillo
  '#8b5cf6',  // Púrpura
  '#ec4899',  // Rosa
  '#06b6d4',  // Cian
  '#84cc16',  // Lima
  '#f97316',  // Naranja
  '#6366f1'   // Índigo
];
