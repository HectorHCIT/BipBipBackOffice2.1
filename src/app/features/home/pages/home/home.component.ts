import { Component, inject, signal, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Components
import { BrandCardComponent } from '../../components/brand-card/brand-card.component';

import { AuthService } from '@core/services/auth.service';
import { HomeService, HomeBrand } from '../../services/home.service';

/**
 * HomeComponent - Página principal después del login
 */
@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    BrandCardComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          Bienvenido, <span class="text-[#fb0021]">{{ userFullName() }}</span>
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          {{ userRole() }}
        </p>
      </div>

      <!-- Dashboard Embeddable -->
      @if (dashboardToken()) {
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <em-beddable
            [token]="dashboardToken()"
            [client-context]="getClientContext()">
          </em-beddable>
        </div>
      }

      <!-- Brand List -->
      @if (brandList().length > 0) {
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Marcas</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            @for (brand of brandList(); track brand.id) {
              <app-brand-card [brand]="brand" />
            }
          </div>
        </div>
      }
    </div>
  `
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly homeService = inject(HomeService);
  private readonly router = inject(Router);

  // Signals
  readonly brandList = signal<HomeBrand[]>([]);
  readonly dashboardToken = signal<string | null>(null);

  // Computed values from AuthService
  readonly userName = this.authService.userName;
  readonly userFullName = this.authService.userFullName;
  readonly userRole = this.authService.userRole;

  ngOnInit(): void {
    // Cargar lista de marcas
    this.homeService.getBrandList().subscribe({
      next: (brands) => {
        this.brandList.set(brands);
      },
      error: (error) => {
        console.error('Error cargando marcas:', error);
      }
    });

    // Cargar token del dashboard
    this.homeService.getDashboardToken().subscribe({
      next: (tokenData) => {
        if (tokenData) {
          this.dashboardToken.set(tokenData.token);
        }
      },
      error: (error) => {
        console.error('Error cargando token de dashboard:', error);
      }
    });
  }

  /**
   * Contexto del cliente para el dashboard de Embeddable.com
   */
  getClientContext(): string {
    return JSON.stringify({
      client: 'bipbip',
      theme: {
        colors: [
          '#bde3fa',
          '#3db4f0',
          '#179ce0',
          '#0a7cbf',
          '#09639b',
          '#0c5480',
          '#10466a',
          '#0b2c46',
        ],
        brand: {
          primary: '#bde3fa',
          secondary: '#09639b',
          accent: '#0b2c46',
        },
      },
    });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
