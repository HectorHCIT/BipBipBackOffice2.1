import { Injectable, signal, computed, inject } from '@angular/core';
import { DataService } from '@core/services/data.service';
import { Observable, tap } from 'rxjs';
import {
  DocumentType,
  DocumentTypeDetail,
  DocumentTypeListResponse,
  CreateDocumentTypeRequest,
  UpdateDocumentTypeRequest,
  StatusFilter
} from '../models/document-type.model';

/**
 * DocumentTypeService - Servicio para gestión de tipos de documento
 *
 * Patrón: Signals para estado reactivo + DataService para HTTP
 * NO hacemos transformaciones de datos
 */
@Injectable({ providedIn: 'root' })
export class DocumentTypeService {
  private readonly dataService = inject(DataService);

  // Estado reactivo con Signals
  readonly documentTypes = signal<DocumentType[]>([]);
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
   * Obtiene la lista de tipos de documento con paginación
   * Endpoint: DocumentType/DocumentTypesList
   */
  getDocumentTypes(
    page: number = 0,
    pageSize: number = 5,
    status: string | null = null,
    filter: string = ''
  ): Observable<DocumentTypeListResponse> {
    this.isLoading.set(true);

    // Construir query params
    let url = `DocumentType/DocumentTypesList?pageNumber=${page + 1}&pageSize=${pageSize}`;

    if (status) {
      url += `&status=${status}`;
    }

    if (filter) {
      url += `&filter=${encodeURIComponent(filter)}`;
    }

    return this.dataService.get$<DocumentTypeListResponse>(url).pipe(
      tap((response) => {
        // Actualizar Signals directamente con la respuesta
        this.documentTypes.set(response.data);
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
   * Obtiene los detalles completos de un tipo de documento
   * Endpoint: DocumentType/DocumentTypesDetail
   */
  getDocumentTypeById(id: number): Observable<DocumentTypeDetail> {
    return this.dataService.get$<DocumentTypeDetail>(
      `DocumentType/DocumentTypesDetail?id=${id}`
    );
  }

  /**
   * Crea un nuevo tipo de documento
   * Endpoint: DocumentType/CreateDocumentType
   */
  createDocumentType(request: CreateDocumentTypeRequest): Observable<any> {
    return this.dataService.post$('DocumentType/CreateDocumentType', request);
  }

  /**
   * Actualiza un tipo de documento existente
   * Endpoint: DocumentType/EditDocumentType
   */
  updateDocumentType(id: number, request: UpdateDocumentTypeRequest): Observable<any> {
    return this.dataService.put$(`DocumentType/EditDocumentType?idDocumentType=${id}`, request);
  }

  /**
   * Cambia el estado (activo/inactivo) de un tipo de documento
   * Endpoint: DocumentType/ChangeStatus
   */
  changeStatus(id: number, status: boolean): Observable<any> {
    return this.dataService.put$(
      `DocumentType/ChangeStatus?idDocumentType=${id}&status=${status}`,
      {}
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
    this.documentTypes.set([]);
    this.totalRecords.set(0);
    this.currentPage.set(0);
    this.searchTerm.set('');
    this.selectedStatus.set(null);
    this.isLoading.set(false);
  }
}
