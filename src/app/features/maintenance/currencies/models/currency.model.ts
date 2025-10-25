/**
 * Currency Models
 *
 * Modelos para el módulo de Monedas y Países
 */

// ============================================================================
// Local Models
// ============================================================================

/**
 * Currency - Modelo local de moneda
 */
export interface Currency {
  id: number;
  name: string;           // Nombre del país
  flag: string;           // URL de la bandera
  title: string;          // Nombre de la moneda
  code: string;           // Acrónimo (ej: HNL, USD)
  symbolLeft: string;     // Símbolo (ej: L, $)
  status: boolean;        // true = activo, false = inactivo
  countryId: number;      // ID del país
}

/**
 * Country - Modelo de país
 */
export interface Country {
  countryId: number;
  countryName: string;
  countryCode: string;
  isActive: boolean;
  countryPrefix: string;
  countryUrlFlag: string;
  countryMask: string;
}

// ============================================================================
// API Response Models
// ============================================================================

/**
 * CurrencyResponse - Respuesta del API
 */
export interface CurrencyResponse {
  id: number | null;
  name: string | null;
  flag: string | null;
  title: string | null;
  code: string | null;
  symbolLeft: string | null;
  status: boolean | null;
  countryId: number | null;
}

/**
 * CurrencyMetadata - Metadata de paginación
 */
export interface CurrencyMetadata {
  totalActive: number;
  totalInactive: number;
  page: number;
  perPage: number;
  pageCount: number;
  totalCount: number;
}

/**
 * CurrenciesResponse - Respuesta completa del API
 */
export interface CurrenciesResponse {
  data: CurrencyResponse[];
  metadata: CurrencyMetadata;
}

// ============================================================================
// API Request Models
// ============================================================================

/**
 * CurrencyCreateRequest - Request para crear moneda
 */
export interface CurrencyCreateRequest {
  name: string;
  flag: string;
  title: string;
  code: string;
  symbolLeft: string;
  status: boolean;
  countryId: number;
}

/**
 * CurrencyUpdateRequest - Request para actualizar moneda
 * Permite valores null para actualizar solo campos específicos
 */
export interface CurrencyUpdateRequest {
  id: number | null;
  name: string | null;
  flag: string | null;
  title: string | null;
  code: string | null;
  symbolLeft: string | null;
  status: boolean | null;
  countryId: number | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Crea una moneda vacía
 */
export function emptyCurrency(): Currency {
  return {
    id: 0,
    name: '',
    flag: '',
    title: '',
    code: '',
    symbolLeft: '',
    status: true,
    countryId: 0
  };
}

/**
 * Convierte CurrencyResponse del API a Currency local
 */
export function currencyResponseToCurrency(response: CurrencyResponse): Currency {
  return {
    id: response.id ?? 0,
    name: response.name ?? '',
    flag: response.flag ?? '',
    title: response.title ?? '',
    code: response.code ?? '',
    symbolLeft: response.symbolLeft ?? '',
    status: response.status ?? true,
    countryId: response.countryId ?? 0
  };
}

/**
 * Convierte Currency a CurrencyCreateRequest
 */
export function currencyToCreateRequest(currency: Currency): CurrencyCreateRequest {
  return {
    name: currency.name,
    flag: currency.flag,
    title: currency.title,
    code: currency.code,
    symbolLeft: currency.symbolLeft,
    status: currency.status,
    countryId: currency.countryId
  };
}

/**
 * Convierte Currency a CurrencyUpdateRequest
 */
export function currencyToUpdateRequest(currency: Currency): CurrencyUpdateRequest {
  return {
    id: currency.id,
    name: currency.name,
    flag: currency.flag,
    title: currency.title,
    code: currency.code,
    symbolLeft: currency.symbolLeft,
    status: currency.status,
    countryId: currency.countryId
  };
}

/**
 * Crea un CurrencyUpdateRequest con solo los campos que cambiaron
 * Útil para optimizar las actualizaciones
 */
export function createPartialUpdateRequest(
  original: Currency,
  updated: Currency
): CurrencyUpdateRequest {
  return {
    id: updated.id !== original.id ? updated.id : null,
    name: updated.name !== original.name ? updated.name : null,
    flag: updated.flag !== original.flag ? updated.flag : null,
    title: updated.title !== original.title ? updated.title : null,
    code: updated.code !== original.code ? updated.code : null,
    symbolLeft: updated.symbolLeft !== original.symbolLeft ? updated.symbolLeft : null,
    status: updated.status !== original.status ? updated.status : null,
    countryId: updated.countryId !== original.countryId ? updated.countryId : null
  };
}

/**
 * Crea un CurrencyUpdateRequest para toggle de estado
 */
export function createStatusToggleRequest(newStatus: boolean): CurrencyUpdateRequest {
  return {
    id: null,
    name: null,
    flag: null,
    title: null,
    code: null,
    symbolLeft: null,
    status: newStatus,
    countryId: null
  };
}
