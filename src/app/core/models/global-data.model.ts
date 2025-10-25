/**
 * Global Data Models
 *
 * Modelos para data global que se usa en toda la aplicación:
 * - Channels (Canales)
 * - Brands (Marcas)
 * - Cities (Ciudades)
 * - Countries (Países)
 * - Payment Methods (Métodos de Pago)
 */

// ============================================================================
// CHANNELS
// ============================================================================

export interface Channel {
  id: number;
  description: string;
  isActive: boolean | null;
  iconUrl: string | null;
}

export interface ChannelResponse {
  idChannel: number;
  descriptionChannel: string;
  isActiveChannel: boolean | null;
  iconUrlChannel: null | string;
}

// ============================================================================
// BRANDS
// ============================================================================

export interface Brand {
  id: number;
  name: string;
  logo: string;
  sortOrder: number;
}

export interface BrandResponse {
  idBrand: number;
  nameBrand: string;
  logoBrand: string;
  sortOrderBrand: number;
}

// ============================================================================
// CITIES
// ============================================================================

export interface City {
  id: number;
  countryCode: number;
  countryUrlFlag: string;
  countryName: string;
  name: string;
  code: string;
  isActive: boolean;
  couponMin: number;
  publish: boolean;
  zoneCode: number;
  zoneName: string;
  orderMin: number;
  freeShipping: boolean;
  facPayment: boolean;
}

export interface CityResponse {
  cityId: number;
  codCountry: number;
  countryUrlFlag: string;
  countryName: string;
  cityName: string;
  cityCode: string;
  isActive: boolean;
  couponMin: number;
  publish: boolean;
  codZone: number;
  zoneName: string;
  orderMin: number;
  freeShipping: boolean;
  faCpayment: boolean;
}

export interface CityShort {
  id: number;
  name: string;
}

export interface CityShortResponse {
  cityId: number;
  cityName: string;
}

// ============================================================================
// COUNTRIES
// ============================================================================

export interface Country {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  prefix: string;
  urlFlag: string;
  mask: string;
}

export interface CountryResponse {
  countryId: number;
  countryName: string;
  countryCode: string;
  isActive: boolean;
  countryPrefix: string;
  countryUrlFlag: string;
  countryMask: string;
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export interface PaymentMethod {
  id: number;
  name: string;
  isActive: boolean;
}

export interface PaymentMethodResponse {
  id: number;
  name: string;
  isActive: boolean;
}
