import { Injectable } from '@angular/core';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment';

/**
 * MapLoaderService
 *
 * Responsabilidad única: Cargar Google Maps API de forma lazy y singleton
 *
 * Previene múltiples cargas de la API y asegura que solo se cargue
 * cuando realmente se necesite (lazy loading)
 */
@Injectable({
  providedIn: 'root'
})
export class MapLoaderService {
  private loadPromise: Promise<google.maps.MapsLibrary> | null = null;
  private optionsSet = false;

  /**
   * Load Google Maps API
   * Returns cached promise if already loading/loaded
   */
  async load(): Promise<typeof google.maps> {
    // Si ya está cargado, retornar directamente
    if (this.isLoaded()) {
      return google.maps;
    }

    // Configurar opciones solo una vez
    if (!this.optionsSet) {
      setOptions({
        key: environment.googleMapsApiKey,
        v: 'weekly',
        libraries: ['places', 'geometry', 'marker']
      });
      this.optionsSet = true;
    }

    // Si ya hay una carga en progreso, esperar a que termine
    if (this.loadPromise) {
      await this.loadPromise;
      return google.maps;
    }

    // Iniciar nueva carga usando importLibrary
    this.loadPromise = importLibrary('maps');
    await this.loadPromise;

    return google.maps;
  }

  /**
   * Check if Google Maps is already loaded
   */
  isLoaded(): boolean {
    return typeof google !== 'undefined' && typeof google.maps !== 'undefined';
  }
}
