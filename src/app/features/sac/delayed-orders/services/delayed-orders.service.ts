import { Injectable, inject, signal } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DataService } from '@core/services/data.service';
import { DelayedOrdersResponse, Driver, AssignDriverPayload } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DelayedOrdersService {
  private readonly dataService = inject(DataService);

  // State signals
  readonly delayedOrders = signal<DelayedOrdersResponse>({
    metadata: { page: 1, perPage: 5, pageCount: 0, totalCount: 0 },
    records: []
  });
  readonly isLoading = signal(false);
  readonly availableDrivers = signal<Driver[]>([]);

  /**
   * Obtiene la lista de órdenes con demora paginada
   */
  getDelayedOrders(page: number = 1, pageSize: number = 5): Observable<DelayedOrdersResponse> {
    this.isLoading.set(true);

    return this.dataService.get$<DelayedOrdersResponse>('DelayedOrders/DelayedOrdersList', {
      pageNumber: page,
      pageSize: pageSize
    }).pipe(
      tap({
        next: (response) => {
          this.delayedOrders.set(response);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * Busca órdenes por parámetro (número de orden)
   */
  searchDelayedOrders(searchTerm: string, page: number = 1, pageSize: number = 5): Observable<DelayedOrdersResponse> {
    this.isLoading.set(true);

    return this.dataService.get$<DelayedOrdersResponse>('DelayedOrders/DelayedOrdersByParam', {
      Parameter: searchTerm,
      pageNumb: page,
      pageSize: pageSize
    }).pipe(
      tap({
        next: (response) => {
          this.delayedOrders.set(response);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * Filtra órdenes por países, ciudades y rango de fechas
   */
  filterDelayedOrders(
    countries: number[],
    cities: number[],
    startDate: string,
    endDate: string,
    page: number = 1,
    pageSize: number = 5
  ): Observable<DelayedOrdersResponse> {
    this.isLoading.set(true);

    // Construir parámetros solo con valores presentes
    const params: any = {
      StartDate: startDate,
      EndDate: endDate,
      pageNumb: page,
      pageSize: pageSize
    };

    // Solo agregar CountryIds si hay países seleccionados
    if (countries.length > 0) {
      params.CountryIds = countries.join(',');
    }

    // Solo agregar CityIds si hay ciudades seleccionadas
    if (cities.length > 0) {
      params.CityIds = cities.join(',');
    }

    return this.dataService.get$<DelayedOrdersResponse>('DelayedOrders/DelayedOrdersByFilters', params).pipe(
      tap({
        next: (response) => {
          this.delayedOrders.set(response);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * Obtiene la lista de drivers disponibles
   */
  getAvailableDrivers(): Observable<Driver[]> {
    return this.dataService.get$<Driver[]>('DelayedOrders/ApplicableDrivers', {
      pageNumber: 1,
      pageSize: 10
    }).pipe(
      tap({
        next: (drivers) => {
          this.availableDrivers.set(drivers);
        }
      })
    );
  }

  /**
   * Asigna un driver a una orden
   */
  assignDriverToOrder(payload: AssignDriverPayload): Observable<any> {
    return this.dataService.post$('DelayedOrders/AssignDriver', payload);
  }
}
