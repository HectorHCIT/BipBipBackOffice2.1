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
  OrdersByUnitItem,
  OrdersByCityItem,
  OrdersByChannelItem,
  OrdersByChannelSummaryResponse,
  OrdersByBrandItem,
  AvgTicketByBrandItem,
  AvgTicketByChannelItem,
  AvgTicketByPaymentMethodItem,
  ShippingCostsByDayItem,
  ShippingRangeItem,
  ShippingStatistics,
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
   * Obtiene las órdenes agrupadas por tienda/unidad
   */
  getOrdersByUnit(filters: OrdersFilters): Observable<OrdersByUnitItem[]> {
    const params = this.buildParams(filters).set('TopN', '10');

    return this.http.get<ApiResponse<OrdersByUnitItem[]>>(
      `${this.baseUrl}/by-store/top`,
      { params }
    ).pipe(
      map(response => response.data ?? []),
      catchError(error => {
        console.error('Error loading orders by unit:', error);
        // Retornar array vacío en caso de error para no romper el dashboard
        return [[]];
      })
    );
  }

  /**
   * Obtiene las órdenes agrupadas por ciudad
   */
  getOrdersByCity(filters: OrdersFilters): Observable<OrdersByCityItem[]> {
    const params = this.buildParams(filters).set('TopN', '10');

    return this.http.get<ApiResponse<OrdersByCityItem[]>>(
      `${this.baseUrl}/by-city/top`,
      { params }
    ).pipe(
      map(response => response.data ?? []),
      catchError(error => {
        console.error('Error loading orders by city:', error);
        // Retornar array vacío en caso de error para no romper el dashboard
        return [[]];
      })
    );
  }

  /**
   * Obtiene las órdenes agrupadas por canal/tipo de entrega
   */
  getOrdersByChannel(filters: OrdersFilters): Observable<OrdersByChannelItem[]> {
    const params = this.buildParams(filters);

    return this.http.get<ApiResponse<OrdersByChannelSummaryResponse>>(
      `${this.baseUrl}/by-channel/summary`,
      { params }
    ).pipe(
      map(response => response.data?.items ?? []),
      catchError(error => {
        console.error('Error loading orders by channel:', error);
        // Retornar array vacío en caso de error para no romper el dashboard
        return [[]];
      })
    );
  }

  /**
   * Obtiene las órdenes agrupadas por marca con logos y totales de ventas
   */
  getOrdersByBrand(filters: OrdersFilters): Observable<OrdersByBrandItem[]> {
    const params = this.buildParams(filters).set('TopN', '10');

    return this.http.get<ApiResponse<OrdersByBrandItem[]>>(
      `${this.baseUrl}/brand-sales/summary`,
      { params }
    ).pipe(
      map(response => response.data ?? []),
      catchError(error => {
        console.error('Error loading orders by brand:', error);
        // Retornar array vacío en caso de error para no romper el dashboard
        return [[]];
      })
    );
  }

  /**
   * Obtiene el ticket promedio global
   */
  getAvgTicketGlobal(filters: OrdersFilters): Observable<number> {
    const params = this.buildParams(filters);

    return this.http.get<ApiResponse<AvgValueResponse>>(`${this.baseUrl}/avg-ticket/global`, { params }).pipe(
      map(response => response.data?.value ?? 0),
      catchError(error => {
        console.error('Error loading global avg ticket:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene el ticket promedio por marca (Top 10)
   */
  getAvgTicketByBrand(filters: OrdersFilters): Observable<AvgTicketByBrandItem[]> {
    const params = this.buildParams(filters).set('TopN', '10');

    return this.http.get<ApiResponse<AvgTicketByBrandItem[]>>(
      `${this.baseUrl}/avg-ticket/by-brand/top`,
      { params }
    ).pipe(
      map(response => response.data ?? []),
      catchError(error => {
        console.error('Error loading avg ticket by brand:', error);
        // Retornar array vacío en caso de error para no romper el dashboard
        return [[]];
      })
    );
  }

  /**
   * Obtiene el ticket promedio por canal (Top 10)
   */
  getAvgTicketByChannel(filters: OrdersFilters): Observable<AvgTicketByChannelItem[]> {
    const params = this.buildParams(filters).set('TopN', '10');

    return this.http.get<ApiResponse<AvgTicketByChannelItem[]>>(
      `${this.baseUrl}/avg-ticket/by-channel/top`,
      { params }
    ).pipe(
      map(response => response.data ?? []),
      catchError(error => {
        console.error('Error loading avg ticket by channel:', error);
        // Retornar array vacío en caso de error para no romper el dashboard
        return [[]];
      })
    );
  }

  /**
   * Obtiene el ticket promedio por método de pago (Top 10)
   */
  getAvgTicketByPaymentMethod(filters: OrdersFilters): Observable<AvgTicketByPaymentMethodItem[]> {
    const params = this.buildParams(filters).set('TopN', '10');

    return this.http.get<ApiResponse<AvgTicketByPaymentMethodItem[]>>(
      `${this.baseUrl}/avg-ticket/by-payment-method/top`,
      { params }
    ).pipe(
      map(response => response.data ?? []),
      catchError(error => {
        console.error('Error loading avg ticket by payment method:', error);
        // Retornar array vacío en caso de error para no romper el dashboard
        return [[]];
      })
    );
  }

  /**
   * Obtiene los costos de envío agrupados por día
   */
  getShippingCostsByDay(filters: OrdersFilters): Observable<ShippingCostsByDayItem[]> {
    const params = this.buildParams(filters);

    return this.http.get<ApiResponse<ShippingCostsByDayItem[]>>(
      `${this.baseUrl}/shipping-costs/by-day`,
      { params }
    ).pipe(
      map(response => response.data ?? []),
      catchError(error => {
        console.error('Error loading shipping costs by day:', error);
        // Retornar array vacío en caso de error para no romper el dashboard
        return [[]];
      })
    );
  }

  /**
   * Obtiene los rangos de costos de envío
   * TODO: Reemplazar con endpoint real cuando esté disponible
   * Endpoint esperado: GET /api/v1/orders/shipping-costs/by-range
   */
  getShippingRanges(filters: OrdersFilters): Observable<ShippingRangeItem[]> {
    // Datos mockeados basados en la imagen del usuario
    const mockData: ShippingRangeItem[] = [
      { rangoKm: '7.0000 - 100000.0000 km', totalCostoEnvios: 170, totalPagosEnvios: 140 },
      { rangoKm: '7.0000 - 10.0000 km', totalCostoEnvios: 67743, totalPagosEnvios: 70434 },
      { rangoKm: '5.0000 - 7.0000 km', totalCostoEnvios: 146919, totalPagosEnvios: 159566 },
      { rangoKm: '5.0000 - 12.5000 km', totalCostoEnvios: 8669, totalPagosEnvios: 10710 },
      { rangoKm: '3.0000 - 5.0000 km', totalCostoEnvios: 395433, totalPagosEnvios: 418705 },
      { rangoKm: '2.0000 - 3.0000 km', totalCostoEnvios: 7560, totalPagosEnvios: 7319 }
    ];

    console.warn('🚧 Using MOCKED data for shipping ranges. Replace with real API call when endpoint is available.');

    return new Observable(observer => {
      observer.next(mockData);
      observer.complete();
    });
  }

  /**
   * Obtiene las estadísticas de envíos (KPIs)
   * TODO: Reemplazar con endpoint real cuando esté disponible
   * Endpoint esperado: GET /api/v1/orders/shipping-costs/statistics
   */
  getShippingStatistics(filters: OrdersFilters): Observable<ShippingStatistics> {
    // Datos mockeados basados en la imagen del usuario
    const mockData: ShippingStatistics = {
      promedioPagosEnvio: 48.52,
      promedioCostoEnvio: 50.59,
      costoMaximoEnvio: 159,
      totalCostosEnvio: 2411308,
      totalPagosEnvio: 2312438
    };

    console.warn('🚧 Using MOCKED data for shipping statistics. Replace with real API call when endpoint is available.');

    return new Observable(observer => {
      observer.next(mockData);
      observer.complete();
    });
  }

  /**
   * Obtiene todos los datos del dashboard en una sola llamada
   */
  getDashboardData(filters: OrdersFilters): Observable<OrdersDashboardData> {
    return forkJoin({
      statusKpis: this.getStatusKpis(filters),
      ordersByStatus: this.getOrdersByStatus(filters),
      avgPerHour: this.getAvgPerHour(filters),
      recurrentCustomers: this.getRecurrentCustomers(filters),
      ordersByUnit: this.getOrdersByUnit(filters),
      ordersByCity: this.getOrdersByCity(filters),
      ordersByChannel: this.getOrdersByChannel(filters),
      ordersByBrand: this.getOrdersByBrand(filters),
      avgTicketGlobal: this.getAvgTicketGlobal(filters),
      avgTicketByBrand: this.getAvgTicketByBrand(filters),
      avgTicketByChannel: this.getAvgTicketByChannel(filters),
      avgTicketByPaymentMethod: this.getAvgTicketByPaymentMethod(filters),
      shippingCostsByDay: this.getShippingCostsByDay(filters),
      shippingRanges: this.getShippingRanges(filters),
      shippingStatistics: this.getShippingStatistics(filters)
    }).pipe(
      catchError(error => {
        console.error('Error loading dashboard data:', error);
        return throwError(() => error);
      })
    );
  }
}
