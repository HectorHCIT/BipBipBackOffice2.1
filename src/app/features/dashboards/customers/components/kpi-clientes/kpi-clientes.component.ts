import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { forkJoin } from 'rxjs';
import { CustomersDashboardService } from '../../services';
import { CustomerByCity } from '../../models';

/**
 * KpiClientesComponent
 *
 * Dashboard de KPIs de clientes.
 * Muestra:
 * - 3 KPIs principales: Total Clientes Penalizados, Edades Promedio, Usuarios registrados
 * - 3 Gráficos de línea: Registros por semana (mes pasado, este mes) y por mes (último año)
 * - 2 KPIs grandes: Clientes sin compra, Clientes con compra
 * - 1 Tabla: Clientes con orden por ciudad
 */
@Component({
  selector: 'app-kpi-clientes',
  imports: [
    CommonModule,
    CardModule,
    SkeletonModule,
    TableModule,
    ChartModule
  ],
  templateUrl: './kpi-clientes.component.html',
  styleUrls: ['./kpi-clientes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiClientesComponent implements OnInit {
  private readonly customersDashboardService = inject(CustomersDashboardService);

  // Loading & Error states
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // KPI Data
  readonly totalPenalized = signal<number>(0);
  readonly averageAge = signal<number>(0);
  readonly totalRegistered = signal<number>(0);
  readonly customersWithPurchases = signal<number>(0);
  readonly customersWithoutPurchases = signal<number>(0);

  // Chart Data
  readonly registrationsLastMonth = signal<any[]>([]);
  readonly registrationsThisMonth = signal<any[]>([]);
  readonly registrationsLastYear = signal<any[]>([]);

  // Table Data
  readonly customersByCity = signal<CustomerByCity[]>([]);

  // Computed: Total customers with orders in table
  readonly totalCustomersWithOrders = computed(() =>
    this.customersByCity().reduce((sum, city) => sum + city.totalClientes, 0)
  );

  ngOnInit(): void {
    this.loadKPIData();
  }

  /**
   * Carga todos los datos del dashboard de KPIs
   */
  private loadKPIData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      totalPenalized: this.customersDashboardService.getTotalPenalized(),
      averageAge: this.customersDashboardService.getAverageAge(),
      totalRegistered: this.customersDashboardService.getTotalRegistered(),
      customersWithPurchases: this.customersDashboardService.getCustomersWithPurchases(),
      customersWithoutPurchases: this.customersDashboardService.getCustomersWithoutPurchases(),
      registrationsLastMonth: this.customersDashboardService.getRegistrationsByWeekLastMonth(),
      registrationsThisMonth: this.customersDashboardService.getRegistrationsByWeekThisMonth(),
      registrationsLastYear: this.customersDashboardService.getRegistrationsByMonthLastYear(),
      customersByCity: this.customersDashboardService.getCustomersByCity()
    }).subscribe({
      next: (data) => {
        this.totalPenalized.set(data.totalPenalized);
        this.averageAge.set(data.averageAge);
        this.totalRegistered.set(data.totalRegistered);
        this.customersWithPurchases.set(data.customersWithPurchases);
        this.customersWithoutPurchases.set(data.customersWithoutPurchases);
        this.registrationsLastMonth.set(data.registrationsLastMonth);
        this.registrationsThisMonth.set(data.registrationsThisMonth);
        this.registrationsLastYear.set(data.registrationsLastYear);
        this.customersByCity.set(data.customersByCity);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading KPI data:', error);
        this.error.set('Error al cargar los datos de KPIs. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Formatea números con separadores de miles (formato Honduras)
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(value);
  }

  /**
   * Computed: Chart data para registros del mes pasado
   */
  readonly registrationsLastMonthChartData = computed(() => {
    const data = this.registrationsLastMonth();
    const labels = data.map((item: any) => `Semana ${item.weekNumber || item.week || ''}`);
    const values = data.map((item: any) => item.totalCustomers || item.total || 0);

    return {
      labels,
      datasets: [{
        label: 'Registros',
        data: values,
        borderColor: '#FB0021', // primary-500
        backgroundColor: 'rgba(251, 0, 33, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#FB0021',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2
      }]
    };
  });

  /**
   * Computed: Chart data para registros de este mes
   */
  readonly registrationsThisMonthChartData = computed(() => {
    const data = this.registrationsThisMonth();
    const labels = data.map((item: any) => `Semana ${item.weekNumber || item.week || ''}`);
    const values = data.map((item: any) => item.totalCustomers || item.total || 0);

    return {
      labels,
      datasets: [{
        label: 'Registros',
        data: values,
        borderColor: '#F7395B', // primary-400
        backgroundColor: 'rgba(247, 57, 91, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#F7395B',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2
      }]
    };
  });

  /**
   * Computed: Chart data para registros del último año
   */
  readonly registrationsLastYearChartData = computed(() => {
    const data = this.registrationsLastYear();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const labels = data.map((item: any) => {
      const monthNum = item.month || item.monthNumber || 0;
      return monthNames[monthNum - 1] || `Mes ${monthNum}`;
    });
    const values = data.map((item: any) => item.totalCustomers || item.total || 0);

    return {
      labels,
      datasets: [{
        label: 'Registros',
        data: values,
        borderColor: '#E9001C', // primary-600
        backgroundColor: 'rgba(233, 0, 28, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#E9001C',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2
      }]
    };
  });

  /**
   * Opciones para line charts
   */
  readonly lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = this.formatNumber(context.parsed.y);
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          callback: (value: any) => this.formatNumber(value)
        }
      }
    }
  };
}
