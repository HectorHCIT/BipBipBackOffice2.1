import { Component, OnInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { DrawerModule } from 'primeng/drawer';
import { MenuItem, MessageService } from 'primeng/api';

// Services & Models
import { DelayedOrdersService } from '../../services';
import { DelayedOrder, ActiveFilter } from '../../models';
import { GlobalDataService } from '@core/services/global-data.service';

// Components
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar.component';
import { AssignDriverDialogComponent } from '../../components/assign-driver-dialog/assign-driver-dialog.component';

@Component({
  selector: 'app-delayed-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    BreadcrumbModule,
    TagModule,
    SkeletonModule,
    ToastModule,
    DrawerModule,
    FilterSidebarComponent,
    AssignDriverDialogComponent
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delayed-orders-page.component.html',
  styleUrl: './delayed-orders-page.component.scss'
})
export class DelayedOrdersPageComponent implements OnInit, OnDestroy {
  readonly delayedOrdersService = inject(DelayedOrdersService);
  readonly globalDataService = inject(GlobalDataService);
  private readonly messageService = inject(MessageService);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'SAC', routerLink: '/sac' },
    { label: 'Órdenes con Demora' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Local signals
  readonly searchTerm = signal('');
  readonly currentPage = signal(1);
  readonly rowsPerPage = signal(5);
  readonly showFilterSidebar = signal(false);
  readonly showAssignDialog = signal(false);
  readonly selectedOrder = signal<DelayedOrder | null>(null);
  readonly activeFilters = signal<ActiveFilter[]>([]);

  // Auto-refresh
  readonly countdown = signal(60);
  readonly lastUpdate = signal<string>('');
  private countdownInterval?: number;

  // Debounce para búsqueda
  private searchTimeout?: number;

  // Computed signals
  readonly isLoading = computed(() => this.delayedOrdersService.isLoading());
  readonly delayedOrders = computed(() => this.delayedOrdersService.delayedOrders());
  readonly orders = computed(() => this.delayedOrders().records);
  readonly totalRecords = computed(() => this.delayedOrders().metadata.totalCount);
  readonly hasFilters = computed(() => this.activeFilters().length > 0);
  readonly isFiltered = computed(() => this.hasFilters());
  readonly hasSearch = computed(() => this.searchTerm().trim() !== '');

  ngOnInit(): void {
    this.loadOrders();
    this.loadDrivers();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  /**
   * Carga las órdenes según el estado actual (normal/búsqueda/filtros)
   */
  loadOrders(): void {
    const page = this.currentPage();
    const pageSize = this.rowsPerPage();

    // Prioridad: búsqueda > filtros > lista normal
    if (this.hasSearch()) {
      this.delayedOrdersService.searchDelayedOrders(this.searchTerm(), page, pageSize).subscribe({
        error: (error) => {
          console.error('Error al buscar órdenes:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron buscar las órdenes'
          });
        }
      });
    } else if (this.isFiltered()) {
      this.applyCurrentFilters(page, pageSize);
    } else {
      this.delayedOrdersService.getDelayedOrders(page, pageSize).subscribe({
        error: (error) => {
          console.error('Error al cargar órdenes:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las órdenes'
          });
        }
      });
    }

    this.updateLastUpdateTime();
  }

  /**
   * Carga la lista de drivers disponibles
   */
  loadDrivers(): void {
    this.delayedOrdersService.getAvailableDrivers().subscribe({
      error: (error) => {
        console.error('Error al cargar drivers:', error);
      }
    });
  }

  /**
   * Maneja el cambio de búsqueda con debounce
   */
  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = window.setTimeout(() => {
      this.currentPage.set(1);
      this.loadOrders();
    }, 500);
  }

  /**
   * Maneja el cambio de paginación
   */
  onPageChange(event: any): void {
    // PrimeNG Table lazy load event: { first, rows, sortField, sortOrder, filters }
    // event.first es el índice del primer registro (0-based)
    // Calculamos la página dividiendo first / rows y sumando 1
    const page = event.first !== undefined ? Math.floor(event.first / event.rows) + 1 : 1;

    this.currentPage.set(page);
    this.rowsPerPage.set(event.rows || this.rowsPerPage());
    this.loadOrders();
  }

  /**
   * Abre el sidebar de filtros
   */
  openFilters(): void {
    this.showFilterSidebar.set(true);
  }

  /**
   * Aplica los filtros del sidebar
   */
  onFiltersApplied(filters: any): void {
    const newActiveFilters: ActiveFilter[] = [];

    // Filtro de fecha
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange[0]).toLocaleDateString('es-HN');
      const endDate = new Date(filters.dateRange[1]).toLocaleDateString('es-HN');
      newActiveFilters.push({
        type: 'date',
        label: `Fecha: ${startDate} - ${endDate}`,
        value: filters.dateRange
      });
    }

    // Filtro de países
    if (filters.selectedCountries && filters.selectedCountries.length > 0) {
      newActiveFilters.push({
        type: 'country',
        label: `Países: ${filters.selectedCountries.length} seleccionados`,
        value: filters.selectedCountries
      });
    }

    // Filtro de ciudades
    if (filters.selectedCities && filters.selectedCities.length > 0) {
      newActiveFilters.push({
        type: 'city',
        label: `Ciudades: ${filters.selectedCities.length} seleccionadas`,
        value: filters.selectedCities
      });
    }

    this.activeFilters.set(newActiveFilters);
    this.currentPage.set(1);
    this.showFilterSidebar.set(false);

    if (newActiveFilters.length > 0) {
      this.applyCurrentFilters(1, this.rowsPerPage());
    } else {
      this.loadOrders();
    }
  }

  /**
   * Aplica los filtros actuales
   */
  private applyCurrentFilters(page: number, pageSize: number): void {
    const countries: number[] = [];
    const cities: number[] = [];
    let startDate = '';
    let endDate = '';

    this.activeFilters().forEach(filter => {
      if (filter.type === 'country') {
        countries.push(...filter.value);
      } else if (filter.type === 'city') {
        cities.push(...filter.value);
      } else if (filter.type === 'date') {
        startDate = new Date(filter.value[0]).toISOString();
        endDate = new Date(filter.value[1]).toISOString();
      }
    });

    this.delayedOrdersService.filterDelayedOrders(countries, cities, startDate, endDate, page, pageSize).subscribe({
      error: (error) => {
        console.error('Error al filtrar órdenes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron filtrar las órdenes'
        });
      }
    });
  }

  /**
   * Elimina un filtro activo
   */
  removeFilter(filter: ActiveFilter): void {
    const updatedFilters = this.activeFilters().filter(f => f !== filter);
    this.activeFilters.set(updatedFilters);
    this.currentPage.set(1);

    if (updatedFilters.length > 0) {
      this.applyCurrentFilters(1, this.rowsPerPage());
    } else {
      this.loadOrders();
    }
  }

  /**
   * Limpia todos los filtros
   */
  clearAllFilters(): void {
    this.activeFilters.set([]);
    this.currentPage.set(1);
    this.loadOrders();
  }

  /**
   * Abre el diálogo para asignar driver
   */
  openAssignDriver(order: DelayedOrder): void {
    this.selectedOrder.set(order);
    this.showAssignDialog.set(true);
  }

  /**
   * Callback cuando se asigna un driver exitosamente
   */
  onDriverAssigned(): void {
    this.showAssignDialog.set(false);
    this.loadOrders();
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Driver asignado correctamente'
    });
  }

  /**
   * Actualiza manualmente los datos
   */
  refreshData(): void {
    this.loadOrders();
    this.loadDrivers();
    this.resetCountdown();
    this.messageService.add({
      severity: 'info',
      summary: 'Actualizado',
      detail: 'Datos actualizados correctamente'
    });
  }

  /**
   * Inicia el contador de auto-refresh
   */
  private startCountdown(): void {
    this.countdownInterval = window.setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      } else {
        this.loadOrders();
        this.resetCountdown();
      }
    }, 1000);
  }

  /**
   * Reinicia el contador
   */
  private resetCountdown(): void {
    this.countdown.set(60);
  }

  /**
   * Actualiza la hora de última actualización
   */
  private updateLastUpdateTime(): void {
    const now = new Date();
    this.lastUpdate.set(now.toLocaleTimeString('es-HN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));
  }

  /**
   * Formatea el tiempo de demora
   * Entrada del API: "42 min" o "2 hours 30 min" o "1 day 5 hours"
   * Salida: Formateado legible
   */
  formatDelayedTime(delayedOrderTime: string): string {
    if (!delayedOrderTime) return '-';

    // El API ya devuelve el formato correcto (ej: "42 min")
    // Solo lo devolvemos tal cual
    return delayedOrderTime.trim();
  }

  /**
   * Formatea la fecha de entrega
   * Entrada del API: "Nov  5 2025 12:06PM" (formato del servidor)
   * Salida: "Nov 5 12:06 PM"
   */
  formatDeliveryDate(dateDelivery: string): string {
    if (!dateDelivery) return '-';

    try {
      // Formato del API: "Nov  5 2025 12:06PM" (con espacios dobles)
      // Parsear con Date directamente
      const date = new Date(dateDelivery);

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return dateDelivery; // Si no se puede parsear, devolver tal cual
      }

      return date.toLocaleDateString('es-HN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateDelivery;
    }
  }

  /**
   * Opciones de paginación
   */
  readonly rowsPerPageOptions = [5, 10, 15, 20];
}
