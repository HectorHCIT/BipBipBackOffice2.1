import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';

// Services & Models
import { OrderTrackingService } from '../../../order-tracking/services';
import { TrackOrderList } from '../../../order-tracking/models';

@Component({
  selector: 'app-orders-by-customer-page',
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
    SelectModule,
    TagModule,
    SkeletonModule,
    ToastModule
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orders-by-customer-page.component.html',
  styleUrl: './orders-by-customer-page.component.scss'
})
export class OrdersByCustomerPageComponent implements OnInit {
  readonly orderTrackingService = inject(OrderTrackingService);
  private readonly messageService = inject(MessageService);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'SAC', routerLink: '/sac' },
    { label: 'Órdenes por Cliente' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Filtros de tiempo
  readonly timeFilters = [
    { label: 'Última hora', value: 1 },
    { label: 'Últimas 24 horas', value: 2 },
    { label: 'Últimos 7 días', value: 3 },
    { label: 'Último mes', value: 4 }
  ];

  // Local signals
  readonly searchTerm = signal('');
  readonly selectedTimeFilter = signal(4); // Predeterminado: Último mes
  readonly currentPage = signal(1);
  readonly rowsPerPage = signal(5);

  // Debounce para búsqueda
  private searchTimeout?: number;

  // Computed signals
  readonly isLoading = computed(() => this.orderTrackingService.isLoading());
  readonly orders = computed(() => this.orderTrackingService.orders());
  readonly totalRecords = computed(() => this.orderTrackingService.totalCount());
  readonly hasSearch = computed(() => this.searchTerm().trim() !== '');

  ngOnInit(): void {
    // No cargamos datos aquí porque la tabla lazy lo hace automáticamente
    // al disparar onLazyLoad
  }

  /**
   * Carga las órdenes según el estado actual
   */
  loadOrders(): void {
    const page = this.currentPage();
    const pageSize = this.rowsPerPage();
    const timeFilter = this.selectedTimeFilter();
    const search = this.searchTerm().trim();


    this.orderTrackingService.searchOrders({
      pageNumber: page,
      pageSize: pageSize,
      filter: search || undefined,
      option: timeFilter,
      showNotApproved: true // Siempre true en este módulo
    }).subscribe({
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
    }, 2000); // 2 segundos de debounce
  }

  /**
   * Maneja el cambio de filtro de tiempo
   */
  onTimeFilterChange(): void {
    this.currentPage.set(1);
    this.loadOrders();
  }

  /**
   * Maneja el cambio de paginación
   */
  onPageChange(event: any): void {
      // PrimeNG lazy table envía el índice de página empezando en 0
    const page = (event.page ?? 0) + 1;
    const rows = event.rows ?? 5;
    this.currentPage.set(page);
    this.rowsPerPage.set(rows);
    this.loadOrders();
  }

  /**
   * Limpia la búsqueda
   */
  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadOrders();
  }

  /**
   * Obtiene la severidad del estado de la orden
   */
  getOrderStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    const lowerStatus = status.toLowerCase();

    if (lowerStatus.includes('entregada') || lowerStatus.includes('aceptada')) {
      return 'success';
    }
    if (lowerStatus.includes('cancelad')) {
      return 'danger';
    }
    if (lowerStatus.includes('curso') || lowerStatus.includes('proceso')) {
      return 'warn';
    }
    return 'info';
  }

  /**
   * Formatea la fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-HN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Formatea el monto
   */
  formatAmount(amount: number): string {
    return `L. ${amount.toFixed(2)}`;
  }

  /**
   * Opciones de paginación
   */
  readonly rowsPerPageOptions = [5, 10, 15, 20];
}
