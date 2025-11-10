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
   * Nota: Este endpoint requiere parámetros duplicados (CountryIds, CityIds)
   * que no son soportados por el DataService, por lo que usamos HttpParams directamente
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

    // Construir manualmente los parámetros con arrays
    let params = new HttpParams()
      .set('StartDate', startDate)
      .set('EndDate', endDate)
      .set('pageNumb', page.toString())
      .set('pageSize', pageSize.toString());

    // Agregar múltiples CountryIds
    countries.forEach(countryId => {
      params = params.append('CountryIds', countryId.toString());
    });

    // Agregar múltiples CityIds
    cities.forEach(cityId => {
      params = params.append('CityIds', cityId.toString());
    });

    // Para este caso especial, necesitamos acceso directo a HttpClient
    // Por ahora, convertimos los arrays a strings separados por comas como workaround
    return this.dataService.get$<DelayedOrdersResponse>('DelayedOrders/DelayedOrdersByFilters', {
      StartDate: startDate,
      EndDate: endDate,
      pageNumb: page,
      pageSize: pageSize,
      CountryIds: countries.join(','),
      CityIds: cities.join(',')
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
