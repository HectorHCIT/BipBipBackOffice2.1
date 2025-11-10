/**
 * Modelo para una solicitud de cancelación individual
 */
export interface CancellationRequest {
  /** ID de la solicitud de cancelación */
  id: number;

  /** ID de la orden asociada */
  orderId: number;

  /** ID de POSGC de la orden (opcional) */
  posgcOrderId?: number;

  /** Nombre del canal */
  channelName: string;

  /** Nombre de la tienda */
  storeName: string;

  /** Fecha y hora de la solicitud */
  requestTime: string;

  /** Usuario que realizó la solicitud */
  userRequest: string;

  /** Comentario de la solicitud */
  comment: string;

  /** Estado de la solicitud */
  status: 'Pendiente' | 'Aprobada' | 'Rechazada';
}

/**
 * Respuesta de la API para la lista de solicitudes de cancelación
 */
export interface CancellationRequestsResponse {
  /** Lista de solicitudes */
  data: CancellationRequest[];

  /** Total de registros */
  totalCount: number;

  /** Indica si la operación fue exitosa */
  success: boolean;

  /** Mensaje de respuesta */
  message?: string;
}

/**
 * Parámetros para la búsqueda de solicitudes de cancelación
 */
export interface CancellationRequestSearchParams {
  /** Número de página */
  pageNumber?: number;

  /** Tamaño de página */
  pageSize?: number;

  /** Filtro de búsqueda (opcional) */
  filter?: string;

  /** Estado de la solicitud (opcional) */
  status?: 'Pendiente' | 'Aprobada' | 'Rechazada';

  /** Fecha desde (opcional) */
  dateFrom?: string;

  /** Fecha hasta (opcional) */
  dateTo?: string;
}
