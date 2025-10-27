import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { DataService } from '@core/services/data.service';
import {
  Establishment,
  EstablishmentDetail,
  EstablishmentListResponse,
  CreateEstablishmentRequest,
  UpdateEstablishmentRequest,
  EmissionPointSummary,
  StatusFilter
} from '../models/establishment.model';

/**
 * EstablishmentService - Gestiona establecimientos con Signals
 *
 * Features:
 * - Signals para estado reactivo
 * - NO transformaciones de datos
 * - Paginación server-side
 * - Filtrado por estado
 * - Búsqueda
 */
@Injectable({
  providedIn: 'root'
})
export class EstablishmentService {
  private readonly dataService = inject(DataService);

  // Signals para estado reactivo
  readonly establishments = signal<Establishment[]>([]);
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

  /**
   * Obtiene la lista de establecimientos con paginación y filtros
   */
  getEstablishments(
    page: number,
    pageSize: number,
    status?: string | null,
    filter?: string
  ): Observable<EstablishmentListResponse> {
    this.isLoading.set(true);

    let url = `Establishment/EstablishmentsList?pageNumber=${page + 1}&pageSize=${pageSize}`;

    if (status) {
      url += `&status=${status}`;
    }

    if (filter) {
      url += `&filter=${encodeURIComponent(filter)}`;
    }

    return this.dataService.get$<EstablishmentListResponse>(url).pipe(
      tap((response) => {
        this.establishments.set(response.data);
        this.totalRecords.set(response.metadata.totalCount);
        this.currentPage.set(page);
        this.pageSize.set(pageSize);

        // Actualizar contadores de filtros
        this.statusFilters.set([
          { idStatus: 0, label: 'Todos', filter: null, qty: response.metadata.totalCount },
          { idStatus: 1, label: 'Activos', filter: 'true', qty: response.metadata.totalActive },
          { idStatus: 2, label: 'Inactivos', filter: 'false', qty: response.metadata.totalInactive }
        ]);

        this.isLoading.set(false);
      })
    );
  }

  /**
   * Obtiene los detalles de un establecimiento por ID
   */
  getEstablishmentById(id: number): Observable<EstablishmentDetail> {
    return this.dataService.get$<EstablishmentDetail>(
      `Establishment/EstablishmentsDetail?IdEstablishments=${id}`
    );
  }

  /**
   * Crea un nuevo establecimiento
   */
  createEstablishment(request: CreateEstablishmentRequest): Observable<Establishment> {
    return this.dataService.post$<Establishment>('Establishment/CreateEstablishment', request);
  }

  /**
   * Actualiza un establecimiento existente
   */
  updateEstablishment(id: number, request: UpdateEstablishmentRequest): Observable<Establishment> {
    return this.dataService.put$<Establishment>(
      `Establishment/EditEstablishment?idEstablishment=${id}`,
      request
    );
  }

  /**
   * Cambia el estado (activo/inactivo) de un establecimiento
   * Endpoint: Establishment/{id}/status
   *
   * @param id ID del establecimiento
   * @param currentStatus Estado actual (antes del cambio)
   * @returns Observable con la respuesta del API
   *
   * NOTA: El API espera recibir el NUEVO estado deseado, por lo que
   * invertimos el estado actual para enviar el estado opuesto.
   */
  changeStatus(id: number, currentStatus: boolean): Observable<any> {
    // Invertir: si está activo (true), enviar false para desactivar
    const newStatus = !currentStatus;
    return this.dataService.put$(
      `Establishment/${id}/status?status=${newStatus}`,
      null
    );
  }

  /**
   * Obtiene la lista de puntos de emisión para el select
   */
  getEmissionPointsSummary(): Observable<EmissionPointSummary[]> {
    return this.dataService.get$<EmissionPointSummary[]>('EmissionPoint/summary');
  }
}
