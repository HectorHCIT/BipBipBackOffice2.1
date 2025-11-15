import { Component, ChangeDetectionStrategy, signal, computed, inject, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { RoleService } from '../../../services/role.service';
import { type RoleWithPermissionCount, type ApiModule, type ApiUserAssigned } from '../../../models';

/**
 * RoleFormComponent
 *
 * Drawer form for creating and editing roles with permission assignment
 * Features:
 * - CREATE/EDIT modes based on role input
 * - 3-level permission tree (Module → Submodule → Permission)
 * - Cascade selection logic
 * - Tracks permission changes for efficient updates
 */
@Component({
  selector: 'app-role-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DrawerModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    DividerModule,
    PaginatorModule
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-form.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RoleFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);

  // Inputs and outputs
  readonly role = input<RoleWithPermissionCount | null>(null);
  readonly formClosed = output<boolean>();

  // State signals
  readonly loading = signal(false);
  readonly permissionModules = signal<ApiModule[]>([]);
  readonly selectedPermissions = signal<Set<number>>(new Set());
  readonly originalPermissions = signal<Set<number>>(new Set());

  // Permission change tracking (for edit mode)
  readonly permissionsToAdd = signal<number[]>([]);
  readonly permissionsToRemove = signal<number[]>([]);

  // Users assigned to role
  readonly assignedUsers = signal<ApiUserAssigned[]>([]);
  readonly usersToRemove = signal<string[]>([]); // User IDs to remove

  // User pagination
  readonly usersPage = signal(0);
  readonly usersPageSize = signal(5);

  // Computed signals
  readonly isEditMode = computed(() => this.role() !== null);
  readonly selectedPermissionCount = computed(() => this.collectActivePermissionIds().length);
  readonly totalUsers = computed(() => this.assignedUsers().length);
  readonly paginatedUsers = computed(() => {
    const users = this.assignedUsers();
    const page = this.usersPage();
    const pageSize = this.usersPageSize();
    const start = page * pageSize;
    const end = start + pageSize;
    return users.slice(start, end);
  });

  // Drawer visibility
  visible = true;

  // Form with typed controls
  readonly form: FormGroup<{
    roleName: FormControl<string>;
    roleDescription: FormControl<string>;
  }>;

  constructor() {
    // Initialize form with non-nullable controls
    this.form = this.fb.nonNullable.group({
      roleName: ['', [Validators.required, Validators.minLength(3)]],
      roleDescription: ['']
    });

    // Effect to load role data when role input changes
    effect(() => {
      const roleData = this.role();
      if (roleData) {
        this.loadRoleData(roleData);
      } else {
        this.loadDefaultTemplate();
      }
    });
  }

  /**
   * Load role data for edit mode
   */
  private loadRoleData(role: RoleWithPermissionCount): void {
    this.loading.set(true);



    // Set form values
    this.form.patchValue({
      roleName: role.roleName,
      roleDescription: role.roleDescription
    });

    // Load role permissions and users
    this.roleService.getRoleById(role.roleId).subscribe({
      next: (roleWithPermissions) => {
        this.permissionModules.set(roleWithPermissions.modules);
        this.assignedUsers.set(roleWithPermissions.users || []);

        // Set original active permissions for tracking changes
        this.setOriginalActivePermissions();

        // Clear change tracking arrays
        this.permissionsToAdd.set([]);
        this.permissionsToRemove.set([]);
        this.usersToRemove.set([]);

        // Reset pagination
        this.usersPage.set(0);

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading role data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos del rol',
          life: 3000
        });
        this.loading.set(false);
      }
    });
  }

  /**
   * Load default permission template for create mode
   */
  private loadDefaultTemplate(): void {
    this.loading.set(true);

    this.roleService.getDefaultRoleTemplate().subscribe({
      next: (modules) => {
        // Convert Module[] to ApiModule[] structure
        const apiModules: ApiModule[] = modules.map(m => this.convertModuleToApiModule(m));
        this.permissionModules.set(apiModules);
        this.selectedPermissions.set(new Set());
        this.originalPermissions.set(new Set());
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading permission template:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la plantilla de permisos',
          life: 3000
        });
        this.loading.set(false);
      }
    });
  }

  /**
   * Convert Module to ApiModule structure (handles 3-level hierarchy)
   */
  private convertModuleToApiModule(module: any): ApiModule {
    return {
      id: module.moduleId || module.submoduleId || module.permissionId || module.id,
      name: module.moduleName || module.submoduleName || module.permissionName || module.name,
      active: module.moduleActive ?? module.submoduleActive ?? module.permissionActive ?? false,
      subModules: (module.submodules || module.permissions || []).map((child: any) => this.convertModuleToApiModule(child))
    };
  }

  /**
   * Extract all permission IDs recursively from a module
   */
  private extractPermissionIds(module: ApiModule): number[] {
    const ids: number[] = [];

    if (!module.subModules || module.subModules.length === 0) {
      // Leaf node (permission)
      ids.push(module.id);
    } else {
      // Recursively get IDs from children
      module.subModules.forEach(sub => {
        ids.push(...this.extractPermissionIds(sub));
      });
    }

    return ids;
  }

  /**
   * Collect all active permission IDs from all modules
   */
  private collectActivePermissionIds(): number[] {
    const ids: number[] = [];
    this.permissionModules().forEach(module => {
      if (module.active) ids.push(module.id);
      module.subModules.forEach(sub => {
        if (sub.active) ids.push(sub.id);
        sub.subModules.forEach(subSub => {
          if (subSub.active) ids.push(subSub.id);
        });
      });
    });
    return ids;
  }

  /**
   * Set original active permissions (for edit mode comparison)
   */
  private setOriginalActivePermissions(): void {
    const activeIds = this.collectActivePermissionIds();
    this.originalPermissions.set(new Set(activeIds));
  }

  /**
   * Handle permission change tracking (add/remove arrays for edit mode)
   */
  private handlePermissionChange(id: number, active: boolean): void {
    const wasOriginallyActive = this.originalPermissions().has(id);
    const currentAdd = this.permissionsToAdd();
    const currentRemove = this.permissionsToRemove();

    if (active) {
      // If activating and wasn't originally, add to permissionsToAdd
      if (!wasOriginallyActive && !currentAdd.includes(id)) {
        this.permissionsToAdd.set([...currentAdd, id]);
      }
      // If was in permissionsToRemove, remove it
      const idx = currentRemove.indexOf(id);
      if (idx !== -1) {
        const newRemove = [...currentRemove];
        newRemove.splice(idx, 1);
        this.permissionsToRemove.set(newRemove);
      }
    } else {
      // If deactivating and was originally, add to permissionsToRemove
      if (wasOriginallyActive && !currentRemove.includes(id)) {
        this.permissionsToRemove.set([...currentRemove, id]);
      }
      // If was in permissionsToAdd, remove it
      const idx = currentAdd.indexOf(id);
      if (idx !== -1) {
        const newAdd = [...currentAdd];
        newAdd.splice(idx, 1);
        this.permissionsToAdd.set(newAdd);
      }
    }
  }

  /**
   * Unified toggle method for nodes at any level
   * Handles variable depth hierarchy (2 or 3 levels)
   *
   * @param node - The node being toggled
   * @param parent - Parent node (null for level 1)
   * @param grandparent - Grandparent node (null for level 1 and 2)
   */
  toggleNode(node: ApiModule, parent: ApiModule | null, grandparent: ApiModule | null): void {
    const modules = this.permissionModules();
    const newActive = !node.active;
    node.active = newActive;
    this.handlePermissionChange(node.id, newActive);

    if (newActive) {
      // ACTIVATING: Activate ancestors (parent and grandparent)
      if (parent && !parent.active) {
        parent.active = true;
        this.handlePermissionChange(parent.id, true);
      }
      if (grandparent && !grandparent.active) {
        grandparent.active = true;
        this.handlePermissionChange(grandparent.id, true);
      }

      // ACTIVATING: Activate all descendants recursively
      this.activateDescendants(node);
    } else {
      // DEACTIVATING: Deactivate all descendants recursively
      this.deactivateDescendants(node);

      // Check if parent should be deactivated (if no siblings remain active)
      if (parent) {
        const hasActiveSiblings = parent.subModules.some(s => s.active);
        if (!hasActiveSiblings) {
          parent.active = false;
          this.handlePermissionChange(parent.id, false);

          // Check if grandparent should be deactivated
          if (grandparent) {
            const hasActiveChildren = grandparent.subModules.some(s => s.active);
            if (!hasActiveChildren) {
              grandparent.active = false;
              this.handlePermissionChange(grandparent.id, false);
            }
          }
        }
      }
    }

    // Trigger change detection
    this.permissionModules.set([...modules]);
  }

  /**
   * Recursively activate all descendants of a node
   */
  private activateDescendants(node: ApiModule): void {
    if (!node.subModules || node.subModules.length === 0) {
      return;
    }

    node.subModules.forEach(child => {
      if (!child.active) {
        child.active = true;
        this.handlePermissionChange(child.id, true);
      }
      // Recursively activate grandchildren
      this.activateDescendants(child);
    });
  }

  /**
   * Recursively deactivate all descendants of a node
   */
  private deactivateDescendants(node: ApiModule): void {
    if (!node.subModules || node.subModules.length === 0) {
      return;
    }

    node.subModules.forEach(child => {
      if (child.active) {
        child.active = false;
        this.handlePermissionChange(child.id, false);
        // Recursively deactivate grandchildren
        this.deactivateDescendants(child);
      }
    });
  }

  /**
   * Handle form submission
   */
  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const formValue = this.form.getRawValue();

    if (this.isEditMode()) {
      // Update existing role
      const roleData = this.role()!;


      this.roleService.updateRole(roleData.roleId, {
        roleName: formValue.roleName,
        roleDescription: formValue.roleDescription || '',
        addPermissions: this.permissionsToAdd(),
        removePermissions: this.permissionsToRemove(),
        removeUsers: this.usersToRemove()
      }).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Rol actualizado exitosamente',
            life: 3000
          });
          this.loading.set(false);
          this.formClosed.emit(true);
        },
        error: (error) => {
          console.error('Error updating role:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el rol',
            life: 3000
          });
          this.loading.set(false);
        }
      });
    } else {
      // Create new role - collect all active permission IDs
      const activePermissions = this.collectActivePermissionIds();


      this.roleService.createRole({
        roleName: formValue.roleName,
        roleDescription: formValue.roleDescription || '',
        permissions: activePermissions
      }).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Rol creado exitosamente',
            life: 3000
          });
          this.loading.set(false);
          this.formClosed.emit(true);
        },
        error: (error) => {
          console.error('Error creating role:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el rol',
            life: 3000
          });
          this.loading.set(false);
        }
      });
    }
  }

  /**
   * Handle users page change
   */
  onUsersPageChange(event: any): void {
    this.usersPage.set(event.page);
    this.usersPageSize.set(event.rows);
  }

  /**
   * Toggle user for removal
   */
  toggleUserRemoval(userId: string): void {
    const currentList = this.usersToRemove();
    const index = currentList.indexOf(userId);

    if (index === -1) {
      // Add to removal list
      this.usersToRemove.set([...currentList, userId]);
    } else {
      // Remove from removal list
      const newList = [...currentList];
      newList.splice(index, 1);
      this.usersToRemove.set(newList);
    }
  }

  /**
   * Check if user is marked for removal
   */
  isUserMarkedForRemoval(userId: string): boolean {
    return this.usersToRemove().includes(userId);
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(name: string | null): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Handle drawer close
   */
  handleClose(): void {
    this.form.reset();
    this.permissionModules.set([]);
    this.selectedPermissions.set(new Set());
    this.originalPermissions.set(new Set());
    this.permissionsToAdd.set([]);
    this.permissionsToRemove.set([]);
    this.assignedUsers.set([]);
    this.usersToRemove.set([]);
    this.usersPage.set(0);
    this.usersPageSize.set(5);
    this.formClosed.emit(false);
  }
}
