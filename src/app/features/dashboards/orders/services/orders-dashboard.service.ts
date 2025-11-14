import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { OrderStatusType } from '@shared/enums/order-status.enum';
import {
  OrdersFilters,
  OrderStatusKpi,
  OrdersByStatusItem,
  OrdersByStatusSummaryResponse,
  CountResponse,
  AvgValueResponse,
  OrdersDashboardData
} from '../models';

/**
 * Respuesta estándar de la API
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

/**
 * OrdersDashboardService
 *
 * Servicio para obtener datos del dashboard de órdenes.
 * Maneja las llamadas a los diferentes endpoints de estadísticas de órdenes.
 */
@Injectable({
  providedIn: 'root'
})
export class OrdersDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiURLDash}orders`;

  /**
   * Construye los parámetros HTTP desde los filtros
   */
  private buildParams(filters: OrdersFilters): HttpParams {
    let params = new HttpParams();

    if (filters.brandId !== undefined && filters.brandId !== null) {
      params = params.set('BrandId', filters.brandId.toString());
    }
    if (filters.startDate) {
      params = params.set('StartDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('EndDate', filters.endDate);
    }
    if (filters.approved !== undefined) {
      params = params.set('Approved', filters.approved.toString());
    }
    if (filters.excludedStatusId !== undefined) {
      params = params.set('ExcludedStatusId', filters.excludedStatusId.toString());
    }
    if (filters.orderStatusId !== undefined) {
      params = params.set('OrderStatusId', filters.orderStatusId.toString());
    }

    return params;
  }

  /**
   * Obtiene el conteo de órdenes para un estado específico
   */
  private getCountByStatus(filters: OrdersFilters, statusId: OrderStatusType): Observable<number> {
    const params = this.buildParams({ ...filters, orderStatusId: statusId });

    return this.http.get<ApiResponse<CountResponse>>(`${this.baseUrl}/count-by-status`, { params }).pipe(
      map(response => response.data?.total ?? 0),
      catchError(error => {
        console.error(`Error getting count for status ${statusId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene los KPIs de todos los estados principales
   */
  getStatusKpis(filters: OrdersFilters): Observable<OrderStatusKpi[]> {
    // Definir los estados principales con sus metadatos
    const statusConfigs: Array<{
      statusId: OrderStatusType;
      statusName: string;
      icon: string;
      color: string;
    }> = [
      { statusId: OrderStatusType.Recibida, statusName: 'Recibidas', icon: 'pi-inbox', color: 'primary-500' },
      { statusId: OrderStatusType.Preparandose, statusName: 'Preparándose', icon: 'pi-clock', color: 'primary-400' },
      { statusId: OrderStatusType.OrdenAceptada, statusName: 'Aceptadas', icon: 'pi-check-circle', color: 'primary-600' },
      { statusId: OrderStatusType.EnCamino, statusName: 'En Camino', icon: 'pi-car', color: 'primary-200' },
      { statusId: OrderStatusType.Entregada, statusName: 'Entregadas', icon: 'pi-check', color: 'success-500' },
      { statusId: OrderStatusType.Cancelada, statusName: 'Canceladas', icon: 'pi-times-circle', color: 'danger-500' }
    ];

    // Hacer todas las peticiones en paralelo
    const requests = statusConfigs.map(config =>
      this.getCountByStatus(filters, config.statusId).pipe(
        map(count => ({
          statusId: config.statusId,
          statusName: config.statusName,
          count,
          icon: config.icon,
          color: config.color
        }))
      )
    );

    return forkJoin(requests).pipe(
      catchError(error => {
        console.error('Error loading status KPIs:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene el resumen de órdenes por estado (para tabla y donut)
   */
  getOrdersByStatus(filters: OrdersFilters): Observable<OrdersByStatusItem[]> {
    const params = this.buildParams(filters);

    return this.http.get<ApiResponse<OrdersByStatusSummaryResponse>>(
      `${this.baseUrl}/by-status/summary`,
      { params }
    ).pipe(
      map(response => response.data?.items ?? []),
      catchError(error => {
        console.error('Error loading orders by status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene el promedio de órdenes por hora
   */
  getAvgPerHour(filters: OrdersFilters): Observable<number> {
    const params = this.buildParams(filters);

    return this.http.get<ApiResponse<AvgValueResponse>>(`${this.baseUrl}/avg-per-hour`, { params }).pipe(
      map(response => response.data?.value ?? 0),
      catchError(error => {
        console.error('Error loading avg per hour:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene el conteo de clientes recurrentes
   */
  getRecurrentCustomers(filters: OrdersFilters): Observable<number> {
    const params = this.buildParams(filters);

    return this.http.get<ApiResponse<CountResponse>>(`${this.baseUrl}/recurrent-customers/count`, { params }).pipe(
      map(response => response.data?.total ?? 0),
      catchError(error => {
        console.error('Error loading recurrent customers:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todos los datos del dashboard en una sola llamada
   */
  getDashboardData(filters: OrdersFilters): Observable<OrdersDashboardData> {
    return forkJoin({
      statusKpis: this.getStatusKpis(filters),
      ordersByStatus: this.getOrdersByStatus(filters),
      avgPerHour: this.getAvgPerHour(filters),
      recurrentCustomers: this.getRecurrentCustomers(filters)
    }).pipe(
      catchError(error => {
        console.error('Error loading dashboard data:', error);
        return throwError(() => error);
      })
    );
  }
}
