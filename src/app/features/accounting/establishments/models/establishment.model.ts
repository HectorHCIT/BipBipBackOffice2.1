/**
 * Establishment Model - Interfaces para el módulo de Establecimientos
 *
 * IMPORTANTE: NO incluye transformaciones de datos.
 * Las interfaces reflejan exactamente la estructura del API.
 */

/**
 * Establishment - Representa un establecimiento en el listado
 */
export interface Establishment {
  establishmentsId: number;
  establishmentsName: string;
  establishmentsNumb: string;
  codEmissionPoint: number;
  emissionPointName: string;
  establishmentsAddress: string;
  establishmentsActive: boolean;
}

/**
 * EstablishmentDetail - Detalles completos de un establecimiento
 */
export interface EstablishmentDetail {
  establishmentsId: number;
  establishmentsNumb: string;
  establishmentsName: string;
  establishmentsAddress: string;
  codEmissionPoint: number;
  emissionPointName: string;
  establishmentsActive: boolean;
  dateCreated: string;
  userCreator: string;
  dateModified: string;
  userModified: string;
}

/**
 * EstablishmentListResponse - Respuesta del endpoint de listado
 */
export interface EstablishmentListResponse {
  data: Establishment[];
  metadata: {
    page: number;
    perPage: number;
    pageCount: number;
    totalCount: number;
    totalActive: number;
    totalInactive: number;
  };
}

/**
 * CreateEstablishmentRequest - Estructura para crear establecimiento
 */
export interface CreateEstablishmentRequest {
  nameEstablishments: string;
  codCountry: number; // Hardcoded to 0
  numbEstablishments: string;
  codEmissionPoint: number;
  addressEstablishments: string;
  active: boolean;
}

/**
 * UpdateEstablishmentRequest - Estructura para editar establecimiento
 */
export interface UpdateEstablishmentRequest {
  nameEstablishments: string;
  codCountry: number; // Hardcoded to 0
  numbEstablishments: string;
  codEmissionPoint: number;
  addressEstablishments: string;
  active: boolean;
}

/**
 * EmissionPointSummary - Punto de emisión para el select
 */
export interface EmissionPointSummary {
  emissionPointId: number;
  emissionPointName: string;
}

/**
 * StatusFilter - Filtro de estado (Todos/Activos/Inactivos)
 */
export interface StatusFilter {
  idStatus: number;
  label: string;
  filter: string | null;
  qty: number;
}
