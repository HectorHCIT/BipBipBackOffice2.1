import { Injectable, signal, computed, inject } from '@angular/core';
import { DataService } from '@core/services/data.service';
import { Observable, tap } from 'rxjs';
import {
  EmissionPoint,
  EmissionPointDetail,
  EmissionPointListResponse,
  CreateEmissionPointRequest,
  UpdateEmissionPointRequest,
  StatusFilter
} from '../models/emission-point.model';

/**
 * EmissionPointService - Servicio para gestión de puntos de emisión
 *
 * Patrón: Signals para estado reactivo + DataService para HTTP
 * NO hacemos transformaciones de datos
 */
@Injectable({ providedIn: 'root' })
export class EmissionPointService {
  private readonly dataService = inject(DataService);

  // Estado reactivo con Signals
  readonly emissionPoints = signal<EmissionPoint[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(5);
  readonly isLoading = signal<boolean>(false);
  readonly searchTerm = signal<string>('');
  readonly selectedStatus = signal<string | null>(null);

  // Filtros de estado con contadores
  readonly statusFilters = signal<StatusFilter[]>([
    { idStatus: 0, label: 'Todos', filter: null, qty: 0 },
    { idStatus: 1, label: 'Activos', filter: 'true', qty: 0 },
    { idStatus: 2, label: 'Inactivos', filter: 'false', qty: 0 }
  ]);

  // Computed para total de páginas
  readonly totalPages = computed(() => {
    const total = this.totalRecords();
    const size = this.pageSize();
    return Math.ceil(total / size);
  });

  /**
   * Obtiene la lista de puntos de emisión con paginación
   * Endpoint: EmissionPoint/PointsEmissionList
   */
  getEmissionPoints(
    page: number = 0,
    pageSize: number = 5,
    status: string | null = null,
    filter: string = ''
  ): Observable<EmissionPointListResponse> {
    this.isLoading.set(true);

    // Construir query params
    let url = `EmissionPoint/PointsEmissionList?pageNumber=${page + 1}&pageSize=${pageSize}`;

    if (status) {
      url += `&status=${status}`;
    }

    if (filter) {
      url += `&filter=${encodeURIComponent(filter)}`;
    }

    return this.dataService.get$<EmissionPointListResponse>(url).pipe(
      tap((response) => {
        // Actualizar Signals directamente con la respuesta
        this.emissionPoints.set(response.data);
        this.totalRecords.set(response.metadata.totalCount);
        this.currentPage.set(page);
        this.pageSize.set(pageSize);

        // Actualizar contadores en los filtros
        this.updateStatusFilters(
          response.metadata.totalCount,
          response.metadata.totalActive,
          response.metadata.totalInactive
        );

        this.isLoading.set(false);
      })
    );
  }

  /**
   * Obtiene los detalles completos de un punto de emisión
   * Endpoint: EmissionPoint/PointEmissionDetail
   */
  getEmissionPointById(id: number): Observable<EmissionPointDetail> {
    return this.dataService.get$<EmissionPointDetail>(
      `EmissionPoint/PointEmissionDetail?idPoint=${id}`
    );
  }

  /**
   * Crea un nuevo punto de emisión
   * Endpoint: EmissionPoint/CreateEmissionPoint
   */
  createEmissionPoint(request: CreateEmissionPointRequest): Observable<any> {
    return this.dataService.post$('EmissionPoint/CreateEmissionPoint', request);
  }

  /**
   * Actualiza un punto de emisión existente
   * Endpoint: EmissionPoint/EditEmissionPoint
   */
  updateEmissionPoint(id: number, request: UpdateEmissionPointRequest): Observable<any> {
    return this.dataService.put$(`EmissionPoint/EditEmissionPoint?idPoint=${id}`, request);
  }

  /**
   * Cambia el estado (activo/inactivo) de un punto de emisión
   * Endpoint: EmissionPoint/ActiveEmissionPoint
   */
  changeStatus(id: number): Observable<any> {
    return this.dataService.put$(
      `EmissionPoint/ActiveEmissionPoint?idPoint=${id}`,
      null
    );
  }

  /**
   * Actualiza los contadores de los filtros de estado
   */
  private updateStatusFilters(total: number, totalActive: number, totalInactive: number): void {
    this.statusFilters.update((filters) =>
      filters.map((filter) => {
        if (filter.idStatus === 0) {
          return { ...filter, qty: total };
        } else if (filter.idStatus === 1) {
          return { ...filter, qty: totalActive };
        } else {
          return { ...filter, qty: totalInactive };
        }
      })
    );
  }

  /**
   * Reinicia el estado del servicio
   */
  resetState(): void {
    this.emissionPoints.set([]);
    this.totalRecords.set(0);
    this.currentPage.set(0);
    this.searchTerm.set('');
    this.selectedStatus.set(null);
    this.isLoading.set(false);
  }
}
