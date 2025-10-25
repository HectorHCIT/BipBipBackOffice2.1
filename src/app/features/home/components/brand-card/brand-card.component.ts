import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { HomeBrand } from '../../services/home.service';

/**
 * BrandCard - Tarjeta de marca con diseño mejorado
 *
 * Features:
 * ✅ Imagen redonda con borde
 * ✅ Diseño optimizado para dark/light mode
 * ✅ Efecto hover suave
 * ✅ Responsive
 */
@Component({
  selector: 'app-brand-card',
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-800/80 group">
      <div class="flex items-center gap-3 p-3">
        <!-- Imagen redonda más pequeña -->
        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 overflow-hidden flex items-center justify-center group-hover:from-red-50 group-hover:to-pink-50 dark:group-hover:from-red-900/20 dark:group-hover:to-pink-900/20 transition-all duration-200">
          <img
            [src]="brand().image"
            [alt]="brand().name"
            class="w-full h-full object-contain p-1.5"
          />
        </div>

        <!-- Información -->
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate mb-0.5 font-medium">{{ brand().name }}</p>
          <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-[#fb0021] dark:group-hover:text-[#fb0021] transition-colors duration-200">{{ brand().shortName }}</p>
        </div>
      </div>
    </div>
  `
})
export class BrandCardComponent {
  readonly brand = input.required<HomeBrand>();
}
