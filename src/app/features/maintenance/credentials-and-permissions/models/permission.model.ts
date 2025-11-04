/**
 * Permission Models
 *
 * Models for hierarchical permission system with 3 levels:
 * Module -> Submodule -> Permission
 */

/**
 * Permission (Level 3) - Specific action within a submodule
 */
export interface Permission {
  permissionId: number;
  permissionName: string;
  permissionDescription: string;
  permissionActive: boolean;
  submoduleId: number;
}

/**
 * Submodule (Level 2) - Group of related permissions
 */
export interface Submodule {
  submoduleId: number;
  submoduleName: string;
  submoduleDescription: string;
  submoduleActive: boolean;
  moduleId: number;
  permissions: Permission[];
}

/**
 * Module (Level 1) - Top-level permission grouping
 */
export interface Module {
  moduleId: number;
  moduleName: string;
  moduleDescription: string;
  moduleActive: boolean;
  submodules: Submodule[];
}

/**
 * Complete permission hierarchy
 */
export interface PermissionHierarchy {
  modules: Module[];
}

/**
 * Flat permission for assignment
 */
export interface FlatPermission {
  permissionId: number;
  permissionName: string;
  permissionDescription: string;
  submoduleName: string;
  moduleName: string;
}

/**
 * Permission tree node for UI rendering
 * Supports both module, submodule, and permission nodes
 */
export interface PermissionTreeNode {
  id: string;
  label: string;
  data: Module | Submodule | Permission;
  type: 'module' | 'submodule' | 'permission';
  children?: PermissionTreeNode[];
  selectable: boolean;
  selected?: boolean;
  partialSelected?: boolean;
}

/**
 * Role permissions response
 */
export interface RolePermissions {
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

/**
 * Permission change for role update
 */
export interface PermissionChange {
  add: number[];
  remove: number[];
}

/**
 * Helper to convert hierarchy to tree nodes
 */
export function convertToTreeNodes(
  modules: Module[],
  selectedPermissionIds: number[] = []
): PermissionTreeNode[] {
  return modules.map(module => ({
    id: `module-${module.moduleId}`,
    label: module.moduleName,
    data: module,
    type: 'module' as const,
    selectable: false,
    children: module.submodules.map(submodule => ({
      id: `submodule-${submodule.submoduleId}`,
      label: submodule.submoduleName,
      data: submodule,
      type: 'submodule' as const,
      selectable: false,
      children: submodule.permissions.map(permission => ({
        id: `permission-${permission.permissionId}`,
        label: permission.permissionName,
        data: permission,
        type: 'permission' as const,
        selectable: true,
        selected: selectedPermissionIds.includes(permission.permissionId)
      }))
    }))
  }));
}

/**
 * Helper to extract selected permission IDs from tree nodes
 */
export function extractSelectedPermissionIds(nodes: PermissionTreeNode[]): number[] {
  const ids: number[] = [];

  function traverse(node: PermissionTreeNode): void {
    if (node.type === 'permission' && node.selected) {
      ids.push((node.data as Permission).permissionId);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  nodes.forEach(traverse);
  return ids;
}
