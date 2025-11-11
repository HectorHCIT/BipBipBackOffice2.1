import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Chart.js
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// PrimeNG
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';

// Services & Models
import { DashboardService } from '../../services/dashboard.service';
import type { DashboardData, DashboardKPI, OrdersByPaymentMethod, OrdersByChannel, OrdersByBrand, OrdersByCity } from '../../models/dashboard.model';

// Registrar Chart.js y plugins
Chart.register(...registerables, ChartDataLabels);

/**
 * DashboardOverviewComponent
 *
 * Componente de resumen del dashboard con KPIs, tabla y gráfico donut
 */
@Component({
  selector: 'app-dashboard-overview',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    SelectModule,
    DatePickerModule,
    TableModule,
    ChartModule,
    ButtonModule
  ],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardOverviewComponent implements OnInit {
  // Services
  private readonly dashboardService = inject(DashboardService);
  private readonly fb = inject(FormBuilder);

  // Signals
  readonly isLoading = signal(false);
  readonly dashboardData = signal<DashboardData | null>(null);

  // Form
  readonly filtersForm: FormGroup;

  // Options para select de ciudades
  readonly cities = signal([
    { name: 'Todas las ciudades', code: 'ALL' },
    { name: 'Bogotá', code: 'BOG' },
    { name: 'Medellín', code: 'MED' },
    { name: 'Cali', code: 'CALI' },
    { name: 'Barranquilla', code: 'BAQ' }
  ]);

  // Computed - KPIs
  readonly kpis = computed<DashboardKPI[]>(() => {
    const data = this.dashboardData();
    if (!data) return [];

    return [
      {
        label: 'Total De Ordenes',
        value: data.totalOrders,
        icon: 'pi pi-shopping-cart'
      },
      {
        label: 'Total De Ordenes Entregadas',
        value: data.deliveredOrders,
        icon: 'pi pi-check-circle'
      },
      {
        label: 'Total Ordenes En Proceso',
        value: data.ordersInProgress,
        icon: 'pi pi-clock'
      }
    ];
  });

  // Computed - Chart data para el donut
  readonly chartData = computed(() => {
    const data = this.dashboardData();
    if (!data) return null;

    return {
      labels: data.ordersByChannel.map(item => item.channel),
      datasets: [
        {
          data: data.ordersByChannel.map(item => item.total),
          backgroundColor: [
            '#FB0021', // primary-500 - Rojo principal
            '#F7395B', // primary-400 - Rojo medio claro
            '#FA8D9F', // primary-200 - Rojo claro
            '#FCBCC6'  // primary-100 - Rojo muy claro
          ],
          hoverBackgroundColor: [
            '#E9001C', // primary-600 - Hover oscuro
            '#F85D78', // primary-300 - Hover medio
            '#F7395B', // primary-400 - Hover claro
            '#FA8D9F'  // primary-200 - Hover muy claro
          ]
        }
      ]
    };
  });

  // Computed - Leyendas del chart
  readonly chartLegends = computed(() => {
    const data = this.dashboardData();
    if (!data) return [];

    const total = data.ordersByChannel.reduce((acc, item) => acc + item.total, 0);
    const colors = ['#FB0021', '#F7395B', '#FA8D9F', '#FCBCC6'];

    return data.ordersByChannel.map((item, index) => ({
      label: item.channel,
      value: item.total,
      percentage: ((item.total / total) * 100).toFixed(1),
      color: colors[index]
    }));
  });

  // Opciones para el chart con porcentajes en el donut
  readonly chartOptions = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const dataset = context.dataset.data as number[];
            const total = dataset.reduce((acc: number, curr: number) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString('es-CO')} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold' as const,
          size: 14
        },
        formatter: (value: number, context: any) => {
          const dataset = context.chart.data.datasets[0].data as number[];
          const total = dataset.reduce((acc: number, curr: number) => acc + curr, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        }
      }
    },
    cutout: '60%',
    responsive: true,
    maintainAspectRatio: true
  };

  constructor() {
    // Inicializar formulario de filtros
    this.filtersForm = this.fb.group({
      selectedCity: [this.cities()[0]],
      dateRange: [null]
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Carga los datos del dashboard
   */
  loadDashboardData(): void {
    this.isLoading.set(true);

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando datos del dashboard:', error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Aplica los filtros seleccionados
   */
  applyFilters(): void {
    console.log('Filtros aplicados:', this.filtersForm.value);
    this.loadDashboardData();
  }

  /**
   * Formatea números grandes con separadores de miles
   */
  formatNumber(value: number): string {
    return value.toLocaleString('es-CO');
  }

  /**
   * Calcula el total de órdenes por marca
   */
  getTotalByBrand(): number {
    const data = this.dashboardData();
    if (!data) return 0;
    return data.ordersByBrand.reduce((acc, item) => acc + item.total, 0);
  }

  /**
   * Calcula el total de órdenes por ciudad
   */
  getTotalByCity(): number {
    const data = this.dashboardData();
    if (!data) return 0;
    return data.ordersByCity.reduce((acc, item) => acc + item.total, 0);
  }
}
