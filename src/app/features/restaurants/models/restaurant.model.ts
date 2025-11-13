/**
 * Restaurant Features Status
 * Represents the operational status flags for a restaurant
 */
export interface RESTFeaturesStatus {
  takeAwayDelivery: boolean;
  delivery: boolean;
  restaurant: boolean;
}

/**
 * Restaurant
 * Main restaurant entity as returned by the list endpoint
 */
export interface Restaurant {
  restId: number;
  restName: string;
  restCountryId: number;
  restCountryName: string;
  restUrllogo: string;
  restAddress: string;
  restBrandId: number;
  restBrandName: string;
  restShortName: string;
  restStatus: boolean;
  restFeaturesStatus: RESTFeaturesStatus;
  active: boolean;
  publish: boolean;
}

/**
 * Restaurant List Metadata
 * Pagination and count information from the API
 */
export interface RestaurantListMetadata {
  page: number;
  perPage: number;
  pageCount: number;
  totalActive: number;
  totalInactive: number;
  totalLockedPenalty: number;
  totalCount: number;
}

/**
 * Restaurant List Response
 * API response structure for the restaurant list endpoint
 */
export interface RestaurantListResponse {
  metadata: RestaurantListMetadata;
  records: Restaurant[];
}

/**
 * Status Filter
 * Represents a filter option for restaurant status with counter
 */
export interface StatusFilter {
  idStatus: number; // -1 = All, 1 = Active, 0 = Inactive
  label: string;
  filter: string | null; // 'true' | 'false' | null
  qty: number;
}

/**
 * Restaurant Filters
 * Represents all applied filters for the restaurant list
 */
export interface RestaurantFilters {
  page: number;
  pageSize: number;
  statusActive?: boolean;
  statusInactive?: boolean;
  countries?: number[];
  cities?: number[];
  search?: string;
}

/**
 * Country
 * Country entity for filters
 */
export interface Country {
  countryId: number;
  countryName: string;
}

/**
 * City
 * City entity from CityList endpoint
 */
export interface City {
  cityId: number;
  cityName: string;
  cityCode: string;
  codCountry: number;
  countryName: string;
  countryUrlFlag: string;
  isActive: boolean;
  couponMin: number;
  publish: boolean;
  codZone: number;
  zoneName: string;
  orderMin: number;
  freeShipping: boolean;
  faCpayment: boolean;
}

/**
 * Restaurant Details
 * Full restaurant details from API detail endpoint
 */
export interface RestaurantDetails {
  restId: number;
  restName: string;
  restAddress: string;
  restShortName: string;
  restLat: number;
  restLon: number;
  restCountryId: number;
  restCityId: number;
  restBrandId: number;
  restUrllogo: string;
  restCodPostGC: string;
  accessPIN: string;
  link: string;
  restStatus: boolean;
  isHeadquarter: boolean;

  // Related data
  restCountryName?: string;
  restCityName?: string;
  restBrandName?: string;
  restBrandLogo?: string;

  // Schedules - from schedule.model.ts
  restSchedules?: import('./schedule.model').RESTSchedule[];

  // Coverage zones - from coverage-zone.model.ts
  restDeliveriesZones?: import('./coverage-zone.model').RESTDeliveriesZone[];
  driverRestDelZones?: import('./coverage-zone.model').DriverRESTDelZone[];
}

/**
 * Brand
 * Brand entity for dropdown selection
 */
export interface Brand {
  idBrand: number;
  nameBrand: string;
  logoBrand: string;
  imageBrand: string;
  imageMenuBrand: string;
  shortNameBrand: string;
  isSendOrder: boolean;
  urlLogoHeader: string;
  codePayingPosgc: number;
  isActiveBrand: boolean;
  position: number;
  totalRestaurants: number;
}

/**
 * Create Restaurant Request
 * Request payload for creating a new restaurant
 */
export interface CreateRestaurantRequest {
  restName: string;
  restAddress: string;
  restShortName: string;
  restLat: number;
  restLon: number;
  restCountryId: number;
  restCityId: number;
  restBrandId: number;
  restUrllogo: string;
  restCodPostGC: string;
  accessPIN: string;
  link: string;
  restStatus: boolean;
  isHeadquarter: boolean;
}

/**
 * Update Restaurant Request
 * Request payload for updating an existing restaurant
 */
export interface UpdateRestaurantRequest {
  restId: number;
  restName: string;
  restAddress: string;
  restShortName: string;
  restLat: number;
  restLon: number;
  restCountryId: number;
  restCityId: number;
  restBrandId: number;
  restUrllogo: string;
  restCodPostGC: string;
  accessPIN: string;
  link: string;
  restStatus: boolean;
  isHeadquarter: boolean;
}
