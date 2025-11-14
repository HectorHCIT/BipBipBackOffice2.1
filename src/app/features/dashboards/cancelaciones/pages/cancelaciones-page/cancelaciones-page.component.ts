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
import { SkeletonModule } from 'primeng/skeleton';

// Services & Models
import { CancelacionesService } from '../../services';
import { GlobalDataService } from '@core/services/global-data.service';
import type { CancellationsDashboardData, CancellationsFilters, CanceledOrderListItemDto } from '../../models';

// Registrar Chart.js y plugins
Chart.register(...registerables, ChartDataLabels);

interface KPI {
  label: string;
  value: number | string;
  icon: string;
}

/**
 * CancelacionesPageComponent
 *
 * Dashboard de cancelaciones con KPIs, gráficos y tabla detallada
 */
@Component({
  selector: 'app-cancelaciones-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    SelectModule,
    DatePickerModule,
    TableModule,
    ChartModule,
    ButtonModule,
    SkeletonModule
  ],
  templateUrl: './cancelaciones-page.component.html',
  styleUrls: ['./cancelaciones-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CancelacionesPageComponent implements OnInit {
  // Services
  private readonly cancelacionesService = inject(CancelacionesService);
  private readonly globalDataService = inject(GlobalDataService);
  private readonly fb = inject(FormBuilder);

  // Signals
  readonly isLoading = signal(false);
  readonly dashboardData = signal<CancellationsDashboardData | null>(null);
  readonly error = signal<string | null>(null);

  // Pagination
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  // Form
  readonly filtersForm: FormGroup;

  // Options para select de marcas (desde GlobalDataService)
  readonly brands = computed(() => {
    const brandsFromService = this.globalDataService.brands();
    return [
      { name: 'Todas las marcas', id: undefined },
      ...brandsFromService.map(brand => ({
        name: brand.name,
        id: brand.id
      }))
    ];
  });

  // Options para rangos de fechas predefinidos
  readonly dateRangeOptions = signal([
    { label: 'Personalizado', value: 'custom' },
    { label: 'Hoy', value: 'today' },
    { label: 'Ayer', value: 'yesterday' },
    { label: 'Últimos 7 días', value: 'last7days' },
    { label: 'Últimos 15 días', value: 'last15days' },
    { label: 'Últimos 30 días', value: 'last30days' },
    { label: 'Esta semana', value: 'thisWeek' },
    { label: 'Semana pasada', value: 'lastWeek' },
    { label: 'Este mes', value: 'thisMonth' },
    { label: 'Mes pasado', value: 'lastMonth' },
    { label: 'Últimos 90 días', value: 'last90days' }
  ]);

  // Computed - KPIs
  readonly kpis = computed<KPI[]>(() => {
    const data = this.dashboardData();
    if (!data?.summary) return [];

    return [
      {
        label: 'Total Órdenes Canceladas',
        value: this.formatNumber(data.summary.totalCanceledOrders),
        icon: 'pi pi-times-circle'
      },
      {
        label: 'Porcentaje de Cancelación',
        value: `${data.summary.percentageCanceledOrders.toFixed(2)}%`,
        icon: 'pi pi-chart-line'
      }
    ];
  });

  // Computed - Chart data por marca
  readonly chartByBrandData = computed(() => {
    const data = this.dashboardData();
    if (!data?.byBrand) return null;

    return {
      labels: data.byBrand.map(item => item.brandShortName),
      datasets: [
        {
          label: 'Cancelaciones',
          data: data.byBrand.map(item => item.totalCanceledOrders),
          backgroundColor: '#FB0021',
          borderColor: '#E9001C',
          borderWidth: 1
        }
      ]
    };
  });

  // Computed - Chart data por canal
  readonly chartByChannelData = computed(() => {
    const data = this.dashboardData();
    if (!data?.byChannel) return null;

    return {
      labels: data.byChannel.map(item => item.channelDescription),
      datasets: [
        {
          label: 'Cancelaciones',
          data: data.byChannel.map(item => item.totalCanceledOrders),
          backgroundColor: '#F7395B',
          borderColor: '#FB0021',
          borderWidth: 1
        }
      ]
    };
  });

  // Computed - Chart data por unidad
  readonly chartByStoreData = computed(() => {
    const data = this.dashboardData();
    if (!data?.byStore) return null;

    return {
      labels: data.byStore.map(item => item.storeShortName),
      datasets: [
        {
          label: 'Cancelaciones',
          data: data.byStore.map(item => item.totalCanceledOrders),
          backgroundColor: '#FA8D9F',
          borderColor: '#F7395B',
          borderWidth: 1
        }
      ]
    };
  });

  // Opciones para charts de barras
  readonly barChartOptions = {
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        anchor: 'end' as const,
        align: 'top' as const,
        color: '#333',
        font: {
          weight: 'bold' as const,
          size: 12
        },
        formatter: (value: number) => this.formatNumber(value)
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
    maintainAspectRatio: false
  };

  // Computed - Lista de cancelaciones
  readonly cancelationsList = computed(() => {
    const data = this.dashboardData();
    return data?.list?.items || [];
  });

  // Computed - Total count para paginación
  readonly totalRecords = computed(() => {
    const data = this.dashboardData();
    return data?.list?.totalCount || 0;
  });

  constructor() {
    // Establecer rango de fechas por defecto (últimos 30 días)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Inicializar formulario de filtros con fechas por defecto
    this.filtersForm = this.fb.group({
      selectedBrand: [{ name: 'Todas las marcas', id: undefined }],
      selectedDateRange: [this.dateRangeOptions()[5]], // Últimos 30 días
      dateRange: [[thirtyDaysAgo, today]],
      approved: [true]
    });
  }

  ngOnInit(): void {
    // Cargar las marcas si no están cargadas
    if (this.globalDataService.brands().length === 0) {
      this.globalDataService.forceRefresh('brands');
    }

    this.loadDashboardData();
  }

  /**
   * Carga los datos del dashboard con los filtros actuales
   */
  loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const filters = this.buildFilters();

    this.cancelacionesService.getDashboardData(filters).subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando datos del dashboard:', error);
        this.error.set('Error al cargar los datos del dashboard. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Construye el objeto de filtros desde el formulario
   */
  private buildFilters(): CancellationsFilters {
    const formValue = this.filtersForm.value;
    const filters: CancellationsFilters = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize()
    };

    // Rango de fechas (OBLIGATORIO)
    if (formValue.dateRange && Array.isArray(formValue.dateRange)) {
      const [startDate, endDate] = formValue.dateRange;

      // Si tenemos fechas, las usamos
      if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      } else {
        // Si no hay fechas, establecer últimos 30 días por defecto
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        filters.startDate = thirtyDaysAgo;
        filters.endDate = today;
      }
    } else {
      // Si dateRange es null, usar últimos 30 días
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      filters.startDate = thirtyDaysAgo;
      filters.endDate = today;
    }

    // Marca
    if (formValue.selectedBrand?.id !== undefined) {
      filters.brandId = formValue.selectedBrand.id;
    }

    // Aprobado (siempre true)
    filters.approved = true;

    return filters;
  }

  /**
   * Aplica los filtros seleccionados
   */
  applyFilters(): void {
    this.currentPage.set(1); // Reset a primera página
    this.loadDashboardData();
  }

  /**
   * Limpia los filtros y recarga los datos
   */
  clearFilters(): void {
    // Restablecer a últimos 30 días
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filtersForm.patchValue({
      selectedBrand: { name: 'Todas las marcas', id: undefined },
      selectedDateRange: this.dateRangeOptions()[5], // Últimos 30 días
      dateRange: [thirtyDaysAgo, today],
      approved: true
    });
    this.currentPage.set(1);
    this.loadDashboardData();
  }

  /**
   * Maneja el cambio de rango de fecha predefinido
   */
  onDateRangeChange(): void {
    const selectedRange = this.filtersForm.get('selectedDateRange')?.value;
    if (!selectedRange || selectedRange.value === 'custom') {
      return;
    }

    const dateRange = this.calculateDateRange(selectedRange.value);
    this.filtersForm.patchValue({
      dateRange: dateRange
    }, { emitEvent: false });
  }

  /**
   * Calcula el rango de fechas según la opción seleccionada
   */
  private calculateDateRange(rangeType: string): [Date, Date] {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    switch (rangeType) {
      case 'today':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const yesterday = new Date(startDate);
        yesterday.setHours(23, 59, 59, 999);
        return [startDate, yesterday];

      case 'last7days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'last15days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 14);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'last30days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'last90days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 89);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'thisWeek':
        startDate = new Date(today);
        const dayOfWeek = startDate.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate.setDate(startDate.getDate() + diff);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'lastWeek':
        const lastWeekStart = new Date(today);
        const currentDay = lastWeekStart.getDay();
        const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        lastWeekStart.setDate(lastWeekStart.getDate() + daysToMonday - 7);
        lastWeekStart.setHours(0, 0, 0, 0);

        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
        lastWeekEnd.setHours(23, 59, 59, 999);
        return [lastWeekStart, lastWeekEnd];

      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'lastMonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        lastMonthStart.setHours(0, 0, 0, 0);

        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        lastMonthEnd.setHours(23, 59, 59, 999);
        return [lastMonthStart, lastMonthEnd];

      default:
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
    }

    return [startDate, today];
  }

  /**
   * Maneja el cambio manual del datepicker
   */
  onManualDateChange(): void {
    this.filtersForm.patchValue({
      selectedDateRange: this.dateRangeOptions()[0] // Personalizado
    }, { emitEvent: false });
  }

  /**
   * Maneja el lazy loading de la tabla (paginación server-side)
   */
  onLazyLoad(event: any): void {
    // event.first = índice del primer registro (ej: 0, 10, 20...)
    // event.rows = número de registros por página (ej: 10, 25, 50)
    // Calcular número de página: (first / rows) + 1
    const newPage = typeof event.first === 'number' && typeof event.rows === 'number'
      ? Math.floor(event.first / event.rows) + 1
      : 1;
    const newPageSize = typeof event.rows === 'number' && !isNaN(event.rows) ? event.rows : 10;

    // Solo recargar datos de la tabla si la página o tamaño cambió realmente
    if (newPage !== this.currentPage() || newPageSize !== this.pageSize()) {
      this.currentPage.set(newPage);
      this.pageSize.set(newPageSize);

      // Solo cargar datos de la tabla, no todo el dashboard
      this.loadTableData();
    }
  }

  /**
   * Carga solo los datos de la tabla (lista de cancelaciones)
   */
  private loadTableData(): void {
    this.isLoading.set(true);

    const filters = this.buildFilters();

    this.cancelacionesService.getList(filters).subscribe({
      next: (pagedResult) => {
        // Actualizar solo la parte de la lista en dashboardData
        const currentData = this.dashboardData();
        if (currentData) {
          this.dashboardData.set({
            ...currentData,
            list: pagedResult
          });
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando datos de la tabla:', error);
        this.error.set('Error al cargar los datos de la tabla. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Formatea números grandes con separadores de miles usando coma
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-HN', {
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Formatea un monto de dinero
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2
    }).format(value);
  }

  /**
   * Formatea una fecha
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
