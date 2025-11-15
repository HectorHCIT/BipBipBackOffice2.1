import { Injectable, signal, computed, inject } from '@angular/core';
import { DataService } from '@core/services/data.service';
import { Observable, tap, forkJoin } from 'rxjs';
import {
  FiscalCorrelative,
  FiscalCorrelativeDetail,
  FiscalCorrelativeListResponse,
  CreateFiscalCorrelativeRequest,
  UpdateFiscalCorrelativeRequest,
  CompanySummary,
  CountrySummary,
  EstablishmentSummary,
  EmissionPointSummary,
  DocumentTypeSummary,
  StatusFilter
} from '../models/fiscal-correlative.model';

/**
 * FiscalCorrelativeService - Servicio para gestión de correlativos fiscales
 *
 * Patrón: Signals para estado reactivo + DataService para HTTP
 * NO hacemos transformaciones de datos
 */
@Injectable({ providedIn: 'root' })
export class FiscalCorrelativeService {
  private readonly dataService = inject(DataService);

  // Estado reactivo con Signals
  readonly fiscalCorrelatives = signal<FiscalCorrelative[]>([]);
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

  // Datos de referencia para lookups (cargados una vez al iniciar)
  readonly companies = signal<CompanySummary[]>([]);
  readonly countries = signal<CountrySummary[]>([]);
  readonly establishments = signal<EstablishmentSummary[]>([]);
  readonly emissionPoints = signal<EmissionPointSummary[]>([]);
  readonly documentTypes = signal<DocumentTypeSummary[]>([]);

  // Computed para total de páginas
  readonly totalPages = computed(() => {
    const total = this.totalRecords();
    const size = this.pageSize();
    return Math.ceil(total / size);
  });

  /**
   * Obtiene la lista de correlativos fiscales con paginación
   * Endpoint: CorrelativeBilling/CorrelativeBillingList
   */
  getFiscalCorrelatives(
    page: number,
    pageSize: number,
    status: string | null = null,
    searchTerm: string = ''
  ): Observable<FiscalCorrelativeListResponse> {
    this.isLoading.set(true);

    // Construir query params
    let url = `CorrelativeBilling/CorrelativeBillingList?pageNumber=${page + 1}&pageSize=${pageSize}`;

    if (status !== null) {
      url += `&status=${status}`;
    }

    if (searchTerm.trim()) {
      url += `&filter=${encodeURIComponent(searchTerm.trim())}`;
    }

    return this.dataService.get$<FiscalCorrelativeListResponse>(url).pipe(
      tap({
        next: (response) => {
          this.fiscalCorrelatives.set(response.data);
          this.totalRecords.set(response.metadata.totalCount);

          // Actualizar contadores de filtros
          this.statusFilters.update(filters => filters.map(filter => ({
            ...filter,
            qty: filter.idStatus === 0 ? response.metadata.totalCount :
                 filter.idStatus === 1 ? response.metadata.totalActive :
                 response.metadata.totalInactive
          })));

          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * Obtiene el detalle de un correlativo fiscal
   * Endpoint: CorrelativeBilling/CorrelativeBillingDetail
   */
  getFiscalCorrelativeById(id: number): Observable<FiscalCorrelativeDetail> {
    return this.dataService.get$<FiscalCorrelativeDetail>(
      `CorrelativeBilling/CorrelativeBillingDetail?CorrBillId=${id}`
    );
  }

  /**
   * Crea un nuevo correlativo fiscal
   * Endpoint: CorrelativeBilling/CreateCorrelativeBilling
   */
  createFiscalCorrelative(data: CreateFiscalCorrelativeRequest): Observable<FiscalCorrelativeListResponse> {
    return this.dataService.post$<FiscalCorrelativeListResponse>(
      'CorrelativeBilling/CreateCorrelativeBilling',
      data
    );
  }

  /**
   * Actualiza un correlativo fiscal existente
   * Endpoint: CorrelativeBilling/UpdateCorrelativeBill
   */
  updateFiscalCorrelative(id: number, data: UpdateFiscalCorrelativeRequest): Observable<FiscalCorrelativeListResponse> {
    return this.dataService.put$<FiscalCorrelativeListResponse>(
      `CorrelativeBilling/UpdateCorrelativeBill?idCorrBill=${id}`,
      data
    );
  }

  /**
   * Cambia el estado (activo/inactivo) de un correlativo fiscal
   * Endpoint: CorrelativeBilling/EnableCorrelativeBill
   *
   * IMPORTANTE: Invierte el estado recibido antes de enviarlo al API
   * Esto es porque el toggle ya cambió el valor en el template
   */
  changeStatus(id: number, currentStatus: boolean): Observable<any> {
    // Invertir: si está activo (true), enviar false para desactivar
    const newStatus = !currentStatus;
    return this.dataService.put$(
      `CorrelativeBilling/EnableCorrelativeBill?idCorrBill=${id}&statusCorrBill=${newStatus}`,
      null
    );
  }

  /**
   * Obtiene lista de empresas para el select
   * Endpoint: Company/summary
   * También actualiza el signal de companies para lookups
   */
  getCompaniesSummary(): Observable<CompanySummary[]> {
    return this.dataService.get$<CompanySummary[]>('Company/summary').pipe(
      tap(companies => this.companies.set(companies))
    );
  }

  /**
   * Obtiene lista de países para el select
   * Endpoint: Location/CountryList
   * También actualiza el signal de countries para lookups (banderas)
   */
  getCountriesSummary(): Observable<CountrySummary[]> {
    return this.dataService.get$<CountrySummary[]>('Location/CountryList').pipe(
      tap(countries => this.countries.set(countries))
    );
  }

  /**
   * Obtiene lista de establecimientos para el select
   * Endpoint: Establishment/summary
   * También actualiza el signal de establishments para lookups
   */
  getEstablishmentsSummary(): Observable<EstablishmentSummary[]> {
    return this.dataService.get$<EstablishmentSummary[]>('Establishment/summary').pipe(
      tap(establishments => this.establishments.set(establishments))
    );
  }

  /**
   * Obtiene lista de puntos de emisión para el select
   * Endpoint: EmissionPoint/summary
   * También actualiza el signal de emissionPoints para lookups
   */
  getEmissionPointsSummary(): Observable<EmissionPointSummary[]> {
    return this.dataService.get$<EmissionPointSummary[]>('EmissionPoint/summary').pipe(
      tap(emissionPoints => this.emissionPoints.set(emissionPoints))
    );
  }

  /**
   * Obtiene lista de tipos de documento para el select
   * Endpoint: DocumentType/summary
   * También actualiza el signal de documentTypes para lookups
   */
  getDocumentTypesSummary(): Observable<DocumentTypeSummary[]> {
    return this.dataService.get$<DocumentTypeSummary[]>('DocumentType/summary').pipe(
      tap(documentTypes => this.documentTypes.set(documentTypes))
    );
  }

  /**
   * Carga todos los datos de referencia en paralelo
   * Se llama al iniciar el componente para tener los datos disponibles para lookups
   */
  loadReferenceData(): void {
    forkJoin({
      companies: this.getCompaniesSummary(),
      countries: this.getCountriesSummary(),
      establishments: this.getEstablishmentsSummary(),
      emissionPoints: this.getEmissionPointsSummary(),
      documentTypes: this.getDocumentTypesSummary()
    }).subscribe({
      next: () => {
        // Los signals ya se actualizaron en cada tap()
      },
      error: (error) => {
        console.error('Error loading reference data:', error);
      }
    });
  }
}
