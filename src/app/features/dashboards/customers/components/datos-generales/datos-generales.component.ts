import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { CustomersDashboardService } from '../../services';
import { CustomerDashboardData, CustomerMetric, CustomerByCity } from '../../models';

/**
 * DatosGeneralesComponent
 *
 * Dashboard de datos generales de clientes.
 * Muestra:
 * - 3 KPIs: Hoy, Ayer, Total de clientes
 * - 3 Tablas: Clientes por ciudad (Hoy, Ayer, Total)
 */
@Component({
  selector: 'app-datos-generales',
  imports: [
    CommonModule,
    CardModule,
    SkeletonModule,
    TableModule,
    ChartModule
  ],
  templateUrl: './datos-generales.component.html',
  styleUrls: ['./datos-generales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatosGeneralesComponent implements OnInit {
  private readonly customersDashboardService = inject(CustomersDashboardService);

  // Loading & Error states
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Dashboard data
  readonly dashboardData = signal<CustomerDashboardData | null>(null);

  // Computed: KPI Metrics
  readonly metrics = computed((): CustomerMetric[] => {
    const data = this.dashboardData();
    if (!data) return [];

    return [
      {
        label: 'Hoy',
        value: data.todayCount,
        icon: 'pi-calendar-plus',
        color: 'primary-500'
      },
      {
        label: 'Ayer',
        value: data.yesterdayCount,
        icon: 'pi-history',
        color: 'primary-400'
      },
      {
        label: 'Total',
        value: data.totalCount,
        icon: 'pi-users',
        color: 'primary-600'
      }
    ];
  });

  // Computed: Cities data
  readonly citiesToday = computed(() => this.dashboardData()?.citiesToday ?? []);
  readonly citiesYesterday = computed(() => this.dashboardData()?.citiesYesterday ?? []);
  readonly citiesTotal = computed(() => this.dashboardData()?.citiesTotal ?? []);

  // Computed: Totals for table footers
  readonly totalToday = computed(() =>
    this.citiesToday().reduce((sum, city) => sum + city.totalClientes, 0)
  );

  readonly totalYesterday = computed(() =>
    this.citiesYesterday().reduce((sum, city) => sum + city.totalClientes, 0)
  );

  readonly totalCities = computed(() =>
    this.citiesTotal().reduce((sum, city) => sum + city.totalClientes, 0)
  );

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Carga los datos del dashboard
   */
  private loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.customersDashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading customer dashboard data:', error);
        this.error.set('Error al cargar los datos del dashboard. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Formatea números con separadores de miles (formato Honduras)
   * Formato: 1,234,567 (comas para miles)
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(value);
  }

  // ==================== MOCK DATA METHODS ====================
  // TODO: Reemplazar con datos reales de la API cuando estén disponibles

  /**
   * Mock: Detalle de clientes registrados hoy
   */
  mockRegistradosHoy() {
    return [
      { nombreCompleto: 'Zury Trochez', email: 'trochezzury2@gmail.com', genero: 'F', bandera: '🇭🇳' },
      { nombreCompleto: 'Zuleyka Aleman', email: 'alemanzuleyka610@gmail.com', genero: 'F', bandera: '🇭🇳' },
      { nombreCompleto: 'Yahaira Ramirez', email: 'yiramirez2022@gmail.com', genero: 'F', bandera: '🇭🇳' },
      { nombreCompleto: 'Wendy Cardona', email: 'cardonafune21@gmail.com', genero: '', bandera: '🇭🇳' },
      { nombreCompleto: 'Tiffany Juarez', email: 'tiffanyjuaresti@gmail.com', genero: 'F', bandera: '🇭🇳' },
      { nombreCompleto: 'Suany Martinez', email: 'Mayerling.martinez@unah.hn', genero: 'F', bandera: '🇭🇳' }
    ];
  }

  /**
   * Mock: Registrados por país
   */
  mockRegistradosPorPais() {
    return [
      { pais: 'Honduras', totalClientes: 451666, bandera: '🇭🇳' },
      { pais: 'Estados Unidos', totalClientes: 272, bandera: '🇺🇸' },
      { pais: 'México', totalClientes: 137, bandera: '🇲🇽' },
      { pais: 'Guatemala', totalClientes: 45, bandera: '🇬🇹' },
      { pais: 'El Salvador', totalClientes: 45, bandera: '🇸🇻' },
      { pais: 'Nicaragua', totalClientes: 39, bandera: '🇳🇮' },
      { pais: 'Panamá', totalClientes: 20, bandera: '🇵🇦' }
    ];
  }

  /**
   * Mock: Registros por género
   */
  mockRegistroGenero() {
    return [
      { genero: 'F', totalClientes: 228051 },
      { genero: 'M', totalClientes: 211324 },
      { genero: 'N', totalClientes: 7263 },
      { genero: '', totalClientes: 5613 }
    ];
  }

  /**
   * Computed: Total de género
   */
  readonly totalGenero = computed(() =>
    this.mockRegistroGenero().reduce((sum, g) => sum + g.totalClientes, 0)
  );

  /**
   * Computed: Chart data para Registrados Hoy (por fuente)
   * Usando colores de marca BipBip (rojos)
   */
  readonly registradosHoyChartData = computed(() => {
    return {
      labels: ['Google', 'Apple', 'Facebook'],
      datasets: [{
        data: [60, 30, 10], // Porcentajes aproximados
        backgroundColor: [
          '#FB0021',  // primary-500 - Brand red
          '#F7395B',  // primary-400 - Medium red
          '#E9001C'   // primary-600 - Dark red
        ],
        hoverBackgroundColor: [
          '#E9001C',  // primary-600
          '#F85D78',  // primary-300
          '#D10019'   // primary-700
        ]
      }]
    };
  });

  /**
   * Computed: Chart data para Registro Total (por fuente)
   * Usando colores de marca BipBip (rojos)
   */
  readonly registroTotalChartData = computed(() => {
    return {
      labels: ['Facebook', 'Apple', 'Google'],
      datasets: [{
        data: [50, 35, 15], // Porcentajes aproximados
        backgroundColor: [
          '#FB0021',  // primary-500 - Brand red
          '#FA8D9F',  // primary-200 - Light red
          '#F85D78'   // primary-300 - Light-medium red
        ],
        hoverBackgroundColor: [
          '#E9001C',  // primary-600
          '#F7395B',  // primary-400
          '#FB0021'   // primary-500
        ]
      }]
    };
  });

  /**
   * Opciones para donut charts
   */
  readonly donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 10,
          boxHeight: 10,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((acc: number, curr: number) => acc + curr, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value}% (${percentage}%)`;
          }
        }
      }
    }
  };
}
