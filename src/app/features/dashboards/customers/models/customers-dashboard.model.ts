/**
 * Modelos e interfaces para el dashboard de clientes
 */

/**
 * Métrica de clientes para KPI cards
 */
export interface CustomerMetric {
  label: string;
  value: number;
  icon: string;
  color: string;
}

/**
 * Clientes agrupados por ciudad
 */
export interface CustomerByCity {
  cityName: string;
  totalClientes: number;
}

/**
 * Respuesta de la API para clientes por ciudad
 */
export interface CustomerPurchasesByCityDto {
  cityName: string | null;
  quantity: number;
}

/**
 * Respuesta de la API para total de clientes registrados
 */
export interface TotalRegisteredCustomersDto {
  totalCustomers: number;
}

/**
 * Wrapper genérico de respuesta de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data?: T;
  error?: any;
}

/**
 * Datos completos del dashboard de clientes
 */
export interface CustomerDashboardData {
  todayCount: number;
  yesterdayCount: number;
  totalCount: number;
  citiesTotal: CustomerByCity[];
  citiesToday: CustomerByCity[];
  citiesYesterday: CustomerByCity[];
}
