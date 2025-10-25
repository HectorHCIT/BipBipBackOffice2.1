import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';

import { AuthService } from '@core/services/auth.service';

/**
 * NavbarComponent - Barra de navegación superior
 *
 * Features:
 * - ✅ Toggle del sidebar
 * - ✅ Logo de BipBip
 * - ✅ Menú de usuario con avatar
 * - ✅ Notificaciones
 * - ✅ Dark mode support
 */
@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    BadgeModule,
    PopoverModule,
    TooltipModule
  ],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between h-16 px-4">
        <!-- Left Section: Menu Toggle + Logo -->
        <div class="flex items-center gap-4">
          <!-- Sidebar Toggle Button -->
          <p-button
            [text]="true"
            [rounded]="true"
            icon="pi pi-bars"
            severity="secondary"
            (onClick)="toggleSidebar.emit()"
            styleClass="text-gray-700 dark:text-gray-300"
          />

          <!-- Logo (sin texto) -->
          <div class="flex items-center">
            <img
              src="loginLogo.png"
              alt="BipBip Logo"
              class="h-8 w-auto"
            />
          </div>
        </div>

        <!-- Right Section: Dark Mode + Notifications + User Menu -->
        <div class="flex items-center gap-3">
          <!-- Dark Mode Toggle -->
          <p-button
            [text]="true"
            [rounded]="true"
            [icon]="isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'"
            severity="secondary"
            (onClick)="toggleDarkMode()"
            styleClass="text-gray-700 dark:text-gray-300"
            [pTooltip]="isDarkMode() ? 'Modo claro' : 'Modo oscuro'"
            tooltipPosition="bottom"
          />

          <!-- Notifications Bell -->
          <p-button
            [text]="true"
            [rounded]="true"
            icon="pi pi-bell"
            severity="secondary"
            styleClass="text-gray-700 dark:text-gray-300"
            [badge]="notificationCount() > 0 ? notificationCount().toString() : undefined"
            badgeSeverity="danger"
            [pTooltip]="'Notificaciones'"
            tooltipPosition="bottom"
          />

          <!-- User Avatar with Popover -->
          <div
            class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            (click)="userPopover.toggle($event)"
          >
            <div class="text-right hidden sm:block">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ currentUser()?.fullName || 'Usuario' }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ currentUser()?.email || 'email@example.com' }}
              </p>
            </div>
            <p-avatar
              [label]="getUserInitials()"
              styleClass="bg-[#fb0021] text-white"
              shape="circle"
            />
          </div>

          <!-- User Popover Menu -->
          <p-popover #userPopover>
            <div class="w-64 p-2">
              <!-- User Info Header -->
              <div class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ currentUser()?.fullName || 'Usuario' }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ currentUser()?.email || 'email@example.com' }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <i class="pi pi-shield text-[10px]"></i> {{ currentUser()?.rolName || 'Usuario' }}
                </p>
              </div>

              <!-- Menu Items -->
              <div class="py-2">
                <button
                  class="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  (click)="navigateToProfile(); userPopover.hide()"
                >
                  <i class="pi pi-user text-gray-500"></i>
                  <span>Mi Perfil</span>
                </button>

                <button
                  class="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  (click)="navigateToSettings(); userPopover.hide()"
                >
                  <i class="pi pi-cog text-gray-500"></i>
                  <span>Configuración</span>
                </button>

                <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                <button
                  class="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  (click)="logout(); userPopover.hide()"
                >
                  <i class="pi pi-sign-out"></i>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </p-popover>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  // Dependency Injection
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // 🔥 INPUTS
  readonly isSidebarCollapsed = input<boolean>(false);

  // 🔥 OUTPUTS
  readonly toggleSidebar = output<void>();

  // 🔥 SIGNALS
  readonly notificationCount = signal(3); // TODO: Conectar con Firebase
  readonly currentUser = this.authService.currentUser;
  readonly isDarkMode = signal(this.checkDarkMode());

  constructor() {
    // TODO: Conectar notificationCount con Firebase collection
    // Ejemplo: onSnapshot de colección 'notifications' filtrado por usuario
  }

  /**
   * Check if dark mode is active
   */
  private checkDarkMode(): boolean {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode(): void {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');

    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      this.isDarkMode.set(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      this.isDarkMode.set(true);
    }
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(): string {
    const user = this.currentUser();
    if (!user?.fullName) return 'U';

    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  /**
   * Navigate to profile page
   */
  navigateToProfile(): void {
    this.router.navigate(['/perfil']);
  }

  /**
   * Navigate to settings page
   */
  navigateToSettings(): void {
    this.router.navigate(['/configuracion']);
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
