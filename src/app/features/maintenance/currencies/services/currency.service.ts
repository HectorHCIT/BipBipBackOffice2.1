import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { DataService } from '@core/services/data.service';
import { GlobalDataService } from '@core/services/global-data.service';
import type {
  Currency,
  CurrencyResponse,
  CurrenciesResponse,
  CurrencyCreateRequest,
  CurrencyUpdateRequest,
  CurrencyMetadata,
  Country
} from '../models/currency.model';
import { currencyResponseToCurrency } from '../models/currency.model';

/**
 * CurrencyService - Servicio para gestión de monedas
 *
 * Features:
 * ✅ Signals para estado reactivo
 * ✅ Server-side pagination
 * ✅ Filtros por estado y búsqueda
 * ✅ CRUD operations
 * ✅ Caché global con GlobalDataService
 */
@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly dataService = inject(DataService);
  private readonly globalDataService = inject(GlobalDataService);

  // Signals
  readonly currencies = signal<Currency[]>([]);
  readonly metadata = signal<CurrencyMetadata>({
    totalActive: 0,
    totalInactive: 0,
    page: 1,
    perPage: 10,
    pageCount: 0,
    totalCount: 0
  });
  readonly isLoading = signal<boolean>(false);
  readonly selectedCurrency = signal<Currency | null>(null);

  /**
   * Obtiene la lista de monedas con paginación y filtros
   * @param page Número de página
   * @param pageSize Tamaño de página
   * @param status Estado: 'true' = activos, 'false' = inactivos, '' = todos
   * @param filters Búsqueda por texto
   */
  getCurrencies(
    page: number = 1,
    pageSize: number = 10,
    status: string = '',
    filters: string = ''
  ): Observable<Currency[]> {
    this.isLoading.set(true);

    let url = `Location/currencies?pageNumber=${page}&pageSize=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }
    if (filters) {
      url += `&filters=${filters}`;
    }

    return this.dataService.get$<CurrenciesResponse>(url).pipe(
      tap((response: CurrenciesResponse) => {
        // Actualizar metadata
        this.metadata.set(response.metadata);

        // Convertir y actualizar currencies
        const currencies = response.data.map(currencyResponseToCurrency);
        this.currencies.set(currencies);

        this.isLoading.set(false);
      }),
      map((response: CurrenciesResponse) => response.data.map(currencyResponseToCurrency))
    );
  }

  /**
   * Obtiene la lista de países disponibles
   */
  getCountries(): Observable<Country[]> {
    // Primero intentar obtener del cache global
    const cachedCountries = this.globalDataService.countries();
    if (cachedCountries && cachedCountries.length > 0) {
      // Mapear del modelo global al modelo de Currency
      const mappedCountries: Country[] = cachedCountries.map(c => ({
        countryId: c.id,
        countryName: c.name,
        countryCode: c.code,
        isActive: c.isActive,
        countryPrefix: c.prefix,
        countryUrlFlag: c.urlFlag,
        countryMask: c.mask
      }));

      return new Observable(observer => {
        observer.next(mappedCountries);
        observer.complete();
      });
    }

    // Si no hay cache, obtener del API
    return this.dataService.get$<Country[]>('Location/CountryList').pipe(
      tap((countries: Country[]) => {
        // Convertir al modelo global y guardar en cache
        const globalCountries = countries.map((c: Country) => ({
          id: c.countryId,
          name: c.countryName,
          code: c.countryCode,
          isActive: c.isActive,
          prefix: c.countryPrefix,
          urlFlag: c.countryUrlFlag,
          mask: c.countryMask
        }));
        this.globalDataService.countries.set(globalCountries);
      })
    );
  }

  /**
   * Crea una nueva moneda
   * @param currency Datos de la moneda a crear
   */
  createCurrency(currency: CurrencyCreateRequest): Observable<Currency> {
    return this.dataService.post$<CurrencyResponse>('Location/currencies', currency).pipe(
      map(currencyResponseToCurrency),
      tap((newCurrency: Currency) => {
        // Agregar a la lista local
        const currentCurrencies = this.currencies();
        this.currencies.set([...currentCurrencies, newCurrency]);
      })
    );
  }

  /**
   * Actualiza una moneda existente
   * @param id ID de la moneda
   * @param currency Datos actualizados
   */
  updateCurrency(id: number, currency: CurrencyUpdateRequest): Observable<Currency> {
    return this.dataService.put$<CurrencyResponse>(`Location/currencies/${id}`, currency).pipe(
      map(currencyResponseToCurrency),
      tap((updatedCurrency: Currency) => {
        // Actualizar en la lista local
        const currentCurrencies = this.currencies();
        const index = currentCurrencies.findIndex(c => c.id === id);
        if (index !== -1) {
          const newCurrencies = [...currentCurrencies];
          newCurrencies[index] = updatedCurrency;
          this.currencies.set(newCurrencies);
        }
      })
    );
  }

  /**
   * Cambia el estado de una moneda (activo/inactivo)
   * @param id ID de la moneda
   * @param newStatus Nuevo estado
   */
  toggleStatus(id: number, newStatus: boolean): Observable<Currency> {
    const updateData: CurrencyUpdateRequest = {
      id: null,
      name: null,
      flag: null,
      title: null,
      code: null,
      symbolLeft: null,
      status: newStatus,
      countryId: null
    };

    return this.updateCurrency(id, updateData);
  }

  /**
   * Selecciona una moneda
   * @param currency Moneda a seleccionar
   */
  selectCurrency(currency: Currency | null): void {
    this.selectedCurrency.set(currency);
  }
}
