/**
 * Role Models
 *
 * Models for role management including hierarchical permissions
 * and role operations
 */

/**
 * Main role interface
 */
export interface Role {
  roleId: string;
  roleName: string;
  roleDescription: string;
  roleActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Role with permission count
 */
export interface RoleWithPermissionCount extends Role {
  permissionCount: number;
  userCount: number;
}

/**
 * Request for creating a new role
 */
export interface CreateRoleRequest {
  roleName: string;
  roleDescription: string;
  permissions: number[];
}

/**
 * Request for updating an existing role
 */
export interface UpdateRoleRequest {
  roleName: string;
  roleDescription: string;
  addPermissions: number[];
  removePermissions: number[];
  removeUsers?: string[]; // Optional: User IDs to remove from role
}

/**
 * Request for changing role status
 */
export interface ChangeRoleStatusRequest {
  roleActive: boolean;
}

/**
 * Role filter criteria for search and pagination
 */
export interface RoleFilterCriteria {
  search?: string;
  roleActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}

/**
 * Paginated role response
 */
export interface PaginatedRolesResponse {
  data: RoleWithPermissionCount[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  metadata?: {
    totalActive: number;
    totalInactive: number;
  };
}

/**
 * Role assignment to user
 */
export interface RoleAssignment {
  userId: number;
  roleId: string;
}

/**
 * Users assigned to a role
 */
export interface RoleUsers {
  roleId: string;
  roleName: string;
  users: {
    userId: number;
    userName: string;
    userFullName: string;
    userEmail: string;
  }[];
}
