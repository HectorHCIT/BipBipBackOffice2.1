/**
 * Fiscal Correlative Model - Interfaces para el módulo de Correlativos Fiscales
 *
 * IMPORTANTE: NO incluye transformaciones de datos.
 * Las interfaces reflejan exactamente la estructura del API.
 */

/**
 * FiscalCorrelative - Representa un correlativo fiscal en el listado
 *
 * IMPORTANTE: Esta interface refleja EXACTAMENTE lo que devuelve el API.
 * El API de lista NO incluye nombres de Company, Establishment, EmissionPoint, DocumentType.
 * Solo devuelve el país completo (ID + nombre).
 */
export interface FiscalCorrelative {
  corrBillId: number;
  corrBillCAI: string;
  corrBillInitNum: number;
  corrBillEndNum: number;
  corrBillLastNumUsed: number;
  corrBillDateUntil: string; // ISO date string
  corrBillCountryId: number; // ID del país (para lookup de bandera)
  corrBillCountryName: string; // Nombre del país (viene en API)
  corrBillStatus: boolean; // Estado activo/inactivo (en lista se llama Status, no Active)
}

/**
 * FiscalCorrelativeDetail - Detalles completos de un correlativo fiscal
 *
 * NOTA: El API de detalle usa CompanyName (PascalCase), no companyName.
 */
export interface FiscalCorrelativeDetail {
  corrBillId: number;
  corrBillInitNum: number;
  corrBillEndNum: number;
  corrBillLastNumUsed: number;
  corrBillCAI: string;
  CompanyName: string; // IMPORTANTE: PascalCase (así viene del API)
  BusinessName: string;
  corrBillDateFrom: string; // ISO date string
  corrBillDateUntil: string; // ISO date string
  pointEmissionId: number;
  establishmentId: number;
  documentTypeId: number;
  companyCod: number;
  corrBillStatusSeries: string;
  corrBillActive: boolean;
  corrBillPhotoLogo: string;
  corrBillCountryId: number;
  corrBillCountryName: string;
}

/**
 * FiscalCorrelativeListResponse - Respuesta del endpoint de listado
 */
export interface FiscalCorrelativeListResponse {
  data: FiscalCorrelative[];
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
 * CreateFiscalCorrelativeRequest - Estructura para crear correlativo fiscal
 */
export interface CreateFiscalCorrelativeRequest {
  CodEmpresa: number;
  CodPais: number;
  CodEstablecimiento: number;
  PuntoEmision: number;
  TipoDocumento: number;
  CAI: string;
  FechaInicio: string; // ISO date string
  FechaFinal: string; // ISO date string
  NumeroInicial: number;
  NumeroFinal: number;
}

/**
 * UpdateFiscalCorrelativeRequest - Estructura para editar correlativo fiscal
 */
export interface UpdateFiscalCorrelativeRequest {
  CodEmpresa: number;
  CodPais: number;
  CodEstablecimiento: number;
  PuntoEmision: number;
  TipoDocumento: number;
  CAI: string;
  FechaInicio: string; // ISO date string
  FechaFinal: string; // ISO date string
  NumeroInicial: number;
  NumeroFinal: number;
}

/**
 * CompanySummary - Empresa para el select
 */
export interface CompanySummary {
  companyId: number;
  companyName: string;
}

/**
 * CountrySummary - País para el select
 */
export interface CountrySummary {
  countryId: number;
  countryName: string;
  countryUrlFlag: string;
}

/**
 * EstablishmentSummary - Establecimiento para el select
 */
export interface EstablishmentSummary {
  establishmentsId: number;
  establishmentsName: string;
}

/**
 * EmissionPointSummary - Punto de emisión para el select
 */
export interface EmissionPointSummary {
  emissionPointId: number;
  emissionPointName: string;
}

/**
 * DocumentTypeSummary - Tipo de documento para el select
 */
export interface DocumentTypeSummary {
  docTypeId: number;
  docTypeName: string;
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
