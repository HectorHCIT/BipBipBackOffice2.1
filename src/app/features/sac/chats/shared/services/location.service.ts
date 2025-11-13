import { Injectable, inject, signal, computed } from '@angular/core';
import { Country, City, FormattedLocation } from '../models';
import { firstValueFrom } from 'rxjs';
import { DataService } from '@core/services/data.service';

/**
 * Servicio para manejar datos de ubicación (países y ciudades)
 *
 * Carga las listas al iniciar y las mantiene en memoria para mapeos rápidos.
 * Proporciona métodos para formatear ubicaciones en el formato: "HN/SPS"
 */
@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly dataService = inject(DataService);

  // Signals para almacenar las listas
  readonly countries = signal<Country[]>([]);
  readonly cities = signal<City[]>([]);

  // Computed signal para indicar si ya se cargaron los datos
  readonly isLoaded = computed(() =>
    this.countries().length > 0 && this.cities().length > 0
  );

  // Maps para búsquedas rápidas por ID
  private readonly countryMap = computed(() => {
    const map = new Map<number, Country>();
    this.countries().forEach(country => map.set(country.countryId, country));
    return map;
  });

  private readonly cityMap = computed(() => {
    const map = new Map<number, City>();
    this.cities().forEach(city => map.set(city.cityId, city));
    return map;
  });

  /**
   * Carga las listas de países y ciudades desde la API
   * Debe llamarse al iniciar el módulo
   */
  async loadLocations(): Promise<void> {
    try {
      console.log('[LocationService] Cargando países y ciudades...');

      const [countriesData, citiesData] = await Promise.all([
        firstValueFrom(this.dataService.get$<Country[]>('Location/CountryList')),
        firstValueFrom(this.dataService.get$<City[]>('Location/CityList'))
      ]);

      this.countries.set(countriesData);
      this.cities.set(citiesData);

      console.log('[LocationService] Datos cargados:', {
        countries: countriesData.length,
        cities: citiesData.length
      });
    } catch (error) {
      console.error('[LocationService] Error al cargar ubicaciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene la ubicación formateada desde cityId y countryId
   * Formato: "HN/SPS"
   *
   * @param cityId ID de la ciudad
   * @param countryId ID del país
   * @returns Ubicación formateada o null si no se encuentra
   */
  getFormattedLocation(cityId: number, countryId: number): FormattedLocation | null {
    const country = this.countryMap().get(countryId);
    const city = this.cityMap().get(cityId);

    if (!country || !city) {
      console.warn('[LocationService] No se encontró ubicación:', { cityId, countryId });
      return null;
    }

    return {
      countryCode: country.countryCode,
      cityCode: city.cityCode,
      displayText: `${country.countryCode}/${city.cityCode}`
    };
  }

  /**
   * Obtiene el código de país por su ID
   */
  getCountryCode(countryId: number): string | null {
    return this.countryMap().get(countryId)?.countryCode || null;
  }

  /**
   * Obtiene el código de ciudad por su ID
   */
  getCityCode(cityId: number): string | null {
    return this.cityMap().get(cityId)?.cityCode || null;
  }

  /**
   * Obtiene un país por su ID
   */
  getCountry(countryId: number): Country | null {
    return this.countryMap().get(countryId) || null;
  }

  /**
   * Obtiene una ciudad por su ID
   */
  getCity(cityId: number): City | null {
    return this.cityMap().get(cityId) || null;
  }
}
