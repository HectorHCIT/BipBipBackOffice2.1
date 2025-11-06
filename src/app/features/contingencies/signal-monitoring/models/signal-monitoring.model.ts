/**
 * Signal Monitoring Module Models
 * Interfaces para monitoreo de órdenes en Redis/SignalR
 */

/**
 * Lista de ciudades
 */
export interface CityList {
  cityId: number;
  codCountry: number;
  countryUrlFlag: string;
  countryName: string;
  cityName: string;
  cityCode: string;
  isActive: boolean;
  couponMin: number;
  publish: boolean;
  codZone: number;
  zoneName: string;
  orderMin: number;
  freeShipping: boolean;
  faCpayment: boolean;
}

/**
 * Cliente de la orden
 */
export interface Customer {
  id: number;
  imageUrl: string;
  name: string;
  address: string;
  phoneNumber: string;
  alternativePhoneNumber: string;
  latitude: number;
  longitude: number;
}

/**
 * Tienda/Restaurante
 */
export interface Store {
  id: number;
  store: string;
  imageUrl: string;
  address: string;
  latitude: number;
  longitude: number;
}

/**
 * Información de pago
 */
export interface Payment {
  command: number;
  type: string; // 'cash', 'card', etc.
  status: string;
  totalOrder: number;
  paymentWith: number;
  change: number;
}

/**
 * Estado de la orden en el historial
 */
export interface OrderStatus {
  Title: string;
  date: string;
  type: string;
}

/**
 * Estado actual de la orden
 */
export interface CurrentStatus {
  Title: string;
  date: string;
  type: string;
}

/**
 * Orden completa en Redis/SignalR
 */
export interface IMonitoringSignalRRedis {
  numOrder: number;
  deliveryCode: string | null;
  driver: string;
  tip: number;
  deliveryExpress: boolean;
  city: number;
  time: string;
  date: string;
  channel: string;
  channelId: string;
  customer: Customer;
  store: Store;
  payment: Payment;
  orderStatus: OrderStatus[];
  currentStatus: CurrentStatus;
}

/**
 * Tipos de pago (helper para traducción)
 */
export enum PaymentType {
  Cash = 1,
  Card = 2,
}

/**
 * Helper para obtener nombre de método de pago en español
 */
export function getPaymentMethodName(paymentType: number): string {
  switch (paymentType) {
    case PaymentType.Cash:
      return 'Efectivo';
    case PaymentType.Card:
      return 'Tarjeta';
    default:
      return 'Desconocido';
  }
}
