/**
 * API Models
 *
 * Models for API request/response structures
 * These match the backend API format and are mapped to internal models
 */

/**
 * API Response Metadata for pagination
 */
export interface ApiMetadata {
  page: number;
  perPage: number;
  pageCount: number;
  totalCount: number;
  totalActive: number;
  totalInactive: number;
  totalLockedPenalty: number;
}

/**
 * User API Response
 */
export interface ApiUserRecord {
  id: string;
  userName: string;
  createdAt: string;
  email: string;
  phoneNumber: string;
  assignedCountry: string;
  assignedCity: string;
  isActive: boolean;
  roleId: string;
  role: string;
  profileImage: string | null;
  cityId: number;
  countryId: number;
  flag?: string;
}

/**
 * Users list response
 */
export interface ApiUsersListResponse {
  metadata: ApiMetadata;
  records: ApiUserRecord[];
}

/**
 * New user request
 */
export interface ApiNewUserRequest {
  userName: string;
  email: string;
  phoneNumber: string;
  assignedCountry: string;
  assignedCity: string;
  isActive: boolean;
  roleId: string;
  role: string;
  profileImage: string | null;
  password: string;
  cityId: number;
  countryId: number;
}

/**
 * Update user request
 */
export interface ApiUpdateUserRequest {
  id: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  assignedCountry?: string;
  assignedCity?: string;
  isActive?: boolean;
  roleId?: string;
  role?: string;
  profileImage?: string;
  password?: string;
  cityId?: number;
  countryId?: number;
}

/**
 * Role API Response
 */
export interface ApiRoleData {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

/**
 * Roles list response
 */
export interface ApiRolesListResponse {
  data: ApiRoleData[];
  metadata: ApiMetadata;
}

/**
 * Role summary (simple list)
 */
export interface ApiRoleSummary {
  id: string;
  name: string;
}

/**
 * Module in hierarchy (3-level structure)
 */
export interface ApiModule {
  id: number;
  name: string;
  subModules: ApiModule[];
  active: boolean;
}

/**
 * User assigned to role
 */
export interface ApiUserAssigned {
  userId: string;
  email: string | null;
  name: string | null;
  createdAt: string;
  roleName: string;
}

/**
 * Role details with modules and users
 */
export interface ApiRoleDetails {
  id: string;
  name: string;
  description: string;
  active: boolean;
  modules: ApiModule[];
  users: ApiUserAssigned[];
}

/**
 * New role request
 */
export interface ApiNewRoleRequest {
  id: null;
  name: string;
  permissionsToRemove: null;
  permissionsToAdd: number[];
  usersToRemove: null;
}

/**
 * Update role request
 */
export interface ApiUpdateRoleRequest {
  id: string;
  name: string;
  permissionsToRemove: number[];
  permissionsToAdd: number[];
  usersToRemove: string[];
}

/**
 * City from location API
 */
export interface ApiCity {
  cityId: number;
  codCountry: number;
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
  countryUrlFlag: string;
}

/**
 * Country from location API
 */
export interface ApiCountry {
  countryId: number;
  countryName: string;
  countryCode: string;
  isActive: boolean;
  countryPrefix: string;
  countryUrlFlag: string;
  countryMask: string;
}

/**
 * Image upload response
 */
export interface ApiUploadImageResponse {
  presignedUrl: string;
  url: string;
}

/**
 * Image upload request
 */
export interface ApiUploadImageRequest {
  image: string;
  folder: string;
}
