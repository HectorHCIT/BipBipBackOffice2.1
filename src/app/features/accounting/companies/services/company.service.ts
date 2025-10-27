import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { DataService } from '@core/services/data.service';
import {
  Company,
  CompanyDetail,
  CompanyListResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  Country,
  StatusFilter
} from '../models/company.model';

/**
 * CompanyService - Gestiona empresas con Signals
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
export class CompanyService {
  private readonly dataService = inject(DataService);

  // Signals para estado reactivo
  readonly companies = signal<Company[]>([]);
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
   * Obtiene la lista de empresas con paginación y filtros
   */
  getCompanies(
    page: number,
    pageSize: number,
    status?: string | null,
    filter?: string
  ): Observable<CompanyListResponse> {
    this.isLoading.set(true);

    let url = `Company/CompaniesList?pageNumber=${page + 1}&pageSize=${pageSize}`;

    if (status) {
      url += `&status=${status}`;
    }

    if (filter) {
      url += `&filter=${encodeURIComponent(filter)}`;
    }

    return this.dataService.get$<CompanyListResponse>(url).pipe(
      tap((response) => {
        this.companies.set(response.data);
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
   * Obtiene los detalles de una empresa por ID
   */
  getCompanyById(id: number): Observable<CompanyDetail> {
    return this.dataService.get$<CompanyDetail>(
      `Company/CompanyDetail?idCompany=${id}`
    );
  }

  /**
   * Crea una nueva empresa
   */
  createCompany(request: CreateCompanyRequest): Observable<Company> {
    return this.dataService.post$<Company>('Company/CreateCompany', request);
  }

  /**
   * Actualiza una empresa existente
   */
  updateCompany(id: number, request: UpdateCompanyRequest): Observable<Company> {
    return this.dataService.put$<Company>(
      `Company/EditCompany?idCompany=${id}`,
      request
    );
  }

  /**
   * Cambia el estado (activo/inactivo) de una empresa
   * Endpoint: Company/ActiveCompany
   *
   * @param id ID de la empresa
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
      `Company/ActiveCompany?idCompany=${id}&status=${newStatus}`,
      null
    );
  }

  /**
   * Obtiene la lista de países para el select
   */
  getCountries(): Observable<Country[]> {
    return this.dataService.get$<Country[]>('Location/CountryList');
  }
}
