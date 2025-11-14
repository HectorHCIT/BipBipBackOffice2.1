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
 * Item para la tabla de pedidos por canal/tipo de entrega
 * Mapea OrdersByChannelSummaryItemDto del API
 */
export interface OrdersByChannelItem {
  channelDescription: string;  // "Domicilio", "Para Llevar", "Restaurante", "*5000"
  totalOrders: number;         // Total de pedidos
  totalMoney: number;          // Total en dinero
}

/**
 * Respuesta del endpoint by-channel/summary
 */
export interface OrdersByChannelSummaryResponse {
  items: OrdersByChannelItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/**
 * Item para la tabla de pedidos por marca
 * Mapea BrandSalesSummaryItemDto del API
 */
export interface OrdersByBrandItem {
  logo: string | null;              // URL del logo de la marca
  brandShortName: string;           // Nombre corto de la marca
  totalMoney: number;               // Total en dinero
  totalSalesDelivered: number | null; // Total de ventas entregadas
}

/**
 * Item extendido con ticket promedio calculado
 */
export interface BrandSalesWithAvg extends OrdersByBrandItem {
  totalOrders: number;              // Total de órdenes
  avgTicket: number;                // Ticket promedio (totalMoney / totalOrders)
}

/**
 * Item para el ticket promedio por marca
 * Mapea AvgTicketByBrandItemDto del API
 */
export interface AvgTicketByBrandItem {
  brandShortName: string;           // Nombre corto de la marca
  avgSubTotal: number;              // Promedio de subtotal (ticket promedio)
}

/**
 * Item para el ticket promedio por canal
 * Mapea AvgTicketByChannelItemDto del API
 */
export interface AvgTicketByChannelItem {
  channelDescription: string;  // Descripción del canal ("Domicilio", "Para Llevar", etc.)
  avgSubTotal: number;         // Promedio de subtotal (ticket promedio)
}

/**
 * Item para el ticket promedio por método de pago
 * Mapea AvgTicketByPaymentMethodItemDto del API
 */
export interface AvgTicketByPaymentMethodItem {
  paymentMethodName: string;   // Nombre del método de pago
  avgSubTotal: number;         // Promedio de subtotal (ticket promedio)
}

/**
 * Item para los costos de envío por día
 * Mapea ShippingCostsByDayItemDto del API
 */
export interface ShippingCostsByDayItem {
  deliveredDateDay: string;    // Fecha de entrega (ISO date string)
  totalCostoEnvios: number;    // Total de costos de envío
}

/**
 * Item para la tabla de rangos de costos de envío
 * TODO: Reemplazar con endpoint real cuando esté disponible
 */
export interface ShippingRangeItem {
  rangoKm: string;               // Rango de kilómetros (ej: "7.0000 - 10.0000 km")
  totalCostoEnvios: number;      // Total de costos de envíos
  totalPagosEnvios: number;      // Total de pagos de envíos
}

/**
 * Estadísticas de envíos (KPIs)
 * TODO: Reemplazar con endpoint real cuando esté disponible
 */
export interface ShippingStatistics {
  promedioPagosEnvio: number;    // Promedio de pagos de envío
  promedioCostoEnvio: number;    // Promedio de costo de envío
  costoMaximoEnvio: number;      // Costo máximo de envío
  totalCostosEnvio: number;      // Total de costos de envío
  totalPagosEnvio: number;       // Total de pagos de envío
}

/**
 * KPI individual de canal
 */
export interface ChannelKpi {
  channelName: string;
  count: number;
  icon: string;
  color: string;
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
  ordersByChannel: OrdersByChannelItem[];
  ordersByBrand: OrdersByBrandItem[];
  avgTicketGlobal: number;
  avgTicketByBrand: AvgTicketByBrandItem[];
  avgTicketByChannel: AvgTicketByChannelItem[];
  avgTicketByPaymentMethod: AvgTicketByPaymentMethodItem[];
  shippingCostsByDay: ShippingCostsByDayItem[];
  shippingRanges: ShippingRangeItem[];
  shippingStatistics: ShippingStatistics;
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
