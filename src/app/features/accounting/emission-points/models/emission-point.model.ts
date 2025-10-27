/**
 * Modelos para Puntos de Emisión (Emission Points)
 *
 * IMPORTANTE: NO hacemos transformaciones de datos
 * Los modelos reflejan exactamente la estructura del API
 */

/**
 * EmissionPoint - Modelo principal de punto de emisión
 * Viene directo del endpoint: EmissionPoint/PointsEmissionList
 */
export interface EmissionPoint {
  emissionPointId: number;
  emissionPointName: string;
  emissionPointNumb: string;
  emissionPointAddress: string;
  emissionPointEnabled: boolean;
}

/**
 * EmissionPointDetail - Detalle completo del punto de emisión
 * Incluye información de auditoría
 * Viene del endpoint: EmissionPoint/PointEmissionDetail
 */
export interface EmissionPointDetail {
  emissionPointId: number;
  emissionPointNumb: string;
  emissionPointName: string;
  emissionPointAddress: string;
  emissionPointEnabled: boolean;
  dateCreated: string;
  userCreator: string;
  dateModified: string;
  userModifier: string;
}

/**
 * EmissionPointListResponse - Respuesta del API con lista paginada
 */
export interface EmissionPointListResponse {
  data: EmissionPoint[];
  metadata: PaginationMetadata;
}

/**
 * PaginationMetadata - Información de paginación del servidor
 */
export interface PaginationMetadata {
  page: number;
  perPage: number;
  pageCount: number;
  totalCount: number;
  totalActive: number;
  totalInactive: number;
}

/**
 * CreateEmissionPointRequest - Request para crear punto de emisión
 * Endpoint: POST EmissionPoint/CreateEmissionPoint
 */
export interface CreateEmissionPointRequest {
  nombrePuntoEmision: string;
  codPais: number;
  numeroPuntoEmision: string;
  direccion: string;
}

/**
 * UpdateEmissionPointRequest - Request para actualizar punto de emisión
 * Endpoint: PUT EmissionPoint/EditEmissionPoint
 */
export interface UpdateEmissionPointRequest {
  nombrePuntoEmision: string;
  codPais: number;
  numeroPuntoEmision: string;
  direccion: string;
}

/**
 * StatusFilter - Filtro de estado para la tabla
 */
export interface StatusFilter {
  idStatus: number;
  label: string;
  filter: string | null;
  qty: number;
}
