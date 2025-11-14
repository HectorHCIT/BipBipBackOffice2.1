import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { CustomersDashboardService } from '../../services';
import { CustomerByCity } from '../../models';

/**
 * ClientesPorCiudadComponent
 *
 * Muestra clientes agrupados por ciudad:
 * - Gráfico de barras horizontal
 * - Tabla con top 20 ciudades
 * - Estadísticas: total, promedio, máximo
 */
@Component({
  selector: 'app-clientes-por-ciudad',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    SkeletonModule,
    TableModule
  ],
  template: `
    <div class="clientes-por-ciudad w-full">
      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <!-- Chart: Bar -->
        <p-card styleClass="dark:border-[1px] dark:border-gray-700">
          <ng-template pTemplate="header">
            <div class="px-4 pt-4 pb-2">
              <h3 class="text-lg font-semibold m-0 text-gray-900 dark:text-white flex items-center gap-2">
                <i class="pi pi-chart-bar text-primary-500"></i>
                Clientes por Ciudad (Top 10)
              </h3>
            </div>
          </ng-template>

          @if (isLoading()) {
            <p-skeleton width="100%" height="300px" />
          } @else if (error()) {
            <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
              <i class="pi pi-exclamation-triangle"></i>
              <span>{{ error() }}</span>
            </div>
          } @else {
            <p-chart
              type="bar"
              [data]="chartDataBar()"
              [options]="chartOptionsBar"
              class="w-full"
            ></p-chart>
          }
        </p-card>

        <!-- Chart: Pie -->
        <p-card styleClass="dark:border-[1px] dark:border-gray-700">
          <ng-template pTemplate="header">
            <div class="px-4 pt-4 pb-2">
              <h3 class="text-lg font-semibold m-0 text-gray-900 dark:text-white flex items-center gap-2">
                <i class="pi pi-chart-pie text-primary-500"></i>
                Distribución
              </h3>
            </div>
          </ng-template>

          @if (isLoading()) {
            <p-skeleton width="100%" height="300px" />
          } @else {
            <p-chart
              type="pie"
              [data]="chartDataPie()"
              [options]="chartOptionsPie"
              class="w-full"
            ></p-chart>
          }
        </p-card>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <p-card styleClass="dark:border-[1px] dark:border-gray-700">
          <div class="text-center">
            <i class="pi pi-map-marker text-3xl text-primary-500 mb-3"></i>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-1">Ciudades</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ totalCities() }}
            </p>
          </div>
        </p-card>

        <p-card styleClass="dark:border-[1px] dark:border-gray-700">
          <div class="text-center">
            <i class="pi pi-users text-3xl text-blue-500 mb-3"></i>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-1">Promedio</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ averageByCity() }}
            </p>
          </div>
        </p-card>

        <p-card styleClass="dark:border-[1px] dark:border-gray-700">
          <div class="text-center">
            <i class="pi pi-arrow-up text-3xl text-green-500 mb-3"></i>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-1">Máximo</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ maxByCity() }}
            </p>
          </div>
        </p-card>
      </div>

      <!-- Table: Top 20 -->
      <p-card styleClass="dark:border-[1px] dark:border-gray-700">
        <ng-template pTemplate="header">
          <div class="px-4 pt-4 pb-2">
            <h3 class="text-lg font-semibold m-0 text-gray-900 dark:text-white flex items-center gap-2">
              <i class="pi pi-list text-primary-500"></i>
              Top 20 Ciudades
            </h3>
          </div>
        </ng-template>

        @if (isLoading()) {
          <p-skeleton width="100%" height="400px" />
        } @else {
          <p-table
            [value]="sortedCities()"
            [paginator]="true"
            [rows]="10"
            styleClass="p-datatable-sm"
          >
            <ng-template pTemplate="header">
              <tr>
                <th class="w-12">Rank</th>
                <th>Ciudad</th>
                <th class="text-right w-32">Clientes</th>
                <th class="text-right w-32">%</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-row let-idx="rowIndex">
              <tr>
                <td class="font-bold text-primary-600">{{ idx + 1 }}</td>
                <td>
                  <div class="flex items-center gap-2">
                    <i class="pi pi-map-marker text-primary-400"></i>
                    {{ row.cityName }}
                  </div>
                </td>
                <td class="text-right font-semibold">{{ row.totalClientes }}</td>
                <td class="text-right">
                  <span class="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full text-sm">
                    {{ getPercentage(row.totalClientes) }}%
                  </span>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="footer">
              <tr class="font-bold bg-gray-50 dark:bg-gray-800">
                <td colspan="2">Total:</td>
                <td class="text-right text-primary-600 dark:text-primary-400">
                  {{ totalClientes() }}
                </td>
                <td class="text-right">100%</td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientesPorCiudadComponent implements OnInit {
  private readonly service = inject(CustomersDashboardService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly cities = signal<CustomerByCity[]>([]);

  readonly sortedCities = computed(() => {
    const data = [...this.cities()];
    return data.sort((a, b) => b.totalClientes - a.totalClientes);
  });

  readonly chartOptionsBar = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#6b7280' },
        grid: { color: 'rgba(107, 114, 128, 0.1)' }
      },
      y: {
        ticks: { color: '#6b7280' },
        grid: { display: false }
      }
    }
  };

  readonly chartOptionsPie = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: '#6b7280'
        }
      }
    }
  };

  readonly chartDataBar = computed(() => {
    const data = this.sortedCities().slice(0, 10);
    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
      '#06b6d4', '#6366f1', '#f43f5e', '#d97706', '#14b8a6'
    ];

    return {
      labels: data.map(c => c.cityName),
      datasets: [
        {
          label: 'Clientes',
          data: data.map(c => c.totalClientes),
          backgroundColor: colors
        }
      ]
    };
  });

  readonly chartDataPie = computed(() => {
    const data = this.sortedCities().slice(0, 8);
    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
      '#06b6d4', '#6366f1', '#f43f5e'
    ];

    return {
      labels: data.map(c => c.cityName),
      datasets: [
        {
          data: data.map(c => c.totalClientes),
          backgroundColor: colors,
          hoverBackgroundColor: colors.map(c => c + 'DD')
        }
      ]
    };
  });

  readonly totalCities = computed(() => this.cities().length);

  readonly totalClientes = computed(() =>
    this.cities().reduce((sum, c) => sum + c.totalClientes, 0)
  );

  readonly averageByCity = computed(() => {
    const total = this.totalClientes();
    const count = this.totalCities();
    return count > 0 ? Math.round(total / count) : 0;
  });

  readonly maxByCity = computed(() => {
    const data = this.cities();
    return data.length > 0 ? Math.max(...data.map(c => c.totalClientes)) : 0;
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.service.getCustomersByCity().subscribe({
      next: (data) => {
        this.cities.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading cities data:', error);
        this.error.set('Error al cargar datos por ciudad');
        this.isLoading.set(false);
      }
    });
  }

  getPercentage(value: number): number {
    const total = this.totalClientes();
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }
}
