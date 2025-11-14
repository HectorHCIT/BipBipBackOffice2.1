import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CustomersDashboardService } from '../../services';

interface RegistrationData {
  date: string;
  total: number;
}

/**
 * RegistrosTimelineComponent
 *
 * Muestra la línea de tiempo de registros de clientes:
 * - Registros por semana (mes actual y último mes)
 * - Registros por mes (último año)
 * - Gráficos de línea/barras
 */
@Component({
  selector: 'app-registros-timeline',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    SkeletonModule,
    ButtonModule,
    SelectModule
  ],
  template: `
    <div class="registros-timeline w-full">
      <!-- Selector de período -->
      <div class="mb-6 flex gap-2 flex-wrap">
        <p-button
          [outlined]="period() !== 'week-this-month'"
          [rounded]="true"
          label="Esta Semana"
          (onClick)="changePeriod('week-this-month')"
          icon="pi pi-calendar"
          severity="info"
        ></p-button>
        <p-button
          [outlined]="period() !== 'week-last-month'"
          [rounded]="true"
          label="Última Semana"
          (onClick)="changePeriod('week-last-month')"
          icon="pi pi-calendar"
          severity="info"
        ></p-button>
        <p-button
          [outlined]="period() !== 'month-last-year'"
          [rounded]="true"
          label="Último Año"
          (onClick)="changePeriod('month-last-year')"
          icon="pi pi-chart-line"
          severity="info"
        ></p-button>
      </div>

      <!-- Chart Card -->
      <p-card styleClass="dark:border-[1px] dark:border-gray-700">
        <ng-template pTemplate="header">
          <div class="px-4 pt-4 pb-2">
            <h3 class="text-lg font-semibold m-0 text-gray-900 dark:text-white flex items-center gap-2">
              <i class="pi pi-chart-line text-primary-500"></i>
              Registros de Clientes
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 m-0">
              {{ getPeriodLabel() }}
            </p>
          </div>
        </ng-template>

        @if (isLoading()) {
          <p-skeleton width="100%" height="400px" />
        } @else if (error()) {
          <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded">
            <i class="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
            <span class="text-red-700 dark:text-red-400">{{ error() }}</span>
          </div>
        } @else {
          <p-chart
            type="line"
            [data]="chartData()"
            [options]="chartOptions"
            class="w-full"
          ></p-chart>

          <!-- Stats Footer -->
          <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="text-center">
              <p class="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total</p>
              <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {{ totalRegistrations() }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Promedio</p>
              <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {{ averageRegistrations() }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Máximo</p>
              <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {{ maxRegistrations() }}
              </p>
            </div>
          </div>
        }
      </p-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrosTimelineComponent implements OnInit {
  private readonly service = inject(CustomersDashboardService);

  readonly period = signal<'week-this-month' | 'week-last-month' | 'month-last-year'>('month-last-year');
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly registrationData = signal<RegistrationData[]>([]);

  readonly chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          usePointStyle: true,
          padding: 15,
          color: '#6b7280'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#e5e7eb',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6b7280'
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#6b7280'
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        }
      }
    }
  };

  readonly chartData = computed(() => {
    const data = this.registrationData();
    return {
      labels: data.map(d => d.date),
      datasets: [
        {
          label: 'Registros',
          data: data.map(d => d.total),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };
  });

  readonly totalRegistrations = computed(() =>
    this.registrationData().reduce((sum, d) => sum + d.total, 0)
  );

  readonly averageRegistrations = computed(() => {
    const data = this.registrationData();
    return data.length > 0 ? Math.round(this.totalRegistrations() / data.length) : 0;
  });

  readonly maxRegistrations = computed(() => {
    const data = this.registrationData();
    return data.length > 0 ? Math.max(...data.map(d => d.total)) : 0;
  });

  ngOnInit(): void {
    this.loadData();
  }

  changePeriod(newPeriod: 'week-this-month' | 'week-last-month' | 'month-last-year'): void {
    this.period.set(newPeriod);
    this.loadData();
  }

  getPeriodLabel(): string {
    const labels = {
      'week-this-month': 'Registros por semana - Mes actual',
      'week-last-month': 'Registros por semana - Mes anterior',
      'month-last-year': 'Registros por mes - Último año'
    };
    return labels[this.period()];
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const period = this.period();
    let observable;

    if (period === 'week-this-month') {
      observable = this.service.getRegistrationsByWeekThisMonth();
    } else if (period === 'week-last-month') {
      observable = this.service.getRegistrationsByWeekLastMonth();
    } else {
      observable = this.service.getRegistrationsByMonthLastYear();
    }

    observable.subscribe({
      next: (data) => {
        const formatted = data.map(item => ({
          date: this.formatDate(item.dateAddedWeek || item.dateAddedMonth),
          total: item.totalCustomers
        }));
        this.registrationData.set(formatted);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading registrations:', error);
        this.error.set('Error al cargar los datos de registros');
        this.isLoading.set(false);
      }
    });
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const period = this.period();
    
    if (period.includes('week')) {
      return `Sem ${Math.ceil(date.getDate() / 7)}`;
    } else {
      return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    }
  }
}
