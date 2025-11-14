import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ChartModule } from 'primeng/chart';
import { GlobalDataService } from '@core/services/global-data.service';
import { OrdersDashboardService } from '../../services';
import { OrdersFilters, PeriodType, PeriodOption, OrderStatusKpi, OrdersByStatusItem, OrdersDashboardData } from '../../models';

/**
 * OrdersGeneralComponent
 *
 * Dashboard general de órdenes con KPIs y estadísticas principales.
 * Incluye:
 * - Filtros por marca, rango de fechas y período
 * - 6 KPIs de estados (Recibidas, Preparándose, Aceptadas, En Camino, Entregadas, Canceladas)
 * - Tabla de órdenes por estado
 * - Donut chart de órdenes por estado
 * - KPIs adicionales (Promedio por hora, Clientes recurrentes)
 */
@Component({
  selector: 'app-orders-general',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    SkeletonModule,
    TableModule,
    SelectModule,
    DatePickerModule,
    ChartModule,
    DecimalPipe,
    CurrencyPipe
  ],
  templateUrl: './orders-general.component.html',
  styleUrls: ['./orders-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersGeneralComponent implements OnInit {
  private readonly globalDataService = inject(GlobalDataService);
  private readonly ordersDashboardService = inject(OrdersDashboardService);

  // Loading states
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Filters
  readonly selectedBrandId = signal<number | undefined>(undefined);
  readonly selectedPeriod = signal<PeriodType>(PeriodType.LastMonth);
  readonly dateRange = signal<Date[]>([new Date(), new Date()]);

  // Brand options
  readonly brandOptions = computed(() => {
    const brandsFromService = this.globalDataService.brands();
    return [
      { name: 'Todas las marcas', id: undefined },
      ...brandsFromService.map(brand => ({
        name: brand.name,
        id: brand.id
      }))
    ];
  });

  // Period options
  readonly periodOptions: PeriodOption[] = [
    { label: 'Hoy', value: PeriodType.Today },
    { label: 'Ayer', value: PeriodType.Yesterday },
    { label: 'Última Semana', value: PeriodType.LastWeek },
    { label: 'Último Mes', value: PeriodType.LastMonth },
    { label: 'Personalizado', value: PeriodType.Custom }
  ];

  // Dashboard data
  readonly dashboardData = signal<OrdersDashboardData | null>(null);

  // Computed values
  readonly statusKpis = computed(() => this.dashboardData()?.statusKpis ?? []);
  readonly ordersByStatus = computed(() => this.dashboardData()?.ordersByStatus ?? []);
  readonly avgPerHour = computed(() => this.dashboardData()?.avgPerHour ?? 0);
  readonly recurrentCustomers = computed(() => this.dashboardData()?.recurrentCustomers ?? 0);

  // Chart data
  readonly donutChartData = computed(() => {
    const orders = this.ordersByStatus();
    return {
      labels: orders.map(o => o.statusName),
      datasets: [{
      data: orders.map(o => o.totalOrders),
      backgroundColor: [
        '#FB0021',  // primary-500 - Brand red
        '#F7395B',  // primary-400 - Medium red
        '#E9001C',  // primary-600 - Dark red
        '#FA8D9F',  // primary-200 - Light red
        '#FCC4CD',  // primary-100 - Very light red
        '#F85D78'   // primary-300 - Light-medium red
      ],
      hoverBackgroundColor: [
        '#E9001C',  // primary-600
        '#F85D78',  // primary-300
        '#D10019',  // primary-700
        '#F7395B',  // primary-400
        '#FA8D9F',  // primary-200
        '#F7395B'   // primary-400
      ]
      }]
    };
  });

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
      }
    }
  };

  ngOnInit(): void {
    // Cargar solo las marcas si no están cargadas
    if (this.globalDataService.brands().length === 0) {
      this.globalDataService.forceRefresh('brands');
    }

    // Inicializar el rango de fechas para "Último Mes"
    const dates = this.calculateDateRangeForPeriod(PeriodType.LastMonth);
    this.dateRange.set([dates.start, dates.end]);

    this.loadDashboardData();
  }

  /**
   * Construye los filtros para las peticiones
   */
  private buildFilters(): OrdersFilters {
    const filters: OrdersFilters = {
      brandId: this.selectedBrandId() ?? undefined,
      approved: true
    };

    const dates = this.calculateDateRange();
    if (dates.startDate) {
      filters.startDate = dates.startDate;
    }
    if (dates.endDate) {
      filters.endDate = dates.endDate;
    }

    return filters;
  }

  /**
   * Calcula el rango de fechas basado en el período seleccionado
   */
  private calculateDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    switch (this.selectedPeriod()) {
      case PeriodType.Today:
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;

      case PeriodType.Yesterday:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;

      case PeriodType.LastWeek:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;

      case PeriodType.LastMonth:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      case PeriodType.Custom:
        const range = this.dateRange();
        startDate = range[0] ?? new Date();
        endDate = range[1] ?? new Date();
        break;

      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }

  /**
   * Carga los datos del dashboard
   */
  loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const filters = this.buildFilters();

    this.ordersDashboardService.getDashboardData(filters).subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error.set('Error al cargar los datos del dashboard. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Maneja el cambio de período
   */
  onPeriodChange(period: PeriodType): void {
    this.selectedPeriod.set(period);

    // Actualizar el rango de fechas basado en el período seleccionado
    if (period !== PeriodType.Custom) {
      const dates = this.calculateDateRangeForPeriod(period);
      this.dateRange.set([dates.start, dates.end]);
    }

    this.loadDashboardData();
  }

  /**
   * Maneja el cambio de marca
   */
  onBrandChange(brandId: number | undefined): void {
    this.selectedBrandId.set(brandId);
    this.loadDashboardData();
  }

  /**
   * Calcula las fechas para un período específico
   */
  private calculateDateRangeForPeriod(period: PeriodType): { start: Date; end: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case PeriodType.Today:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;

      case PeriodType.Yesterday:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;

      case PeriodType.LastWeek:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;

      case PeriodType.LastMonth:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
    }

    return { start: startDate, end: endDate };
  }

  /**
   * Maneja el cambio de rango de fechas personalizado
   */
  onDateRangeChange(event: any): void {
    const dates = Array.isArray(event) ? event : [event];
    this.dateRange.set(dates);
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      this.selectedPeriod.set(PeriodType.Custom);
      this.loadDashboardData();
    }
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

  /**
   * Formatea moneda con símbolo L y separadores de miles con comas
   * Formato: L 1,234.56 (comas para miles, punto para decimales)
   */
  formatCurrency(value: number): string {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
    return `L ${formatted}`;
  }
}
