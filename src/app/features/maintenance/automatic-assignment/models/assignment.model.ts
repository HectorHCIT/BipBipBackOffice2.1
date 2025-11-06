/**
 * Modelo principal de asignación automática de órdenes a drivers
 */
export interface AutomaticAssignment {
  orderId: number;
  postGCOrderId: number;
  driverId: number | null;
  imageDriver: string | null;
  driverName: string | null;
  channelName: string;
  countryId: number | null;
  countryName: string | null;
  countryUrlFlag?: string | null;
  cityId: number | null;
  cityName: string | null;
  dateOrder: string;
  timeOrder: string; // Formato: "8 días, 03 horas, 05 minutos"
}

/**
 * Resumen de asignaciones agrupadas por ciudad
 */
export interface AssignmentByCity {
  countryId: number;
  countryName: string;
  countryUrlFlag?: string | null;
  cityId: number;
  cityName: string;
  qtyOrders: number;
}

/**
 * Metadata de paginación para respuestas de la API
 */
export interface PaginationMetadata {
  page: number;
  perPage: number;
  pageCount: number;
  totalCount: number;
}

/**
 * Respuesta paginada de la API con lista de asignaciones
 */
export interface AutomaticAssignmentResponse {
  data: AutomaticAssignment[];
  metadata: PaginationMetadata;
}

/**
 * Opciones de tamaño de página disponibles
 */
export const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;
export type PageSize = typeof PAGE_SIZE_OPTIONS[number];
