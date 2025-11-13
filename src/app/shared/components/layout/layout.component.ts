import { Component, signal, HostListener, effect, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

import { DrawerModule } from 'primeng/drawer';

import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

/**
 * LayoutComponent - Layout principal con navbar y sidebar
 *
 * Features:
 * - ✅ Navbar fijo en la parte superior
 * - ✅ Sidebar contraíble en desktop
 * - ✅ Drawer full en mobile (≤768px)
 * - ✅ Cierre automático de drawer en navegación (mobile)
 * - ✅ Responsive design
 * - ✅ Dark mode support
 */
@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    DrawerModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  // Dependency Injection
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // 🔥 SIGNALS
  readonly isSidebarCollapsed = signal(true);
  readonly isMobile = signal(false);
  readonly isDrawerOpen = signal(false);

  constructor() {
    // Detectar mobile al iniciar
    this.checkIfMobile();

    // Cuando cambia a mobile y el drawer está abierto, cerrar sidebar colapsado
    effect(() => {
      if (this.isMobile() && this.isDrawerOpen()) {
        // En mobile, cuando se abre el drawer, mantener el sidebar colapsado
        this.isSidebarCollapsed.set(true);
      }
    });

    // Cerrar drawer automáticamente en mobile cuando se navega a una ruta
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (this.isMobile() && this.isDrawerOpen()) {
          this.closeDrawer();
        }
      });
  }

  /**
   * Detecta cambios de tamaño de ventana
   */
  @HostListener('window:resize')
  onResize(): void {
    this.checkIfMobile();
  }

  /**
   * Verifica si estamos en mobile (≤768px)
   */
  private checkIfMobile(): void {
    const isMobileNow = window.innerWidth <= 768;
    this.isMobile.set(isMobileNow);

    // Si pasamos de mobile a desktop y el drawer está abierto, cerrarlo
    if (!isMobileNow && this.isDrawerOpen()) {
      this.isDrawerOpen.set(false);
    }
  }

  /**
   * Toggle sidebar collapse state (solo para desktop)
   */
  toggleSidebar(): void {
    if (this.isMobile()) {
      // En mobile, abrir/cerrar drawer
      this.isDrawerOpen.update(value => !value);
    } else {
      // En desktop, colapsar/expandir sidebar
      this.isSidebarCollapsed.update(value => !value);
    }
  }

  /**
   * Cierra el drawer (para mobile)
   */
  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }
}
