import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import type {
  ApiResponse,
  CancellationSummaryDto,
  CancellationsByBrandDto,
  CancellationsByChannelDto,
  CancellationsByStoreDto,
  CanceledOrderListItemDto,
  PagedResultDto,
  CancellationsFilters,
  CancellationsDashboardData
} from '../models';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CancelacionesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiURLDash}Cancellations`;

  /**
   * Get cancellations summary (KPIs)
   */
  getSummary(filters: CancellationsFilters): Observable<CancellationSummaryDto> {
    const params = this.buildParams(filters);
    return this.http.get<ApiResponse<CancellationSummaryDto>>(`${this.baseUrl}/summary`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener resumen de cancelaciones');
        }),
        catchError(error => {
          console.error('Error fetching cancellations summary:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get cancellations by brand
   */
  getByBrand(filters: CancellationsFilters): Observable<CancellationsByBrandDto[]> {
    const params = this.buildParams(filters);
    return this.http.get<ApiResponse<CancellationsByBrandDto[]>>(`${this.baseUrl}/by-brand`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener cancelaciones por marca');
        }),
        catchError(error => {
          console.error('Error fetching cancellations by brand:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get cancellations by channel
   */
  getByChannel(filters: CancellationsFilters): Observable<CancellationsByChannelDto[]> {
    const params = this.buildParams(filters);
    return this.http.get<ApiResponse<CancellationsByChannelDto[]>>(`${this.baseUrl}/by-channel`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener cancelaciones por canal');
        }),
        catchError(error => {
          console.error('Error fetching cancellations by channel:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get cancellations by store/unit
   */
  getByStore(filters: CancellationsFilters): Observable<CancellationsByStoreDto[]> {
    const params = this.buildParams(filters);
    return this.http.get<ApiResponse<CancellationsByStoreDto[]>>(`${this.baseUrl}/by-store`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener cancelaciones por unidad');
        }),
        catchError(error => {
          console.error('Error fetching cancellations by store:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get paginated list of canceled orders
   */
  getList(filters: CancellationsFilters): Observable<PagedResultDto<CanceledOrderListItemDto>> {
    const params = this.buildParams(filters);
    return this.http.get<ApiResponse<PagedResultDto<CanceledOrderListItemDto>>>(`${this.baseUrl}/list`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Error al obtener lista de cancelaciones');
        }),
        catchError(error => {
          console.error('Error fetching cancellations list:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get all dashboard data at once
   */
  getDashboardData(filters: CancellationsFilters): Observable<CancellationsDashboardData> {
    // Validate dates are required
    if (!filters.startDate || !filters.endDate) {
      return throwError(() => new Error('Las fechas de inicio y fin son obligatorias'));
    }

    // Crear filtros base sin paginación para los endpoints que no la necesitan
    const baseFilters: CancellationsFilters = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      approved: filters.approved,
      brandId: filters.brandId
    };

    // Crear filtros con paginación solo para el endpoint list
    const listFilters: CancellationsFilters = {
      ...baseFilters,
      pageNumber: (typeof filters.pageNumber === 'number' && !isNaN(filters.pageNumber)) ? filters.pageNumber : 1,
      pageSize: (typeof filters.pageSize === 'number' && !isNaN(filters.pageSize)) ? filters.pageSize : 10
    };

    return forkJoin({
      summary: this.getSummary(baseFilters),
      byBrand: this.getByBrand(baseFilters),
      byChannel: this.getByChannel(baseFilters),
      byStore: this.getByStore(baseFilters),
      list: this.getList(listFilters)
    }).pipe(
      catchError(error => {
        console.error('Error loading dashboard data:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Build HTTP params from filters
   */
  private buildParams(filters: CancellationsFilters): HttpParams {
    let params = new HttpParams();

    if (filters.startDate) {
      params = params.set('StartDate', filters.startDate.toISOString());
    }

    if (filters.endDate) {
      params = params.set('EndDate', filters.endDate.toISOString());
    }

    if (filters.brandId !== undefined) {
      params = params.set('BrandId', filters.brandId.toString());
    }

    if (filters.approved !== undefined) {
      params = params.set('Approved', filters.approved.toString());
    }

    // Solo agregar paginación si son números válidos (no NaN)
    if (typeof filters.pageNumber === 'number' && !isNaN(filters.pageNumber)) {
      params = params.set('PageNumber', filters.pageNumber.toString());
    }

    if (typeof filters.pageSize === 'number' && !isNaN(filters.pageSize)) {
      params = params.set('PageSize', filters.pageSize.toString());
    }

    return params;
  }
}
