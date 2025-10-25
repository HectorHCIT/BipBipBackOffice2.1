/**
 * Modelo de Precios por Kilómetro
 *
 * NO hacemos transformaciones - usamos directamente el modelo del backend
 * para mantener consistencia con la API
 */

/**
 * PriceList - Lista de precios por ciudad/zona
 * Viene directo del endpoint: Restaurant/scales/summary
 */
export interface PriceList {
  label: string;
  scales: Scale[];
  isOpen?: boolean; // Propiedad local para UI de accordion
}

/**
 * Scale - Escala de precios por rango de kilómetros
 */
export interface Scale {
  kmminimun: number;
  kmmaximum: number;
  customerDeliveryCharge: number;
  paymentAmountDelivery: number;
  customerSpecialFee: number;
  driverSpecialFee: number;
}

/**
 * CityList - Lista de ciudades disponibles
 * Usado en los diálogos de configuración
 */
export interface CityList {
  cityId: number;
  countryUrlFlag: string;
  cityName: string;
  checked?: boolean; // Propiedad local para selección en UI
}

/**
 * StandardPaymentRequest - Request para pago estándar/diferenciado o reseteo
 * Endpoint: Restaurant/scales/summary/standard
 *
 * Casos de uso:
 * 1. Reset de precios: solo cities[]
 * 2. Pago diferenciado: ammountDriver + cities[]
 */
export interface StandardPaymentRequest {
  ammountDriver?: number;
  cities: number[];
}

/**
 * SpecialPaymentRequest - Request para pago extraordinario
 * Endpoint: Restaurant/scales/summary/special
 *
 * Configura tarifas especiales tanto para cliente como driver
 */
export interface SpecialPaymentRequest {
  ammountCustomer: number;
  ammountDriver: number;
  cities: number[];
}
