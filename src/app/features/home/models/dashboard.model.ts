import type { OrderStatusType } from '@shared/enums/order-status.enum';

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiErrorDto;
}

export interface ApiErrorDto {
  code?: string;
  message?: string;
  details?: string;
}

/**
 * API DTOs - Interfaces que coinciden con los schemas del swagger
 */
export interface HomeByCityDto {
  cityName: string;
  totalOrders: number;
}

export interface HomeByBrandsDto {
  brandName: string;
  brandLogoUrl: string;
  totalOrders: number;
}

export interface HomeByPaymentMethodDto {
  paymentMethodName: string;
  totalOrders: number;
}

export interface HomeByChannelDto {
  channelDescription: string;
  totalOrders: number;
}

export interface HomeTotalOrdersByStatusDto {
  totalOrders: number;
}

/**
 * Dashboard Data interfaces (usadas en el componente)
 */
export interface DashboardKPI {
  label: string;
  value: number;
  icon?: string;
}

export interface OrdersByPaymentMethod {
  method: string;
  total: number;
}

export interface OrdersByChannel {
  channel: string;
  total: number;
  percentage: number;
}

export interface OrdersByBrand {
  brandId: number;
  brandName: string;
  logo: string;
  total: number;
}

export interface OrdersByCity {
  cityId: number;
  cityName: string;
  total: number;
}

export interface DashboardData {
  totalOrders: number;
  deliveredOrders: number;
  ordersInProgress: number;
  ordersByPaymentMethod: OrdersByPaymentMethod[];
  ordersByChannel: OrdersByChannel[];
  ordersByBrand: OrdersByBrand[];
  ordersByCity: OrdersByCity[];
}

/**
 * Dashboard Filters
 */
export interface DashboardFilters {
  startDate?: Date;
  endDate?: Date;
  approved?: boolean;
  orderStatusId?: OrderStatusType;
  cityId?: number;
}
