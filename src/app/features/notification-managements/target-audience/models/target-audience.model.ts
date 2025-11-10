/**
 * Target Audience Model
 * Represents a target audience configuration in the system
 */
export interface TargetAudience {
  audienciaId: number;
  nameCriteria: string;
  descCriteria: string;
  statusCriteria: boolean;
  AlcanceEstimado: number;
  sexCriteria: string;
  ageCriteria: string;
  dateEntryCriteria: string;
}

/**
 * Target Audience Form Data
 * Used for create/edit forms
 */
export interface TargetAudienceForm {
  name: string;
  description: string;
  cityIds: number[];
  ageRange?: {
    min?: number;
    max?: number;
  };
  gender?: string;
  isActive: boolean;
}

/**
 * Sex Criteria for filtering by gender
 */
export interface SexCriteria {
  isActive: boolean;
  valueSex: number[]; // [1] = male, [2] = female, [1, 2] = both
}

/**
 * Age Criteria for filtering by age range
 */
export interface AgeCriteria {
  isActive: boolean;
  valueAge: number[]; // [minAge] or [minAge, maxAge]
}

/**
 * Entry Date Criteria for filtering by registration date
 */
export interface EntryDate {
  isActive: boolean;
  initValue: Date;
  isLimit: boolean;
  limitValue: Date | null;
}

/**
 * General Target Objective DTO (for Create/Update/EstimatedScope)
 */
export interface GeneralTargetObjective {
  nameTP: string;
  idCountryTP: number;
  idCitiesTP: number[];
  sexCriteria: SexCriteria | null;
  ageCriteria: AgeCriteria | null;
  entryDate: EntryDate | null;
}

/**
 * Estimated Scope Response
 */
export interface EstimatedScopeResponse {
  scope: number;
}

/**
 * Target Audience Detail (from TargetAudienceById endpoint)
 */
export interface TargetAudienceDetail {
  audienciaId: number;
  nameCriteria: string;
  descCriteria: string;
  statusCriteria: boolean;
  AlcanceEstimado: number;
  sexCriteria: string;
  ageCriteria: string;
  dateEntryCriteria: string;
  // Full criteria details
  idCountryTP?: number;
  idCitiesTP?: number[];
  sexCriteriaObj?: SexCriteria;
  ageCriteriaObj?: AgeCriteria;
  entryDateObj?: EntryDate;
}

/**
 * City Model (from API)
 */
export interface CitiesSimple {
  cityId: number;
  cityName: string;
  isActive: boolean;
}

/**
 * Country with Cities
 */
export interface CountryList {
  countryId: number;
  countryName: string;
  isActive: boolean;
  citiesSimples: CitiesSimple[];
}

/**
 * API Metadata for paginated responses
 */
export interface ApiMetadata {
  totalActive: number;
  totalInactive: number;
  page: number;
  perPage: number;
  pageCount: number;
  totalCount: number;
}

/**
 * Paginated Response Generic
 */
export interface PaginatedResponse<T> {
  data: T[];
  metadata: ApiMetadata;
}

/**
 * Table Filter State
 */
export interface TargetAudienceFilters {
  search?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
}
