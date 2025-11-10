import { Component, OnInit, OnChanges, SimpleChanges, input, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';
import { forkJoin } from 'rxjs';
import { OrderTrackingService } from '../../services';
import { OrderIncident, DriverStatus, IncidentType, getIncidentTypeName, getIncidentTypeSeverity } from '../../models';

// Interface local para información del driver en incidentes
interface DriverInfo {
  driverId: number;
  driverCode: string;
  fullname: string;
}

@Component({
  selector: 'app-incidents-table',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    BadgeModule,
    SkeletonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incidents-table.component.html',
  styleUrl: './incidents-table.component.scss'
})
export class IncidentsTableComponent implements OnInit, OnChanges {
  private readonly orderTrackingService = inject(OrderTrackingService);

  // Inputs
  readonly orderId = input.required<number>();

  // State signals
  readonly incidents = signal<OrderIncident[]>([]);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly driverInfoMap = signal<Map<number, DriverInfo>>(new Map());
  readonly loadingDrivers = signal<Set<number>>(new Set());

  // Pagination
  readonly pageSize = 5;
  readonly currentPage = signal(0);

  // Computed
  readonly totalRecords = computed(() => this.incidents().length);
  readonly totalPages = computed(() => Math.ceil(this.totalRecords() / this.pageSize));
  readonly paginatedIncidents = computed(() => {
    const start = this.currentPage() * this.pageSize;
    const end = start + this.pageSize;
    return this.incidents().slice(start, end);
  });

  readonly isEmpty = computed(() => !this.isLoading() && this.incidents().length === 0);

  // Helper methods exposed to template
  readonly IncidentType = IncidentType;
  readonly Math = Math;

  getIncidentTypeName = getIncidentTypeName;
  getIncidentTypeSeverity = getIncidentTypeSeverity;

  ngOnInit(): void {
    this.loadIncidents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderId'] && !changes['orderId'].firstChange) {
      this.loadIncidents();
    }
  }

  /**
   * Carga las incidencias de la orden
   */
  loadIncidents(): void {
    const id = this.orderId();
    if (!id) return;

    this.isLoading.set(true);
    this.hasError.set(false);

    this.orderTrackingService.getOrderIncidents(id).subscribe({
      next: (data) => {
        this.incidents.set(data);
        this.isLoading.set(false);
        this.currentPage.set(0);
        this.loadDriversInfo();
      },
      error: (error) => {
        console.error('Error loading incidents:', error);
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Carga información de los drivers en paralelo
   */
  private loadDriversInfo(): void {
    // Obtener IDs únicos de drivers
    const driverIds = this.incidents()
      .filter(incident => this.hasPreviousDriver(incident))
      .map(incident => incident.previousDriverId!)
      .filter((id, index, self) => self.indexOf(id) === index);

    if (driverIds.length === 0) return;

    // Marcar drivers como "cargando"
    this.loadingDrivers.set(new Set(driverIds));

    // Crear array de observables
    const driverRequests = driverIds.map(driverId =>
      this.orderTrackingService.getDriverStatus(driverId)
    );

    // Ejecutar en paralelo
    forkJoin(driverRequests).subscribe({
      next: (driversData: DriverStatus[]) => {
        const newMap = new Map(this.driverInfoMap());
        driversData.forEach(driverData => {
          // Convertir DriverStatus a DriverInfo usando datos reales del backend
          const driverId = driverData.driverId || driverData.idDriver || 0;
          const driverInfo: DriverInfo = {
            driverId: driverId,
            driverCode: driverData.driverCode || `DRV-${driverId}`,
            fullname: driverData.fullname || `Driver #${driverId}`
          };
          newMap.set(driverId, driverInfo);
        });
        this.driverInfoMap.set(newMap);
        this.loadingDrivers.set(new Set());
      },
      error: (err) => {
        console.error('Error loading drivers:', err);
        this.loadingDrivers.set(new Set());
      }
    });
  }

  /**
   * Verifica si el incidente tiene driver anterior
   */
  hasPreviousDriver(incident: OrderIncident): boolean {
    const isReassignment = incident.incidentType === IncidentType.REASSIGNMENT ||
                           incident.incidentType === 'Reasignación';
    const isAssignment = incident.incidentType === IncidentType.ASSIGNMENT ||
                         incident.incidentType === 'Asignación';

    return (isReassignment || isAssignment) && incident.previousDriverId != null;
  }

  /**
   * Obtiene información del driver
   */
  getDriverInfo(driverId: number): DriverInfo | null {
    return this.driverInfoMap().get(driverId) || null;
  }

  /**
   * Verifica si un driver está cargando
   */
  isDriverLoading(driverId: number): boolean {
    return this.loadingDrivers().has(driverId);
  }

  /**
   * Formatea la fecha de manera relativa
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Menos de 1 minuto
    if (diffMins < 1) return 'Hace un momento';

    // Menos de 1 hora
    if (diffMins < 60) return `Hace ${diffMins} min${diffMins > 1 ? 's' : ''}`;

    // Menos de 24 horas
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;

    // Ayer
    if (diffDays === 1) {
      const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return `Ayer a las ${time}`;
    }

    // Última semana
    if (diffDays < 7) {
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
      const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return `${dayName} a las ${time}`;
    }

    // Fecha completa
    const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${time}`;
  }

  /**
   * Paginación
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 5) {
      // Mostrar todas las páginas
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas alrededor de la actual
      const start = Math.max(0, current - 2);
      const end = Math.min(total, start + 5);
      for (let i = start; i < end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }
}
