import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

/**
 * LayoutComponent - Layout principal con navbar y sidebar
 *
 * Features:
 * - ✅ Navbar fijo en la parte superior
 * - ✅ Sidebar contraíble usando PrimeNG Drawer
 * - ✅ Responsive design
 * - ✅ Dark mode support
 */
@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Navbar -->
      <app-navbar
        [isSidebarCollapsed]="isSidebarCollapsed()"
        (toggleSidebar)="toggleSidebar()"
      />

      <!-- Main Layout -->
      <div class="flex">
        <!-- Sidebar -->
        <app-sidebar
          [isCollapsed]="isSidebarCollapsed()"
          (toggleCollapse)="toggleSidebar()"
        />

        <!-- Main Content -->
        <main
          class="flex-1 transition-all duration-300"
          [class.ml-64]="!isSidebarCollapsed()"
          [class.ml-16]="isSidebarCollapsed()"
        >
          <div class="p-6 mt-16">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  // 🔥 SIGNALS
  readonly isSidebarCollapsed = signal(false);

  /**
   * Toggle sidebar collapse state
   */
  toggleSidebar(): void {
    this.isSidebarCollapsed.update(value => !value);
  }
}
