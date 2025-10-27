/**
 * Company Model - Interfaces para el módulo de Empresas
 *
 * IMPORTANTE: NO incluye transformaciones de datos.
 * Las interfaces reflejan exactamente la estructura del API.
 */

/**
 * Company - Representa una empresa en el listado
 */
export interface Company {
  companyId: number;
  companyName: string;
  socialReasonName: string;
  companyEmail: string;
  companyRTN: string;
  companyPhone: string;
  companyAddress: string;
  companyActive: boolean;
  companyDateCreated: string;
  userCreator: string;
  companyDateUpdated: string;
  userModifier: string;
  countryId: number;
}

/**
 * CompanyDetail - Detalles completos de una empresa
 */
export interface CompanyDetail {
  companyId: number;
  companyName: string;
  socialReasonName: string;
  companyEmail: string;
  companyRTN: string;
  companyPhone: string;
  companyAddress: string;
  companyActive: boolean;
  companyDateCreated: string;
  userCreator: string;
  companyDateUpdated: string;
  userModifier: string;
  countryId: number;
}

/**
 * CompanyListResponse - Respuesta del endpoint de listado
 */
export interface CompanyListResponse {
  data: Company[];
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
 * CreateCompanyRequest - Estructura para crear empresa
 */
export interface CreateCompanyRequest {
  nombreNegocio: string;
  razonSocial: string;
  codPais: number;
  rtn: string;
  email: string;
  telefono: string;
  direccion: string;
}

/**
 * UpdateCompanyRequest - Estructura para editar empresa
 */
export interface UpdateCompanyRequest {
  nombreNegocio: string;
  razonSocial: string;
  codPais: number;
  rtn: string;
  email: string;
  telefono: string;
  direccion: string;
}

/**
 * Country - Representa un país para el select
 */
export interface Country {
  countryId: number;
  countryName: string;
  countryCode: string;
  isActive: boolean;
  countryPrefix: string;
  countryUrlFlag: string;
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
