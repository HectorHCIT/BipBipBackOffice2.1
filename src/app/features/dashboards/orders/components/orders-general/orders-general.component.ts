import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GlobalDataService } from '@core/services/global-data.service';
import { OrdersDashboardService } from '../../services';
import { OrdersFilters, PeriodType, PeriodOption, OrderStatusKpi, OrdersByStatusItem, OrdersDashboardData, ChannelKpi } from '../../models';

// Registrar el plugin de datalabels globalmente
Chart.register(ChartDataLabels);

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
 * - 4 KPIs de canales (Domicilio, Restaurante, Para Llevar, *5000)
 * - Tabla de detalle por canal
 * - Tabla de detalle por marca
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
    PaginatorModule
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
  readonly ordersByChannel = computed(() => this.dashboardData()?.ordersByChannel ?? []);
  readonly ordersByBrand = computed(() => this.dashboardData()?.ordersByBrand ?? []);
  readonly avgTicketGlobal = computed(() => this.dashboardData()?.avgTicketGlobal ?? 0);
  readonly avgTicketByBrand = computed(() => this.dashboardData()?.avgTicketByBrand ?? []);

  // Computed totals for sales table
  readonly totalSales = computed(() =>
    this.ordersByBrand().reduce((sum, item) => sum + item.totalMoney, 0)
  );

  readonly totalSalesDelivered = computed(() =>
    this.ordersByBrand().reduce((sum, item) => sum + (item.totalSalesDelivered ?? 0), 0)
  );

  // New computed signals for additional charts
  readonly avgTicketByChannel = computed(() => this.dashboardData()?.avgTicketByChannel ?? []);
  readonly avgTicketByPaymentMethod = computed(() => this.dashboardData()?.avgTicketByPaymentMethod ?? []);
  readonly shippingCostsByDay = computed(() => this.dashboardData()?.shippingCostsByDay ?? []);

  // Shipping ranges and statistics
  readonly shippingRanges = computed(() => this.dashboardData()?.shippingRanges ?? []);
  readonly shippingStatistics = computed(() => this.dashboardData()?.shippingStatistics ?? {
    promedioPagosEnvio: 0,
    promedioCostoEnvio: 0,
    costoMaximoEnvio: 0,
    totalCostosEnvio: 0,
    totalPagosEnvio: 0
  });

  // Totales calculados para la tabla de rangos
  readonly totalRangesCostos = computed(() =>
    this.shippingRanges().reduce((sum, item) => sum + item.totalCostoEnvios, 0)
  );

  readonly totalRangesPagos = computed(() =>
    this.shippingRanges().reduce((sum, item) => sum + item.totalPagosEnvios, 0)
  );

  // Channel KPIs computed from ordersByChannel data
  // Siempre muestra los 4 canales principales, incluso si no hay datos (mostrará 0)
  readonly channelKpis = computed((): ChannelKpi[] => {
    const channelsFromApi = this.ordersByChannel();

    // Definir los 4 canales principales que siempre queremos mostrar
    const predefinedChannels = [
      {
        key: 'Domicilio',
        channelName: 'Domicilio',
        icon: 'pi-send',
        color: 'primary-500'
      },
      {
        key: 'Restaurante',
        channelName: 'Restaurante',
        icon: 'pi-building',
        color: 'primary-600'
      },
      {
        key: 'Para Llevar',
        channelName: 'Para Llevar',
        icon: 'pi-shopping-bag',
        color: 'primary-400'
      },
      {
        key: '*5000',
        channelName: '*5000',
        icon: 'pi-phone',
        color: 'primary-300'
      }
    ];

    // Mapear los datos de la API a los canales predefinidos
    return predefinedChannels.map(predefined => {
      // Buscar si hay datos para este canal (considerando variaciones de nombre)
      const channelData = channelsFromApi.find(c =>
        c.channelDescription === predefined.key ||
        (predefined.key === 'Domicilio' && c.channelDescription === 'Delivery')
      );

      return {
        channelName: predefined.channelName,
        count: channelData?.totalOrders ?? 0,
        icon: predefined.icon,
        color: predefined.color
      };
    });
  });

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
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((acc: number, curr: number) => acc + curr, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${this.formatNumber(value)} (${percentage}%)`;
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
          const total = context.dataset.data.reduce((acc: number, curr: number) => acc + curr, 0);
          const percentage = total > 0 ? (value / total) * 100 : 0;
          return percentage > 5 ? `${percentage.toFixed(1)}%` : ''; // Solo mostrar si es mayor a 5%
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
    maintainAspectRatio: true,
  };

  // Bar chart data for average ticket by brand
  readonly avgTicketBarChartData = computed(() => {
    const tickets = this.avgTicketByBrand();
    if (tickets.length === 0) return null;

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
      labels: tickets.map(t => t.brandShortName),
      datasets: [{
        label: 'Ticket Promedio',
        data: tickets.map(t => t.avgSubTotal),
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };
  });

  // Bar chart options for average ticket
  readonly avgTicketBarChartOptions = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const item = this.avgTicketByBrand()[context.dataIndex];
            return `Promedio: L. ${this.formatNumber(item.avgSubTotal)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => `L. ${this.formatNumber(Number(value))}`
        }
      }
    },
    responsive: true,
    maintainAspectRatio: true
  };

  // Bar chart data for average ticket by channel
  readonly avgTicketByChannelChartData = computed(() => {
    const tickets = this.avgTicketByChannel();
    if (tickets.length === 0) return null;

    const colors = [
      '#FB0021',  // primary-500
      '#F7395B',  // primary-400
      '#E9001C',  // primary-600
      '#FA8D9F',  // primary-200
      '#FCC4CD',  // primary-100
      '#F85D78',  // primary-300
      '#FB0021',
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
      labels: tickets.map(t => t.channelDescription),
      datasets: [{
        label: 'Ticket Promedio',
        data: tickets.map(t => t.avgSubTotal),
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };
  });

  // Bar chart options for average ticket by channel
  readonly avgTicketByChannelChartOptions = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const item = this.avgTicketByChannel()[context.dataIndex];
            return `Promedio: L. ${this.formatNumber(item.avgSubTotal)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => `L. ${this.formatNumber(Number(value))}`
        }
      }
    },
    responsive: true,
    maintainAspectRatio: true
  };

  // Bar chart data for average ticket by payment method
  readonly avgTicketByPaymentMethodChartData = computed(() => {
    const tickets = this.avgTicketByPaymentMethod();
    if (tickets.length === 0) return null;

    const colors = [
      '#FB0021',  // primary-500
      '#F7395B',  // primary-400
      '#E9001C',  // primary-600
      '#FA8D9F',  // primary-200
      '#FCC4CD',  // primary-100
      '#F85D78',  // primary-300
      '#FB0021',
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
      labels: tickets.map(t => t.paymentMethodName),
      datasets: [{
        label: 'Ticket Promedio',
        data: tickets.map(t => t.avgSubTotal),
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };
  });

  // Bar chart options for average ticket by payment method
  readonly avgTicketByPaymentMethodChartOptions = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const item = this.avgTicketByPaymentMethod()[context.dataIndex];
            return `Promedio: L. ${this.formatNumber(item.avgSubTotal)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => `L. ${this.formatNumber(Number(value))}`
        }
      }
    },
    responsive: true,
    maintainAspectRatio: true
  };

  // Line chart data for shipping costs by day
  readonly shippingCostsLineChartData = computed(() => {
    const costs = this.shippingCostsByDay();
    if (costs.length === 0) return null;

    return {
      labels: costs.map(c => {
        const date = new Date(c.deliveredDateDay);
        return date.toLocaleDateString('es-HN', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Costos de Envío',
        data: costs.map(c => c.totalCostoEnvios),
        borderColor: '#FB0021',  // primary-500
        backgroundColor: 'rgba(251, 0, 33, 0.1)',  // primary-500 with alpha
        tension: 0.4,  // Smooth curve
        fill: true
      }]
    };
  });

  // Line chart options for shipping costs
  readonly shippingCostsLineChartOptions = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const item = this.shippingCostsByDay()[context.dataIndex];
            return `Costo: L. ${this.formatNumber(item.totalCostoEnvios)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => `L. ${this.formatNumber(Number(value))}`
        }
      }
    },
    responsive: true,
    maintainAspectRatio: true
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
   * Retorna solo la fecha en formato YYYY-MM-DD sin horas
   */
  private calculateDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

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
