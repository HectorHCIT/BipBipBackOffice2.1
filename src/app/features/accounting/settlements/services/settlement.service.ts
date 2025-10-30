import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DataService } from '@core/services/data.service';
import {
  Order,
  BrandsList,
  HQList,
  CityList,
  SettlementRequest,
  SettlementResponse,
} from '../models/settlement.model';

/**
 * Servicio para gestionar liquidaciones
 */
@Injectable({
  providedIn: 'root',
})
export class SettlementService {
  private readonly dataService = inject(DataService);

  // Signals para estado global
  readonly isLoading = signal<boolean>(false);
  readonly brands = signal<BrandsList[]>([]);
  readonly cities = signal<CityList[]>([]);

  /**
   * Obtener orden por número
   */
  getOrder(orderNumber: string): Observable<Order> {
    this.isLoading.set(true);
    return this.dataService
      .get$<Order>(`OrderTracking/OrdersTrackingById?idOrders=${orderNumber}`)
      .pipe(tap(() => this.isLoading.set(false)));
  }

  /**
   * Obtener lista de marcas ordenadas
   */
  getBrands(): Observable<BrandsList[]> {
    return this.dataService.get$<BrandsList[]>('Brand/BrandsListSorted').pipe(
      tap((brands) => this.brands.set(brands))
    );
  }

  /**
   * Obtener lista de sedes/unidades por marca
   */
  getHQList(brandId: number): Observable<HQList[]> {
    return this.dataService.get$<HQList[]>(
      `Restaurant/shortNames?brandId=${brandId}`
    );
  }

  /**
   * Obtener lista de ciudades
   */
  getCityList(): Observable<CityList[]> {
    return this.dataService.get$<CityList[]>('Location/CityList').pipe(
      tap((cities) => this.cities.set(cities))
    );
  }

  /**
   * Crear liquidación
   * TODO: Validar endpoint con backend cuando esté disponible
   */
  submitSettlement(data: SettlementRequest): Observable<SettlementResponse> {
    // Endpoint temporal - debe confirmarse con backend
    return this.dataService.post$<SettlementResponse>(
      'Settlement/CreateSettlement',
      data
    );
  }
}
