import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import {
  type Role,
  type RoleWithPermissionCount,
  type CreateRoleRequest,
  type UpdateRoleRequest,
  type RoleFilterCriteria,
  type PaginatedRolesResponse,
  type Module,
  type Permission,
  type ApiRolesListResponse,
  type ApiRoleData,
  type ApiRoleSummary,
  type ApiRoleDetails,
  type ApiNewRoleRequest,
  type ApiUpdateRoleRequest,
  type ApiModule
} from '../models';

/**
 * RoleService
 *
 * Service for managing roles and permissions
 * Handles CRUD operations, permission hierarchy, and role-user assignments
 */
@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly dataService = inject(DataService);

  // State signals
  readonly roles = signal<RoleWithPermissionCount[]>([]);
  readonly roleSummary = signal<{ roleId: string; roleName: string }[]>([]);
  readonly permissionHierarchy = signal<Module[]>([]);
  readonly isLoading = signal(false);
  readonly totalRecords = signal(0);
  readonly totalActive = signal(0);
  readonly totalInactive = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly selectedRole = signal<ApiRoleDetails | null>(null);

  /**
   * Get paginated roles list with filters
   */
  getRoles(criteria: RoleFilterCriteria): Observable<PaginatedRolesResponse> {
    this.isLoading.set(true);

    const params: Record<string, string | number> = {
      pageNumber: criteria.page + 1, // API is 1-indexed
      pageSize: criteria.pageSize
    };

    if (criteria.search) {
      params['filter'] = criteria.search;
    }

    if (criteria.roleActive !== undefined) {
      params['status'] = criteria.roleActive ? 'true' : 'false';
    }

    return this.dataService.get$<ApiRolesListResponse>('Access/roles', params).pipe(
      map(response => this.mapApiResponseToModel(response)),
      tap(response => {
        this.roles.set(response.data);
        this.totalRecords.set(response.total);
        this.totalActive.set(response.metadata?.totalActive ?? 0);
        this.totalInactive.set(response.metadata?.totalInactive ?? 0);
        this.currentPage.set(criteria.page);
        this.pageSize.set(criteria.pageSize);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Get simple roles summary (for dropdowns)
   */
  getRolesSummary(): Observable<{ roleId: string; roleName: string }[]> {
    return this.dataService.get$<ApiRoleSummary[]>('Access/roles/summary').pipe(
      map(roles => roles.map(role => ({
        roleId: role.id, // UUID string
        roleName: role.name
      }))),
      tap(roles => this.roleSummary.set(roles))
    );
  }

  /**
   * Get role details with modules and assigned users
   */
  getRoleById(roleId: string): Observable<ApiRoleDetails> {
    this.isLoading.set(true);

    return this.dataService.get$<ApiRoleDetails>(`Access/roles/${roleId}`).pipe(
      tap(role => {
        this.selectedRole.set(role);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Get default role template with all available modules
   */
  getDefaultRoleTemplate(): Observable<Module[]> {
    this.isLoading.set(true);

    return this.dataService.get$<ApiRoleDetails>('Access/roles/default').pipe(
      map(response => this.mapApiModulesToModel(response.modules)),
      tap(modules => {
        this.permissionHierarchy.set(modules);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Create new role
   */
  createRole(request: CreateRoleRequest): Observable<Role> {
    this.isLoading.set(true);

    const apiRequest: ApiNewRoleRequest = {
      id: null,
      name: request.roleName,
      permissionsToRemove: null,
      permissionsToAdd: request.permissions,
      usersToRemove: null
    };

    return this.dataService.post$<ApiRoleData>('Access/roles', apiRequest).pipe(
      map(data => this.mapApiRoleDataToRole(data)),
      tap(role => {
        // Reload roles list to get updated data
        this.totalRecords.update(count => count + 1);
        this.totalActive.update(count => count + 1);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Update existing role
   */
  updateRole(roleId: string, request: UpdateRoleRequest): Observable<Role> {
    this.isLoading.set(true);

    const apiRequest: ApiUpdateRoleRequest = {
      id: roleId,
      name: request.roleName,
      permissionsToRemove: request.removePermissions,
      permissionsToAdd: request.addPermissions,
      usersToRemove: request.removeUsers || []
    };

    return this.dataService.put$<ApiRoleData>(`Access/roles/${roleId}`, apiRequest).pipe(
      map(data => this.mapApiRoleDataToRole(data)),
      tap(role => {
        // Update in local state
        this.roles.update(list =>
          list.map(r => (r.roleId === roleId ? { ...r, roleName: role.roleName } : r))
        );
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Toggle role active status
   * Note: API might not have this endpoint, would need to use update instead
   */
  toggleRoleStatus(roleId: string, isActive: boolean): Observable<void> {
    this.isLoading.set(true);

    // If API doesn't have status endpoint, use update endpoint
    return this.dataService.put$<void>(`Access/roles/${roleId}/status?status=${isActive}`, {}).pipe(
      tap(() => {
        // Update in local state
        this.roles.update(list =>
          list.map(r =>
            r.roleId === roleId ? { ...r, roleActive: isActive } : r
          )
        );

        // Update counts
        if (isActive) {
          this.totalActive.update(count => count + 1);
          this.totalInactive.update(count => count - 1);
        } else {
          this.totalActive.update(count => count - 1);
          this.totalInactive.update(count => count + 1);
        }

        this.isLoading.set(false);
      })
    );
  }

  /**
   * Extract all permission IDs from module hierarchy
   */
  extractPermissionIds(modules: ApiModule[]): number[] {
    const ids: number[] = [];

    function traverse(module: ApiModule): void {
      if (module.active) {
        // If this is a leaf node (permission), add its ID
        if (!module.subModules || module.subModules.length === 0) {
          ids.push(module.id);
        }
        // Recursively process children
        if (module.subModules) {
          module.subModules.forEach(traverse);
        }
      }
    }

    modules.forEach(traverse);
    return ids;
  }

  /**
   * Calculate permission changes between original and updated modules
   */
  calculatePermissionChanges(
    originalModules: ApiModule[],
    updatedModules: ApiModule[]
  ): { add: number[]; remove: number[] } {
    const originalIds = new Set(this.extractPermissionIds(originalModules));
    const updatedIds = new Set(this.extractPermissionIds(updatedModules));

    const add = Array.from(updatedIds).filter(id => !originalIds.has(id));
    const remove = Array.from(originalIds).filter(id => !updatedIds.has(id));

    return { add, remove };
  }

  /**
   * Map API response to internal model
   */
  private mapApiResponseToModel(response: ApiRolesListResponse): PaginatedRolesResponse {
    return {
      data: response.data.map(data => ({
        ...this.mapApiRoleDataToRole(data),
        permissionCount: 0, // API doesn't provide this in list view
        userCount: 0 // API doesn't provide this in list view
      })),
      total: response.metadata.totalCount,
      page: response.metadata.page - 1, // Convert to 0-indexed
      pageSize: response.metadata.perPage,
      totalPages: response.metadata.pageCount,
      metadata: {
        totalActive: response.metadata.totalActive,
        totalInactive: response.metadata.totalInactive
      }
    };
  }

  /**
   * Map API role data to Role model
   */
  private mapApiRoleDataToRole(data: ApiRoleData): Role {
    return {
      roleId: data.id, // UUID string, no parsing needed
      roleName: data.name,
      roleDescription: data.description,
      roleActive: data.active,
      createdAt: '', // API doesn't provide timestamps
      updatedAt: ''
    };
  }

  /**
   * Map API modules to internal Module model
   */
  private mapApiModulesToModel(apiModules: ApiModule[]): Module[] {
    return apiModules.map(apiModule => this.mapApiModuleToModule(apiModule));
  }

  /**
   * Recursively map API module to internal model
   */
  private mapApiModuleToModule(apiModule: ApiModule): Module {
    return {
      moduleId: apiModule.id,
      moduleName: apiModule.name,
      moduleDescription: '',
      moduleActive: apiModule.active,
      submodules: apiModule.subModules.map(sub => ({
        submoduleId: sub.id,
        submoduleName: sub.name,
        submoduleDescription: '',
        submoduleActive: sub.active,
        moduleId: apiModule.id,
        permissions: sub.subModules.map(perm => ({
          permissionId: perm.id,
          permissionName: perm.name,
          permissionDescription: '',
          permissionActive: perm.active,
          submoduleId: sub.id
        }))
      }))
    };
  }

  /**
   * Clear selected role
   */
  clearSelection(): void {
    this.selectedRole.set(null);
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.roles.set([]);
    this.roleSummary.set([]);
    this.permissionHierarchy.set([]);
    this.totalRecords.set(0);
    this.totalActive.set(0);
    this.totalInactive.set(0);
    this.currentPage.set(0);
    this.selectedRole.set(null);
    this.isLoading.set(false);
  }
}
