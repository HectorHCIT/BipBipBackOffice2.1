import { Injectable, inject, signal } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataService } from './data.service';
import {
  Channel,
  ChannelResponse,
  Brand,
  BrandResponse,
  City,
  CityResponse,
  CityShort,
  CityShortResponse,
  Country,
  CountryResponse,
  PaymentMethod,
  PaymentMethodResponse
} from '../models/global-data.model';

/**
 * GlobalDataService - Modernizado con Signals (Angular 20)
 *
 * Maneja data global que se usa en toda la aplicación:
 * - ✅ Channels (Canales)
 * - ✅ Brands (Marcas)
 * - ✅ Cities (Ciudades completas)
 * - ✅ Cities Short (Ciudades simplificadas)
 * - ✅ Countries (Países)
 * - ✅ Payment Methods (Métodos de pago)
 *
 * Features:
 * - Signals para estado reactivo
 * - NO usa localStorage (carga fresh data cada vez)
 * - Método loadAll() para cargar todo después del login
 * - Método forceRefresh() para refrescar un catálogo específico
 *
 * Usage:
 * // Inyectar el servicio
 * private globalData = inject(GlobalDataService);
 *
 * // Acceder a la data
 * const brands = this.globalData.brands();
 * const channels = this.globalData.channels();
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {
  private readonly dataService = inject(DataService);

  // ============================================================================
  // SIGNALS - Estado Reactivo
  // ============================================================================

  readonly channels = signal<Channel[]>([]);
  readonly brands = signal<Brand[]>([]);
  readonly cities = signal<City[]>([]);
  readonly citiesShort = signal<CityShort[]>([]);
  readonly countries = signal<Country[]>([]);
  readonly paymentMethods = signal<PaymentMethod[]>([]);

  // Loading states
  readonly isLoadingChannels = signal<boolean>(false);
  readonly isLoadingBrands = signal<boolean>(false);
  readonly isLoadingCities = signal<boolean>(false);
  readonly isLoadingCitiesShort = signal<boolean>(false);
  readonly isLoadingCountries = signal<boolean>(false);
  readonly isLoadingPaymentMethods = signal<boolean>(false);

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Cargar todos los catálogos
   * Llamar después del login exitoso
   */
  loadAll(): void {
    this.loadChannels();
    this.loadBrands();
    this.loadCities();
    this.loadCitiesShort();
    this.loadCountries();
    this.loadPaymentMethods();
  }

  /**
   * Refrescar un catálogo específico
   */
  forceRefresh(catalog: 'channels' | 'brands' | 'cities' | 'citiesShort' | 'countries' | 'paymentMethods'): void {
    switch (catalog) {
      case 'channels':
        this.loadChannels();
        break;
      case 'brands':
        this.loadBrands();
        break;
      case 'cities':
        this.loadCities();
        break;
      case 'citiesShort':
        this.loadCitiesShort();
        break;
      case 'countries':
        this.loadCountries();
        break;
      case 'paymentMethods':
        this.loadPaymentMethods();
        break;
    }
  }

  /**
   * Limpiar todos los datos (útil para logout)
   */
  clearAll(): void {
    this.channels.set([]);
    this.brands.set([]);
    this.cities.set([]);
    this.citiesShort.set([]);
    this.countries.set([]);
    this.paymentMethods.set([]);
  }

  // ============================================================================
  // PRIVATE LOADERS
  // ============================================================================

  private loadChannels(): void {
    this.isLoadingChannels.set(true);

    this.dataService.get$<ChannelResponse[]>('Channel/ChannelSimpleList')
      .pipe(
        map(response => response.map(item => ({
          id: item.idChannel,
          description: item.descriptionChannel,
          isActive: item.isActiveChannel,
          iconUrl: item.iconUrlChannel
        })))
      )
      .subscribe({
        next: (channels) => {
          this.channels.set(channels);
          this.isLoadingChannels.set(false);
        },
        error: (error) => {
          console.error('Error loading channels:', error);
          this.isLoadingChannels.set(false);
        }
      });
  }

  private loadBrands(): void {
    this.isLoadingBrands.set(true);

    this.dataService.get$<BrandResponse[]>('Brand/BrandsListSorted')
      .pipe(
        map(response => response.map(item => ({
          id: item.idBrand,
          name: item.nameBrand,
          logo: item.logoBrand,
          sortOrder: item.sortOrderBrand
        })))
      )
      .subscribe({
        next: (brands) => {
          this.brands.set(brands);
          this.isLoadingBrands.set(false);
        },
        error: (error) => {
          console.error('Error loading brands:', error);
          this.isLoadingBrands.set(false);
        }
      });
  }

  private loadCities(): void {
    this.isLoadingCities.set(true);

    this.dataService.get$<CityResponse[]>('Location/CityList')
      .pipe(
        map(response => response.map(item => ({
          id: item.cityId,
          countryCode: item.codCountry,
          countryUrlFlag: item.countryUrlFlag,
          countryName: item.countryName,
          name: item.cityName,
          code: item.cityCode,
          isActive: item.isActive,
          couponMin: item.couponMin,
          publish: item.publish,
          zoneCode: item.codZone,
          zoneName: item.zoneName,
          orderMin: item.orderMin,
          freeShipping: item.freeShipping,
          facPayment: item.faCpayment
        })))
      )
      .subscribe({
        next: (cities) => {
          this.cities.set(cities);
          this.isLoadingCities.set(false);
        },
        error: (error) => {
          console.error('Error loading cities:', error);
          this.isLoadingCities.set(false);
        }
      });
  }

  private loadCitiesShort(): void {
    this.isLoadingCitiesShort.set(true);

    this.dataService.get$<CityShortResponse[]>('Location/Cities')
      .pipe(
        map(response => response.map(item => ({
          id: item.cityId,
          name: item.cityName
        })))
      )
      .subscribe({
        next: (cities) => {
          this.citiesShort.set(cities);
          this.isLoadingCitiesShort.set(false);
        },
        error: (error) => {
          console.error('Error loading cities short:', error);
          this.isLoadingCitiesShort.set(false);
        }
      });
  }

  private loadCountries(): void {
    this.isLoadingCountries.set(true);

    this.dataService.get$<CountryResponse[]>('Location/CountryList')
      .pipe(
        map(response => response.map(item => ({
          id: item.countryId,
          name: item.countryName,
          code: item.countryCode,
          isActive: item.isActive,
          prefix: item.countryPrefix,
          urlFlag: item.countryUrlFlag,
          mask: item.countryMask
        })))
      )
      .subscribe({
        next: (countries) => {
          this.countries.set(countries);
          this.isLoadingCountries.set(false);
        },
        error: (error) => {
          console.error('Error loading countries:', error);
          this.isLoadingCountries.set(false);
        }
      });
  }

  private loadPaymentMethods(): void {
    this.isLoadingPaymentMethods.set(true);

    this.dataService.get$<PaymentMethodResponse[]>('Customer/PaymentMethods')
      .subscribe({
        next: (methods) => {
          this.paymentMethods.set(methods);
          this.isLoadingPaymentMethods.set(false);
        },
        error: (error) => {
          console.error('Error loading payment methods:', error);
          this.isLoadingPaymentMethods.set(false);
        }
      });
  }
}
