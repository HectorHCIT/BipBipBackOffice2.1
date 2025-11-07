/**
 * Registered User Models
 * Models for the Registered Users (Usuarios Registrados) module
 */

/**
 * User record displayed in the main table
 */
export interface RegisteredUserRecord {
  customerId: number;
  customerFullName: string;
  customerPhone: string;
  email: string;
  idCountry: number;
  countryName: string;
  idCity: number;
  cityName: string;
  customerCreatedAt: string;
  customerModifiedAt: string;
  daysRegistered: number;
  idLoyaltyLevel: number;
  nameLoyaltyLevel: string;
  pointsEarned: number;
  customerStatus: boolean;
  isBlocked: boolean;
}

/**
 * Metadata for pagination and status counts
 */
export interface RegisteredUsersMetadata {
  page: number;
  perPage: number;
  pageCount: number;
  totalActive: number;
  totalInactive: number;
  totalLockedPenalty: number;
  totalCount: number;
}

/**
 * API Response for registered users list
 */
export interface RegisteredUsersResponse {
  data: RegisteredUserRecord[];
  metadata: RegisteredUsersMetadata;
}

/**
 * Filter parameters for the registered users list
 */
export interface RegisteredUsersFilters {
  status: 'all' | 'active' | 'inactive' | 'blocked';
  filter: string;
  from: string | null;
  to: string | null;
  countries: number[];
  cities: number[];
  pageNumber: number;
  pageSize: number;
}

/**
 * Country model for location filters
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

/**
 * City model for location filters
 */
export interface City {
  cityId: number;
  codCountry: number;
  countryUrlFlag: string | null;
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
