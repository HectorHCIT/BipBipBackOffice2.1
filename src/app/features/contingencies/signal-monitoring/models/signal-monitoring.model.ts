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
  idCustomer: number;
  name: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
}

/**
 * Tienda/Restaurante
 */
export interface Store {
  idStore: number;
  idBrand: number;
  name: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
}

/**
 * Información de pago
 */
export interface Payment {
  paymentType: number;
  total: number;
  change: number;
  idCommand: number;
}

/**
 * Estado de la orden en el historial
 */
export interface OrderStatus {
  idOrderStatus: number;
  name: string;
  description: string;
  time: string;
}

/**
 * Estado actual de la orden
 */
export interface CurrentStatus {
  idOrderStatus: number;
  name: string;
}

/**
 * Orden completa en Redis/SignalR
 */
export interface IMonitoringSignalRRedis {
  idOrder: number;
  dateOrder: string;
  customer: Customer;
  store: Store;
  payment: Payment;
  status: OrderStatus[];
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
