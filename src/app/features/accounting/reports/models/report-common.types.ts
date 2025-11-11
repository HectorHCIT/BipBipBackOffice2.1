/**
 * Report Common Types
 *
 * Interfaces y enums compartidos por todos los reportes del módulo de Accounting.
 *
 * IMPORTANTE: NO incluye transformaciones de datos.
 * Las interfaces reflejan exactamente la estructura del API.
 */

/**
 * Formato de reporte disponible
 * IMPORTANTE: Los valores deben coincidir con lo que espera la API
 * - PDF = 1
 * - Excel = 2 (formato antiguo .xlsx)
 */
export enum ReportFormat {
  PDF = 1,
  Excel = 2
}

/**
 * Parámetros base para cualquier reporte
 * Otros reportes pueden extender esta interfaz
 */
export interface BaseReportParams {
  dateFrom: Date;
  dateTo?: Date;
  format?: ReportFormat;
}

/**
 * Marca/Brand - Usado en reportes de cash-flow, pending-settlements
 */
export interface Brand {
  idBrand: number;
  nameBrand: string;
  logoBrand: string; // URL de la imagen del logo
  sortOrderBrand: number;
}

/**
 * Tienda/Store - Usado en reportes que filtran por unidad
 * Respuesta del endpoint: Restaurant/shortNames?brandId={brandId}
 */
export interface Store {
  restId: number;          // ID de la tienda
  shortName: string;       // Nombre corto (ej: "D1", "D2", "KFC-01")
}

/**
 * Ciudad - Usado en reportes con multi-select de ciudades
 */
export interface City {
  cityId: number;
  cityName: string;
  countryId: number;
}

/**
 * Opciones para date range presets
 * Usado en reportes complejos (coupons-redeemed, inactive-deliveries)
 */
export interface DatePresetOption {
  label: string;
  value: 'today' | 'week' | 'month' | 'custom';
}

/**
 * Parámetros de reporte con fecha única + marca + tienda
 * Usado por: cash-flow, pending-settlements
 */
export interface ReportParamsBrandStore extends BaseReportParams {
  brandId: number;
  storeId: number;
}

/**
 * Parámetros de reporte con date range + ciudades
 * Usado por: coupons-redeemed, inactive-deliveries
 */
export interface ReportParamsDateRangeCities extends BaseReportParams {
  dateTo: Date;
  cityIds: number[];
}

/**
 * Parámetros de reporte con date range + top N
 * Usado por: products-ranked
 */
export interface ReportParamsTopN extends BaseReportParams {
  dateTo: Date;
  topN: number;
  brandIds?: number[];
  cityIds?: number[];
}
