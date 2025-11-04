import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import { type ApiCity, type ApiCountry } from '../models';

/**
 * Location data for dropdowns
 */
export interface Country {
  countryId: number;
  countryName: string;
  countryCode: string;
  countryFlag: string;
  countryPrefix: string;
  countryMask: string;
  isActive: boolean;
}

export interface City {
  cityId: number;
  cityName: string;
  cityCode: string;
  countryId: number;
  countryName: string;
  countryFlag: string;
  isActive: boolean;
}

/**
 * LocationService
 *
 * Service for managing countries and cities data
 * Used by credential filters and forms
 */
@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly dataService = inject(DataService);

  // State signals
  readonly countries = signal<Country[]>([]);
  readonly cities = signal<City[]>([]);
  readonly isLoadingCountries = signal(false);
  readonly isLoadingCities = signal(false);

  /**
   * Get all countries
   */
  getCountries(): Observable<Country[]> {
    // Return cached data if available
    if (this.countries().length > 0) {
      return new Observable(observer => {
        observer.next(this.countries());
        observer.complete();
      });
    }

    this.isLoadingCountries.set(true);

    return this.dataService.get$<ApiCountry[]>('Location/CountryList').pipe(
      map(apiCountries => this.mapApiCountriesToModel(apiCountries)),
      tap(countries => {
        this.countries.set(countries);
        this.isLoadingCountries.set(false);
      })
    );
  }

  /**
   * Get all cities
   */
  getCities(): Observable<City[]> {
    // Return cached data if available
    if (this.cities().length > 0) {
      return new Observable(observer => {
        observer.next(this.cities());
        observer.complete();
      });
    }

    this.isLoadingCities.set(true);

    return this.dataService.get$<ApiCity[]>('Location/CityList').pipe(
      map(apiCities => this.mapApiCitiesToModel(apiCities)),
      tap(cities => {
        this.cities.set(cities);
        this.isLoadingCities.set(false);
      })
    );
  }

  /**
   * Get cities by country ID
   */
  getCitiesByCountry(countryId: number): Observable<City[]> {
    return this.getCities().pipe(
      map(cities => cities.filter(city => city.countryId === countryId))
    );
  }

  /**
   * Get country by ID
   */
  getCountryById(countryId: number): Country | undefined {
    return this.countries().find(c => c.countryId === countryId);
  }

  /**
   * Get city by ID
   */
  getCityById(cityId: number): City | undefined {
    return this.cities().find(c => c.cityId === cityId);
  }

  /**
   * Map API countries to internal model
   */
  private mapApiCountriesToModel(apiCountries: ApiCountry[]): Country[] {
    return apiCountries
      .filter(c => c.isActive)
      .map(apiCountry => ({
        countryId: apiCountry.countryId,
        countryName: apiCountry.countryName,
        countryCode: apiCountry.countryCode,
        countryFlag: apiCountry.countryUrlFlag,
        countryPrefix: apiCountry.countryPrefix,
        countryMask: apiCountry.countryMask,
        isActive: apiCountry.isActive
      }));
  }

  /**
   * Map API cities to internal model
   */
  private mapApiCitiesToModel(apiCities: ApiCity[]): City[] {
    return apiCities
      .filter(c => c.isActive)
      .map(apiCity => ({
        cityId: apiCity.cityId,
        cityName: apiCity.cityName,
        cityCode: apiCity.cityCode,
        countryId: apiCity.codCountry,
        countryName: apiCity.countryName,
        countryFlag: apiCity.countryUrlFlag,
        isActive: apiCity.isActive
      }));
  }

  /**
   * Clear cache (force reload on next request)
   */
  clearCache(): void {
    this.countries.set([]);
    this.cities.set([]);
  }
}
