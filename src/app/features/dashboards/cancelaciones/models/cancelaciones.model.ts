import { ApiErrorDto } from "@features/home/models/dashboard.model";


/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiErrorDto;
}

/**
 * Cancellations Summary DTO
 */
export interface CancellationSummaryDto {
  totalCanceledOrders: number;
  percentageCanceledOrders: number;
}

/**
 * Cancellations by Brand DTO
 */
export interface CancellationsByBrandDto {
  brandShortName: string;
  totalCanceledOrders: number;
}

/**
 * Cancellations by Channel DTO
 */
export interface CancellationsByChannelDto {
  channelDescription: string;
  totalCanceledOrders: number;
}

/**
 * Cancellations by Store/Unit DTO
 */
export interface CancellationsByStoreDto {
  storeShortName: string;
  totalCanceledOrders: number;
}

/**
 * Canceled Order List Item DTO
 */
export interface CanceledOrderListItemDto {
  newOrderId: string;
  customerFirstName: string;
  dateCanceled: Date;
  total: number;
  brandShortName: string;
  storeShortName: string;
}

/**
 * Paged Result DTO
 */
export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

/**
 * Filters for cancellations dashboard
 */
export interface CancellationsFilters {
  startDate?: Date;
  endDate?: Date;
  brandId?: number;
  approved?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Complete dashboard data
 */
export interface CancellationsDashboardData {
  summary: CancellationSummaryDto;
  byBrand: CancellationsByBrandDto[];
  byChannel: CancellationsByChannelDto[];
  byStore: CancellationsByStoreDto[];
  list: PagedResultDto<CanceledOrderListItemDto>;
}
