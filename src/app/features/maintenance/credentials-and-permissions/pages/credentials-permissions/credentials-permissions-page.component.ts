import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CredentialsTabComponent } from '../../components/tabs/credentials-tab/credentials-tab.component';
import { RolesTabComponent } from '../../components/tabs/roles-tab/roles-tab.component';

/**
 * CredentialsPermissionsPageComponent
 *
 * Main page component for credentials and permissions management
 * Contains tabs for:
 * - Credentials (User Management)
 * - Roles (Role and Permission Management)
 */
@Component({
  selector: 'app-credentials-permissions-page',
  imports: [
    TabsModule,
    BreadcrumbModule,
    CredentialsTabComponent,
    RolesTabComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto p-6">
      <!-- Breadcrumb -->
      <p-breadcrumb [model]="breadcrumbItems" [home]="breadcrumbHome" styleClass="mb-4" />

      <!-- Page Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">
          <i class="pi pi-shield mr-3 text-primary"></i>
          Credenciales y Permisos
        </h1>
        <p class="text-gray-600 mt-2">
          Gestiona usuarios, roles y permisos del sistema
        </p>
      </div>

      <!-- Tabs Container -->
      <p-tabs [value]="0">
        <p-tablist>
          <p-tab [value]="0">
            <i class="pi pi-users mr-2"></i>
            Credenciales
          </p-tab>
          <p-tab [value]="1">
            <i class="pi pi-key mr-2"></i>
            Roles
          </p-tab>
        </p-tablist>

        <p-tabpanels>
          <!-- Credentials Tab -->
          <p-tabpanel [value]="0">
            <app-credentials-tab />
          </p-tabpanel>

          <!-- Roles Tab -->
          <p-tabpanel [value]="1">
            <app-roles-tab />
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CredentialsPermissionsPageComponent {
  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Mantenimiento', routerLink: '/maintenance' },
    { label: 'Credenciales y Permisos' }
  ];
}
