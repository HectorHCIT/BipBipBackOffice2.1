import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { DataService } from '@core/services/data.service';
import {
  TrackOrderList,
  OrderListResponse,
  OrderMetadata,
  OrderSearchParams,
  OrderAdvancedFilters,
  VolumeData,
  VolumeChartData,
  ChartSeriesData,
  CancelReason,
  CancelOrderRequest,
  TrackOrderDetails,
  DriverList,
  DriverDetails,
  DriverStatus,
  ReAssignDriver,
  MotivePenalized,
  CustomerPenalty,
  CreateIncidentRequest,
  ChangeStoreRequest,
  ProductSplit
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderTrackingService {
  private readonly dataService = inject(DataService);

  // State signals
  readonly orders = signal<TrackOrderList[]>([]);
  readonly metadata = signal<OrderMetadata | null>(null);
  readonly isLoading = signal(false);

  // Computed signals
  readonly hasOrders = computed(() => this.orders().length > 0);
  readonly orderCount = computed(() => this.orders().length);
  readonly totalCount = computed(() => this.metadata()?.totalCount || 0);

  /**
   * Busca órdenes con parámetros simples (búsqueda por texto y filtro de tiempo)
   */
  searchOrders(params: OrderSearchParams): Observable<OrderListResponse> {
    this.isLoading.set(true);

    return this.dataService.get$<OrderListResponse>('OrderTracking/OrderSearchByOptions', {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      ...(params.option && { option: params.option }),
      ...(params.filter && { filter: params.filter }),
      ...(params.showNotApproved !== undefined && { showNotApproved: params.showNotApproved })
    }).pipe(
      tap({
        next: (response) => {
          this.orders.set(response.records);
          this.metadata.set(response.metadata);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * Busca órdenes con filtros avanzados (país, ciudad, marca, fechas)
   */
  searchWithAdvancedFilters(filters: OrderAdvancedFilters): Observable<OrderListResponse> {
    this.isLoading.set(true);

    return this.dataService.get$<OrderListResponse>('OrderTracking/OrdersByFilters', {
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      ...(filters.StartDate && { StartDate: filters.StartDate }),
      ...(filters.EndDate && { EndDate: filters.EndDate }),
      CountryIds: filters.CountryIds.join(','),
      CityIds: filters.CityIds.join(','),
      ...(filters.Brands && filters.Brands.length > 0 && { Brands: filters.Brands.join(',') })
    }).pipe(
      tap({
        next: (response) => {
          this.orders.set(response.records);
          this.metadata.set(response.metadata);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * Limpia el estado del servicio
   */
  clearState(): void {
    this.orders.set([]);
    this.metadata.set(null);
    this.isLoading.set(false);
  }

  /**
   * Obtiene datos de volumen de órdenes pendientes
   */
  getVolumeOrders(optionTime: number): Observable<VolumeChartData> {
    return this.dataService.get$<VolumeData[]>('OrderTracking/GetOrderVol', {
      OptionTime: optionTime
    }).pipe(
      map(data => this.convertToChartData(data, 'Pedidos Pendientes'))
    );
  }

  /**
   * Obtiene datos de volumen de órdenes completadas
   */
  getVolumeCompletedOrders(optionTime: number): Observable<VolumeChartData> {
    return this.dataService.get$<VolumeData[]>('OrderTracking/GetVolCompletedOrders', {
      OptionTime: optionTime
    }).pipe(
      map(data => this.convertToChartData(data, 'Pedidos Completados'))
    );
  }

  /**
   * Obtiene datos de volumen de órdenes canceladas
   */
  getVolumeCancelledOrders(optionTime: number): Observable<VolumeChartData> {
    return this.dataService.get$<VolumeData[]>('OrderTracking/GetVolCancelledOrders', {
      OptionTime: optionTime
    }).pipe(
      map(data => this.convertToChartData(data, 'Pedidos Cancelados'))
    );
  }

  /**
   * Obtiene la lista de motivos de cancelación
   */
  getCancelReasons(): Observable<CancelReason[]> {
    return this.dataService.get$<CancelReason[]>('OrderTracking/cancel/reasons');
  }

  /**
   * Cancela una orden
   */
  cancelOrder(data: CancelOrderRequest): Observable<any> {
    return this.dataService.post$('OrderTracking/CancelOrders', data);
  }

  /**
   * Convierte datos de la API al formato requerido por el gráfico
   */
  private convertToChartData(data: VolumeData[], name: string): VolumeChartData {
    const series: ChartSeriesData[] = data.map(item => ({
      name: item.timeLapse,
      value: item.orderQuantity
    }));

    return {
      name,
      series
    };
  }

  // ============================================
  // Order Detail Methods
  // ============================================

  /**
   * Obtiene el detalle completo de una orden
   */
  getOrderDetail(numOrder: number): Observable<TrackOrderDetails> {
    return this.dataService.get$<TrackOrderDetails>('OrderTracking/OrdersTrackingById', {
      idOrders: numOrder
    });
  }

  /**
   * Completa una orden
   */
  completeOrder(orderId: number): Observable<any> {
    return this.dataService.post$(`OrderTracking/complete?orderId=${orderId}`, {});
  }

  /**
   * Envía una orden programada
   */
  sendOrder(orderId: number): Observable<any> {
    return this.dataService.put$(`OrderTracking/schedule/send?orderId=${orderId}`, {});
  }

  /**
   * Obtiene productos para split payment
   */
  getProducts(productIds: string[]): Observable<ProductSplit[]> {
    const params = productIds.reduce((acc, id, index) => ({
      ...acc,
      [`productId[${index}]`]: id
    }), {});

    return this.dataService.get$<ProductSplit[]>('OrderTracking/searchProduct', params);
  }

  // ============================================
  // Driver Management Methods
  // ============================================

  /**
   * Asigna un driver a una orden
   */
  assignDriver(data: ReAssignDriver): Observable<any> {
    return this.dataService.post$(
      `OrderTracking/assign?driverId=${data.driverId}&orderId=${data.orderId}`,
      { comments: data.comments || '' }
    );
  }

  /**
   * Reasigna un driver a una orden
   */
  reassignDriver(data: ReAssignDriver): Observable<any> {
    return this.dataService.post$(
      `OrderTracking/reassign?driverId=${data.driverId}&orderId=${data.orderId}`,
      { comments: data.comments || '' }
    );
  }

  /**
   * Libera un driver de una orden
   */
  releaseDriver(data: ReAssignDriver): Observable<any> {
    return this.dataService.post$(
      `OrderTracking/release?driverId=${data.driverId}&orderId=${data.orderId}`,
      { comments: data.comments || '' }
    );
  }

  /**
   * Obtiene la lista de motivos de penalización
   */
  getPenaltyReasons(): Observable<any[]> {
    return this.dataService.get$<any[]>('Driver/penalties/summary', {});
  }

  /**
   * Penaliza un driver
   */
  penalizeDriver(data: MotivePenalized): Observable<any> {
    return this.dataService.post$('Driver/penalize', data);
  }

  /**
   * Penaliza un cliente
   */
  penalizeCustomer(data: CustomerPenalty): Observable<any> {
    return this.dataService.post$('Customer/penalize', data);
  }

  /**
   * Obtiene la lista de motivos de penalización para clientes
   * (asumiendo que usa el mismo catálogo que drivers)
   */
  getCustomerPenaltyReasons(): Observable<any[]> {
    // Si hay un endpoint específico, usar: 'Customer/penalty/reasons'
    // De lo contrario, usar el mismo que drivers
    return this.dataService.get$('OrderTracking/penalty/reasons');
  }

  /**
   * Obtiene la lista de drivers disponibles por ciudad
   */
  getDriverByCity(cityId: number): Observable<DriverList[]> {
    return this.dataService.get$<DriverList[]>('Driver/DriverByCity/summary', {
      cityId
    });
  }

  /**
   * Obtiene el detalle completo de un driver
   */
  getDriverDetails(driverId: number): Observable<DriverDetails> {
    return this.dataService.get$<DriverDetails>('Driver/DriverById', {
      IdDriver: driverId
    });
  }

  /**
   * Obtiene el estado actual de un driver
   */
  getDriverStatus(driverId: number): Observable<DriverStatus> {
    return this.dataService.get$<DriverStatus>(`Driver/status/${driverId}`, {});
  }

  // ============================================
  // Incident Methods
  // ============================================

  /**
   * Crea una incidencia para una orden
   */
  createIncident(data: CreateIncidentRequest): Observable<any> {
    return this.dataService.post$('OrderTracking/ocurrency', data);
  }

  /**
   * Obtiene las incidencias de una orden
   */
  getOrderIncidents(orderId: number): Observable<any[]> {
    return this.dataService.get$<any[]>('OrderTracking/order/incidents', {
      orderId
    });
  }

  // ============================================
  // Store Management Methods
  // ============================================

  /**
   * Cambia el restaurante de una orden
   */
  changeStore(data: ChangeStoreRequest): Observable<any> {
    return this.dataService.post$(
      `OrderTracking/changeStore?storeId=${data.newStoreId}&orderId=${data.orderId}`,
      { comment: data.comments }
    );
  }

  // ============================================
  // Cancellation Requests Methods
  // ============================================

  /**
   * Obtiene las razones de cancelación del catálogo
   */
  getReasonsCancels(): Observable<any[]> {
    return this.dataService.get$('OrderTracking/cancel/reasons');
  }

  /**
   * Aprueba una solicitud de cancelación
   */
  approveRequest(data: any): Observable<any> {
    return this.dataService.post$('CancelRequest/ApproveRequest', data);
  }

  /**
   * Rechaza una solicitud de cancelación
   */
  denyRequest(data: any): Observable<any> {
    return this.dataService.post$('CancelRequest/DenyRequest', data);
  }

  // ============================================
  // Incidents/Ocurrences Methods
  // ============================================

  /**
   * Elimina una ocurrencia/incidencia
   */
  deleteOcurrency(id: number): Observable<any> {
    return this.dataService.delete$(`OrderTracking/DeleteOcurrency/${id}`);
  }
}
