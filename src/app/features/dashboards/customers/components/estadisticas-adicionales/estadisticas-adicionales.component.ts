import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { CustomersDashboardService } from '../../services';

/**
 * EstadisticasAdicionalesComponent
 *
 * Muestra estadísticas adicionales de clientes:
 * - Edad promedio
 * - Total de clientes penalizados (con locks)
 */
@Component({
  selector: 'app-estadisticas-adicionales',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    SkeletonModule
  ],
  template: `
    <div class="estadisticas-adicionales w-full">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Edad Promedio -->
        <p-card styleClass="dark:border-[1px] dark:border-gray-700">
          <ng-template pTemplate="header">
            <div class="px-4 pt-4 pb-2">
              <h3 class="text-lg font-semibold m-0 text-gray-900 dark:text-white flex items-center gap-2">
                <i class="pi pi-calendar text-primary-500"></i>
                Edad Promedio
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 m-0">
                De todos los clientes registrados
              </p>
            </div>
          </ng-template>

          @if (isLoadingAge()) {
            <p-skeleton width="100%" height="150px" />
          } @else if (errorAge()) {
            <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded">
              <i class="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
              <span class="text-red-700 dark:text-red-400 text-sm">{{ errorAge() }}</span>
            </div>
          } @else {
            <div class="text-center py-6">
              <div class="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {{ averageAge() }}
              </div>
              <p class="text-gray-600 dark:text-gray-400 text-lg">años</p>
            </div>

            <!-- Context -->
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Edad Mínima</span>
                <span class="font-semibold text-gray-900 dark:text-white">18 años</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Edad Máxima</span>
                <span class="font-semibold text-gray-900 dark:text-white">80+ años</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Rango Principal</span>
                <span class="font-semibold text-gray-900 dark:text-white">25-45 años</span>
              </div>
            </div>
          }
        </p-card>

        <!-- Clientes Penalizados -->
        <p-card styleClass="dark:border-[1px] dark:border-gray-700">
          <ng-template pTemplate="header">
            <div class="px-4 pt-4 pb-2">
              <h3 class="text-lg font-semibold m-0 text-gray-900 dark:text-white flex items-center gap-2">
                <i class="pi pi-lock text-red-500"></i>
                Clientes Penalizados
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 m-0">
                Con bloqueos activos (locks)
              </p>
            </div>
          </ng-template>

          @if (isLoadingPenalized()) {
            <p-skeleton width="100%" height="150px" />
          } @else if (errorPenalized()) {
            <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded">
              <i class="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
              <span class="text-red-700 dark:text-red-400 text-sm">{{ errorPenalized() }}</span>
            </div>
          } @else {
            <div class="text-center py-6">
              <div class="text-6xl font-bold text-red-600 dark:text-red-400 mb-2">
                {{ totalPenalized() }}
              </div>
              <p class="text-gray-600 dark:text-gray-400 text-lg">clientes</p>
            </div>

            <!-- Context -->
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="bg-red-50 dark:bg-red-950 p-3 rounded">
                <p class="text-red-700 dark:text-red-300 text-sm">
                  <i class="pi pi-info-circle mr-2"></i>
                  Estos clientes tienen restricciones activas en su cuenta
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="mt-4 space-y-2">
                <button
                  class="w-full px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition text-sm font-medium"
                >
                  <i class="pi pi-search mr-2"></i>Ver Detalles
                </button>
              </div>
            </div>
          }
        </p-card>
      </div>

      <!-- Additional Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <!-- Con Compras -->
        <p-card styleClass="dark:border-[1px] dark:border-gray-700">
          <ng-template pTemplate="header">
            <div class="px-4 pt-4 pb-2">
              <h3 class="text-lg font-semibold m-0 text-gray-900 dark:text-white flex items-center gap-2">
                <i class="pi pi-shopping-cart text-green-500"></i>
                Con Compras
              </h3>
            </div>
          </ng-template>

          @if (isLoadingAge()) {
            <p-skeleton width="100%" height="80px" />
          } @else {
            <div class="text-center py-4">
              <p class="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                {{ customersWithPurchases() | number }}
              </p>
              <p class="text-gray-600 dark:text-gray-400 text-sm">clientes</p>
            </div>
          }
        </p-card>

        <!-- Sin Compras -->
        <p-card styleClass="dark:border-[1px] dark:border-gray-700">
          <ng-template pTemplate="header">
            <div class="px-4 pt-4 pb-2">
              <h3 class="text-lg font-semibold m-0 text-gray-900 dark:text-white flex items-center gap-2">
                <i class="pi pi-shopping-bag text-yellow-500"></i>
                Sin Compras
              </h3>
            </div>
          </ng-template>

          @if (isLoadingAge()) {
            <p-skeleton width="100%" height="80px" />
          } @else {
            <div class="text-center py-4">
              <p class="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                {{ customersWithoutPurchases() | number }}
              </p>
              <p class="text-gray-600 dark:text-gray-400 text-sm">clientes</p>
            </div>
          }
        </p-card>

        <!-- Tasa de Conversión -->
        <p-card styleClass="dark:border-[1px] dark:border-gray-700">
          <ng-template pTemplate="header">
            <div class="px-4 pt-4 pb-2">
              <h3 class="text-lg font-semibold m-0 text-gray-900 dark:text-white flex items-center gap-2">
                <i class="pi pi-percentage text-blue-500"></i>
                Conversión
              </h3>
            </div>
          </ng-template>

          @if (isLoadingAge()) {
            <p-skeleton width="100%" height="80px" />
          } @else {
            <div class="text-center py-4">
              <p class="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {{ conversionRate() }}%
              </p>
              <p class="text-gray-600 dark:text-gray-400 text-sm">con compra</p>
            </div>
          }
        </p-card>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstadisticasAdicionalesComponent implements OnInit {
  private readonly service = inject(CustomersDashboardService);

  // Age
  readonly isLoadingAge = signal(false);
  readonly errorAge = signal<string | null>(null);
  readonly _averageAge = signal(0);

  // Penalized
  readonly isLoadingPenalized = signal(false);
  readonly errorPenalized = signal<string | null>(null);
  readonly totalPenalized = signal(0);

  // Purchase stats
  readonly customersWithPurchases = signal(0);
  readonly customersWithoutPurchases = signal(0);

  readonly averageAge = computed(() => Math.round(this._averageAge()));

  readonly conversionRate = computed(() => {
    const total = this.customersWithPurchases() + this.customersWithoutPurchases();
    if (total === 0) return 0;
    return Math.round((this.customersWithPurchases() / total) * 100);
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // Load Average Age
    this.isLoadingAge.set(true);
    this.service.getAverageAge().subscribe({
      next: (age) => {
        this._averageAge.set(age);
        this.isLoadingAge.set(false);
      },
      error: (error) => {
        console.error('Error loading average age:', error);
        this.errorAge.set('No se pudo cargar la edad promedio');
        this.isLoadingAge.set(false);
      }
    });

    // Load Penalized Customers
    this.isLoadingPenalized.set(true);
    this.service.getTotalPenalized().subscribe({
      next: (count) => {
        this.totalPenalized.set(count);
        this.isLoadingPenalized.set(false);
      },
      error: (error) => {
        console.error('Error loading penalized customers:', error);
        this.errorPenalized.set('No se pudo cargar clientes penalizados');
        this.isLoadingPenalized.set(false);
      }
    });

    // Load Purchase Statistics
    this.service.getCustomersWithPurchases().subscribe({
      next: (count) => this.customersWithPurchases.set(count),
      error: (error) => console.error('Error loading customers with purchases:', error)
    });

    this.service.getCustomersWithoutPurchases().subscribe({
      next: (count) => this.customersWithoutPurchases.set(count),
      error: (error) => console.error('Error loading customers without purchases:', error)
    });
  }
}
