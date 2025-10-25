import { Component, input, output, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';

import { NavigationService } from '@core/services/navigation.service';
import { NavigationItem } from '@core/models/auth.model';

/**
 * SidebarComponent - Sidebar con navegación dinámica
 *
 * Features:
 * - ✅ Navegación dinámica desde NavigationService
 * - ✅ Filtrado por permisos del usuario
 * - ✅ Soporte para rutas anidadas (3 niveles)
 * - ✅ Badges de notificaciones (SAC)
 * - ✅ Modo colapsado/expandido
 * - ✅ Iconos de PrimeNG
 * - ✅ Dark mode support
 * - ✅ Active route highlighting
 */
@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TooltipModule,
    BadgeModule
  ],
  template: `
    <aside
      class="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 overflow-hidden"
      [class.w-64]="!isCollapsed()"
      [class.w-16]="isCollapsed()"
    >
      <!-- Sidebar Content -->
      <div class="flex flex-col h-full">
        <!-- Navigation Menu -->
        <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <!-- Loading State -->
          @if (navigationService.isLoading()) {
            <div class="flex items-center justify-center py-8">
              <i class="pi pi-spin pi-spinner text-2xl text-gray-400"></i>
            </div>
          }

          <!-- Navigation Items -->
          @for (item of navigationService.navigation(); track item.id) {
            <div class="space-y-1">
              <!-- NIVEL 1: Item Principal -->
              @if (!item.children || item.children.length === 0) {
                <!-- Item sin hijos - enlace directo -->
                <a
                  [routerLink]="item.link"
                  routerLinkActive="bg-[#fb0021] text-white"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  [class.text-gray-700]="!item.exactMatch"
                  [class.dark:text-gray-300]="!item.exactMatch"
                  [pTooltip]="isCollapsed() ? item.title : ''"
                  tooltipPosition="right"
                >
                  <i [class]="item.icon + ' text-lg'"></i>
                  @if (!isCollapsed()) {
                    <span class="text-sm font-medium">{{ item.title }}</span>
                  }
                  @if (item.badge && !isCollapsed()) {
                    <span class="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {{ item.badge }}
                    </span>
                  }
                </a>
              } @else {
                <!-- Item con hijos - collapsable -->
                <div>
                  <button
                    (click)="toggleItem(item)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    [class.text-gray-700]="!item.exactMatch"
                    [class.dark:text-gray-300]="!item.exactMatch"
                    [class.bg-red-50]="item.exactMatch && !isCollapsed()"
                    [class.dark:bg-red-900/20]="item.exactMatch && !isCollapsed()"
                    [class.text-[#fb0021]]="item.exactMatch"
                    [pTooltip]="isCollapsed() ? item.title : ''"
                    tooltipPosition="right"
                  >
                    <i [class]="item.icon + ' text-lg'"></i>
                    @if (!isCollapsed()) {
                      <span class="text-sm font-medium">{{ item.title }}</span>
                      @if (item.badge) {
                        <span class="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {{ item.badge }}
                        </span>
                      }
                      <i
                        [class]="item.unfolded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                        class="text-xs"
                        [class.ml-auto]="!item.badge"
                      ></i>
                    }
                  </button>

                  <!-- NIVEL 2: Hijos -->
                  @if (item.unfolded && !isCollapsed()) {
                    <div class="mt-1 space-y-1">
                      @for (child of item.children; track child.id) {
                        @if (!child.children || child.children.length === 0) {
                          <!-- Hijo sin nietos -->
                          <a
                            [routerLink]="child.link"
                            routerLinkActive="bg-[#fb0021] text-white"
                            [routerLinkActiveOptions]="{exact: false}"
                            class="flex items-center gap-2 pl-11 pr-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            [class.text-gray-600]="!child.exactMatch"
                            [class.dark:text-gray-400]="!child.exactMatch"
                          >
                            <span class="text-sm">{{ child.title }}</span>
                          </a>
                        } @else {
                          <!-- Hijo con nietos -->
                          <div>
                            <button
                              (click)="toggleItem(child)"
                              class="w-full flex items-center justify-between gap-2 pl-11 pr-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              [class.text-gray-600]="!child.exactMatch"
                              [class.dark:text-gray-400]="!child.exactMatch"
                              [class.bg-red-50]="child.exactMatch"
                              [class.dark:bg-red-900/20]="child.exactMatch"
                              [class.text-[#fb0021]]="child.exactMatch"
                            >
                              <span class="text-sm">{{ child.title }}</span>
                              <i [class]="child.unfolded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" class="text-xs"></i>
                            </button>

                            <!-- NIVEL 3: Nietos -->
                            @if (child.unfolded) {
                              <div class="mt-1 space-y-1">
                                @for (grandChild of child.children; track grandChild.id) {
                                  <a
                                    [routerLink]="grandChild.link"
                                    routerLinkActive="bg-[#fb0021] text-white"
                                    [routerLinkActiveOptions]="{exact: false}"
                                    class="flex items-center gap-2 pl-16 pr-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    [class.text-gray-500]="!grandChild.exactMatch"
                                    [class.dark:text-gray-500]="!grandChild.exactMatch"
                                  >
                                    <span class="text-sm">{{ grandChild.title }}</span>
                                  </a>
                                }
                              </div>
                            }
                          </div>
                        }
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </nav>

        <!-- Collapse Toggle Button -->
        <div class="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            (click)="toggleCollapse.emit()"
            class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            [pTooltip]="isCollapsed() ? 'Expandir sidebar' : 'Colapsar sidebar'"
            tooltipPosition="right"
          >
            <i [class]="collapseIcon()" class="text-lg"></i>
            @if (!isCollapsed()) {
              <span class="text-sm font-medium">Colapsar</span>
            }
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnDestroy {
  // Dependency Injection
  readonly navigationService = inject(NavigationService);

  // 🔥 INPUTS
  readonly isCollapsed = input<boolean>(false);

  // 🔥 OUTPUTS
  readonly toggleCollapse = output<void>();

  // 🔥 COMPUTED
  readonly collapseIcon = computed(() => {
    return this.isCollapsed() ? 'pi pi-angle-right' : 'pi pi-angle-left';
  });

  /**
   * Toggle expand/collapse de un item
   */
  toggleItem(item: NavigationItem): void {
    // Si el sidebar está colapsado, expandir el sidebar primero
    if (this.isCollapsed()) {
      this.toggleCollapse.emit();
      return;
    }

    // Si el item no tiene hijos, navegar a la ruta
    if (!item.children || item.children.length === 0) {
      if (item.link) {
        this.navigationService.navigate(item.link);
      }
      return;
    }

    // Si tiene hijos, toggle el estado unfolded
    this.navigationService.toggleNavigationItem(item.id);
  }

  ngOnDestroy(): void {
    // Cleanup al destruir el componente
    this.navigationService.cleanup();
  }
}
