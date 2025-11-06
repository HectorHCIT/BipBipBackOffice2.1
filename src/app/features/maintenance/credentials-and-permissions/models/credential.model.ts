/**
 * Credential Models
 *
 * Models for user credentials management including user data,
 * profile images, and credential operations
 */

/**
 * Main credential interface representing a user in the system
 */
export interface Credential {
  userId: string;
  userName: string;
  userLastName: string;
  userFullName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  userActive: boolean;
  userImage: string | null;
  userImageKey: string | null;
  roleId: string;
  roleName: string;
  countryId: number;
  countryName: string;
  cityId: number;
  cityName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Credential with role information
 */
export interface CredentialWithRole extends Credential {
  role: {
    roleId: string;
    roleName: string;
  };
}

/**
 * Request for creating a new credential
 */
export interface CreateCredentialRequest {
  userName: string;
  userLastName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  userPassword: string;
  roleId: string;
  countryId: number;
  cityId: number;
  userImageKey?: string | null;
}

/**
 * Request for updating an existing credential
 */
export interface UpdateCredentialRequest {
  userName: string;
  userLastName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  userPassword?: string;
  roleId: string;
  countryId: number;
  cityId: number;
  userImageKey?: string | null;
}

/**
 * Request for changing user status
 */
export interface ChangeCredentialStatusRequest {
  userActive: boolean;
}

/**
 * Password validation requirements
 */
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
}

/**
 * Default password requirements
 */
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true
};

/**
 * Credential filter criteria for search and pagination
 */
export interface CredentialFilterCriteria {
  search?: string;
  countryId?: number;
  cityId?: number;
  roleId?: string;
  userActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}

/**
 * Paginated credential response
 */
export interface PaginatedCredentialsResponse {
  data: Credential[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  metadata?: {
    totalActive: number;
    totalInactive: number;
  };
}
