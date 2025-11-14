import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
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
    ButtonModule,
    DecimalPipe
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
  readonly ordersByUnit = computed(() => this.dashboardData()?.ordersByUnit ?? []);
  readonly ordersByCity = computed(() => this.dashboardData()?.ordersByCity ?? []);

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

  // Bar chart data for orders by unit
  readonly barChartData = computed(() => {
    const orders = this.ordersByUnit();
    if (orders.length === 0) return null;

    // Mismo patrón de colores que el donut chart
    const colors = [
      '#FB0021',  // primary-500 - Brand red
      '#F7395B',  // primary-400 - Medium red
      '#E9001C',  // primary-600 - Dark red
      '#FA8D9F',  // primary-200 - Light red
      '#FCC4CD',  // primary-100 - Very light red
      '#F85D78',  // primary-300 - Light-medium red
      '#FB0021',  // Repeat pattern if more than 6 bars
      '#F7395B',
      '#E9001C',
      '#FA8D9F'
    ];

    const borderColors = [
      '#E9001C',  // primary-600
      '#F85D78',  // primary-300
      '#D10019',  // primary-700
      '#F7395B',  // primary-400
      '#FA8D9F',  // primary-200
      '#F7395B',  // primary-400
      '#E9001C',
      '#F85D78',
      '#D10019',
      '#F7395B'
    ];

    return {
      labels: orders.map(o => o.storeShortName),
      datasets: [{
        label: 'Pedidos',
        data: orders.map(o => o.totalOrders),
        backgroundColor: colors.slice(0, orders.length),
        borderColor: borderColors.slice(0, orders.length),
        borderWidth: 1
      }]
    };
  });

  // Bar chart options
  readonly barChartOptions = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const item = this.ordersByUnit()[context.dataIndex];
            return `Pedidos: ${this.formatNumber(item.totalOrders)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => this.formatNumber(Number(value))
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    barThickness: 40,  // Grosor de las barras (más alto = más gruesas)
    maxBarThickness: 60  // Grosor máximo
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
    console.log('📅 buildFilters - calculateDateRange result:', dates);

    if (dates.startDate) {
      filters.startDate = dates.startDate;
    }
    if (dates.endDate) {
      filters.endDate = dates.endDate;
    }

    console.log('✅ buildFilters - final filters:', filters);
    return filters;
  }

  /**
   * Calcula el rango de fechas basado en el período seleccionado
   * Retorna solo la fecha en formato YYYY-MM-DD sin horas
   */
  private calculateDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    console.log('🗓️ calculateDateRange - period:', this.selectedPeriod());

    switch (this.selectedPeriod()) {
      case PeriodType.Today:
        startDate = new Date(now);
        endDate = new Date(now);
        break;

      case PeriodType.Yesterday:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        endDate = new Date(startDate);
        break;

      case PeriodType.LastWeek:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date(now);
        break;

      case PeriodType.LastMonth:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date(now);
        break;

      case PeriodType.Custom:
        const range = this.dateRange();
        console.log('📆 calculateDateRange - Custom range from signal:', range);
        startDate = range[0] ?? new Date();
        endDate = range[1] ?? new Date();
        break;

      default:
        startDate = new Date(now);
        endDate = new Date(now);
    }

    const result = {
      startDate: this.formatDateOnly(startDate),
      endDate: this.formatDateOnly(endDate)
    };
    console.log('🕐 calculateDateRange - result:', result);

    return result;
  }

  /**
   * Formatea una fecha a string YYYY-MM-DD sin horas
   */
  private formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    // No aplicamos los filtros automáticamente, esperamos al botón "Aplicar"
  }

  /**
   * Maneja la selección manual de fechas en el picker
   * Cambia automáticamente el período a "Custom"
   */
  onDateRangeSelect(): void {
    this.selectedPeriod.set(PeriodType.Custom);
    console.log('📅 Date range manually selected, switching to Custom period');
  }

  /**
   * Maneja el cambio de marca
   */
  onBrandChange(brandId: number | undefined): void {
    this.selectedBrandId.set(brandId);
    // No aplicamos los filtros automáticamente, esperamos al botón "Aplicar"
  }

  /**
   * Aplica los filtros seleccionados y recarga los datos
   */
  applyFilters(): void {
    // Validar que tengamos un rango de fechas completo si es Custom
    if (this.selectedPeriod() === PeriodType.Custom) {
      const range = this.dateRange();
      if (!range || range.length < 2 || !range[0] || !range[1]) {
        this.error.set('Por favor selecciona un rango de fechas válido');
        return;
      }
    }

    console.log('🔍 applyFilters - selectedPeriod:', this.selectedPeriod());
    console.log('🔍 applyFilters - dateRange:', this.dateRange());

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
