import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { DrawerModule } from 'primeng/drawer';
import { BreadcrumbModule } from 'primeng/breadcrumb';

// Services
import { SaaoService } from '../../services/saao.service';

// Models
import {
  SaaoOrder,
  SaaoReportParams,
  isPendingSettlement,
  getSettlementStatus,
  hasIncident,
  getTimingCategory
} from '../../models/saao.model';

// Components
import { SaaoFiltersComponent } from '../../components/saao-filters/saao-filters.component';
import { DriverDetailDrawerComponent } from '../../components/driver-detail-drawer/driver-detail-drawer.component';

@Component({
  selector: 'app-saao',
  templateUrl: './saao.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    CardModule,
    SkeletonModule,
    DrawerModule,
    BreadcrumbModule,
    SaaoFiltersComponent,
    DriverDetailDrawerComponent
  ]
})
export class SaaoComponent implements OnInit {
  // Dependency Injection
  private saaoService = inject(SaaoService);
  private destroyRef = inject(DestroyRef);

  // Breadcrumbs
  breadcrumbs = [
    { label: 'Home', icon: 'pi pi-home', route: '/home' },
    { label: 'Contingencias', route: '/contingencies' },
    { label: 'SAAO' }
  ];

  // State signals from service
  orders = this.saaoService.orders;
  loading = this.saaoService.loading;
  error = this.saaoService.error;
  totalOrders = this.saaoService.totalOrders;
  ordersWithIncidents = this.saaoService.ordersWithIncidents;
  totalIncidents = this.saaoService.totalIncidents;
  averageAssignmentTime = this.saaoService.averageAssignmentTime;
  uniqueDrivers = this.saaoService.uniqueDrivers;
  uniqueRestaurants = this.saaoService.uniqueRestaurants;
  fastAssignments = this.saaoService.fastAssignments;
  slowAssignments = this.saaoService.slowAssignments;

  // Local state
  selectedOrder = signal<SaaoOrder | null>(null);
  selectedDriverId = signal<number | null>(null);
  searchTerm = signal<string>('');
  drawerVisible = signal<boolean>(false);

  // Computed signals
  filteredOrders = computed(() => {
    const orders = this.orders();
    const search = this.searchTerm().toLowerCase();

    if (!search) return orders;

    return orders.filter(
      order =>
        order.driverNombre.toLowerCase().includes(search) ||
        order.driverCode.toLowerCase().includes(search) ||
        order.orderId.toString().includes(search) ||
        order.storeShortName.toLowerCase().includes(search)
    );
  });

  pendingOrders = computed(() => this.orders().filter(order => isPendingSettlement(order)));

  ngOnInit(): void {
    // No se necesita inicialización - los filtros se manejan en el componente hijo
  }

  /**
   * Manejar aplicación de filtros desde el componente hijo
   */
  onFiltersApplied(params: SaaoReportParams): void {
    this.loadFromApi(params);
  }

  /**
   * Manejar limpieza de filtros desde el componente hijo
   */
  onFiltersCleared(): void {
    this.saaoService.clear();
    this.searchTerm.set('');
  }

  /**
   * Cargar datos desde el API real
   */
  private loadFromApi(params: SaaoReportParams): void {
    this.saaoService
      .getSaaoReport(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
        },
        error: error => {
          console.error('❌ Error cargando reporte SAAO:', error);
        }
      });
  }

  /**
   * Abrir drawer con detalles del driver
   */
  openDriverDetails(order: SaaoOrder): void {
    this.selectedOrder.set(order);
    this.selectedDriverId.set(order.driverId);
    this.drawerVisible.set(true);
  }

  /**
   * Cerrar drawer
   */
  closeDrawer(): void {
    this.drawerVisible.set(false);
    this.selectedDriverId.set(null);
    this.selectedOrder.set(null);
  }

  /**
   * Buscar órdenes
   */
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  /**
   * Limpiar búsqueda
   */
  clearSearch(): void {
    this.searchTerm.set('');
  }

  /**
   * Helper para verificar si orden está pendiente
   */
  isPending(order: SaaoOrder): boolean {
    return isPendingSettlement(order);
  }

  /**
   * Helper para obtener estado
   */
  getStatus(order: SaaoOrder): string {
    return getSettlementStatus(order);
  }

  /**
   * Helper para verificar si tiene incidente
   */
  hasIncident(order: SaaoOrder): boolean {
    return hasIncident(order);
  }

  /**
   * Helper para obtener categoría de tiempo
   */
  getTimingCategory(minutos: number): 'RAPIDA' | 'LENTA' {
    return getTimingCategory(minutos);
  }

  /**
   * Helper para obtener severidad del tag según categoría
   */
  getTimingSeverity(minutos: number): 'success' | 'danger' {
    return this.getTimingCategory(minutos) === 'RAPIDA' ? 'success' : 'danger';
  }

  /**
   * Helper para obtener severidad del status
   */
  getStatusSeverity(order: SaaoOrder): 'success' | 'warn' | 'danger' {
    const status = getSettlementStatus(order);
    if (status === 'Liquidada') return 'success';
    if (status === 'Finalizada') return 'warn';
    return 'danger';
  }
}
