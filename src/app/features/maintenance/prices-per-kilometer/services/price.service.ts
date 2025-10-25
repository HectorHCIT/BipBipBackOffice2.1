import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import type { PriceList, CityList, StandardPaymentRequest, SpecialPaymentRequest } from '../models/price.model';

/**
 * PriceService - Servicio para gestión de precios por kilómetro
 *
 * Features:
 * ✅ Signals para estado reactivo
 * ✅ NO transformaciones - uso directo del modelo API
 * ✅ Integración con DataService
 */
@Injectable({
  providedIn: 'root'
})
export class PriceService {
  private readonly dataService = inject(DataService);

  // State Signals
  readonly prices = signal<PriceList[]>([]);
  readonly cities = signal<CityList[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Obtiene el resumen de escalas de precios por ciudad/zona
   */
  getPrices(): Observable<PriceList[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.dataService.get$<PriceList[]>('Restaurant/scales/summary').pipe(
      tap((response: PriceList[]) => {
        // Agregar propiedad isOpen para el accordion
        const pricesWithAccordion = response.map(price => ({
          ...price,
          isOpen: false
        }));
        this.prices.set(pricesWithAccordion);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Obtiene la lista de ciudades disponibles
   */
  getCities(): Observable<CityList[]> {
    return this.dataService.get$<CityList[]>('Location/CityList').pipe(
      tap((response: CityList[]) => {
        this.cities.set(response);
      })
    );
  }

  /**
   * Crea/actualiza pago estándar o diferenciado
   * Endpoint: Restaurant/scales/summary/standard
   */
  createStandardPayment(request: StandardPaymentRequest): Observable<any> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.dataService.post$('Restaurant/scales/summary/standard', request).pipe(
      tap(() => {
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Crea/actualiza pago extraordinario (especial)
   * Endpoint: Restaurant/scales/summary/special
   */
  createSpecialPayment(request: SpecialPaymentRequest): Observable<any> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.dataService.post$('Restaurant/scales/summary/special', request).pipe(
      tap(() => {
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Toggle del estado del accordion para un PriceList específico
   */
  toggleAccordion(index: number): void {
    const currentPrices = this.prices();
    const updatedPrices = currentPrices.map((price, i) => {
      if (i === index) {
        return { ...price, isOpen: !price.isOpen };
      }
      return price;
    });
    this.prices.set(updatedPrices);
  }
}
