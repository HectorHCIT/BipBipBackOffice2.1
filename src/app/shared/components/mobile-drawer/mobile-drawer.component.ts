import { Component, input, output, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

import { NavigationService } from '@core/services/navigation.service';
import { NavigationItem } from '@core/models/auth.model';

/**
 * MobileDrawerComponent - Drawer de navegación para mobile
 *
 * Features:
 * - ✅ Navegación dinámica desde NavigationService
 * - ✅ Diseño optimizado para touch (targets 44px+)
 * - ✅ Full screen drawer
 * - ✅ Header con logo y botón cerrar
 * - ✅ Soporte para rutas anidadas (3 niveles)
 * - ✅ Badges de notificaciones (SAC)
 * - ✅ Dark mode support
 * - ✅ Active route highlighting
 */
@Component({
  selector: 'app-mobile-drawer',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    BadgeModule
  ],
  templateUrl: './mobile-drawer.component.html',
  styleUrls: ['./mobile-drawer.component.scss']
})
export class MobileDrawerComponent implements OnDestroy {
  // Dependency Injection
  readonly navigationService = inject(NavigationService);

  // 🔥 INPUTS
  readonly visible = input<boolean>(false);

  // 🔥 OUTPUTS
  readonly closeDrawer = output<void>();

  /**
   * Cierra el drawer
   */
  onClose(): void {
    this.closeDrawer.emit();
  }

  /**
   * Toggle expand/collapse de un item
   */
  toggleItem(item: NavigationItem): void {
    // Si el item no tiene hijos, navegar y cerrar drawer
    if (!item.children || item.children.length === 0) {
      if (item.link) {
        this.navigationService.navigate(item.link);
        this.closeDrawer.emit();
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
