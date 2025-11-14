import { OrderStatusType } from '@shared/enums/order-status.enum';

/**
 * Filtros para el dashboard de órdenes
 */
export interface OrdersFilters {
  brandId?: number;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  approved?: boolean;
  excludedStatusId?: number;
  orderStatusId?: number;
}

/**
 * KPI individual de estado de orden
 */
export interface OrderStatusKpi {
  statusId: OrderStatusType;
  statusName: string;
  count: number;
  icon: string;
  color: string;
}

/**
 * Item de la tabla/donut de órdenes por estado
 */
export interface OrdersByStatusItem {
  statusName: string;
  totalOrders: number;
  totalMoney: number;
}

/**
 * Respuesta del endpoint by-status/summary
 */
export interface OrdersByStatusSummaryResponse {
  items: OrdersByStatusItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/**
 * Respuesta de conteo simple
 */
export interface CountResponse {
  total: number;
}

/**
 * Respuesta de valor promedio
 */
export interface AvgValueResponse {
  value: number;
}

/**
 * Item para el gráfico de barras de pedidos por tienda/unidad
 * Mapea OrdersByStoreItemDto del API
 */
export interface OrdersByUnitItem {
  storeShortName: string;  // Nombre corto de la tienda (del API)
  totalOrders: number;     // Total de pedidos
}

/**
 * Item para la tabla de pedidos por ciudad
 * Mapea OrdersByCityItemDto del API
 */
export interface OrdersByCityItem {
  cityName: string;          // Nombre de la ciudad
  totalOrders: number;       // Total de pedidos
  avgOrdersPerDay: number;   // Promedio de pedidos por día
  totalMoney: number;        // Total en dinero
}

/**
 * Data completa del dashboard de órdenes
 */
export interface OrdersDashboardData {
  statusKpis: OrderStatusKpi[];
  ordersByStatus: OrdersByStatusItem[];
  avgPerHour: number;
  recurrentCustomers: number;
  ordersByUnit: OrdersByUnitItem[];
  ordersByCity: OrdersByCityItem[];
}

/**
 * Opciones de período predefinido
 */
export enum PeriodType {
  Today = 'today',
  Yesterday = 'yesterday',
  LastWeek = 'lastWeek',
  LastMonth = 'lastMonth',
  Custom = 'custom'
}

/**
 * Opción de período para el dropdown
 */
export interface PeriodOption {
  label: string;
  value: PeriodType;
}
