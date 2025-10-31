import {
  Component,
  ElementRef,
  input,
  output,
  effect,
  signal,
  inject,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapLoaderService } from '@core/services/map-loader.service';

/**
 * Interface for zone data
 */
export interface ZoneEditorData {
  lat: number;
  lon: number;
  radius: number; // in meters
}

/**
 * GoogleMapsEditorComponent
 *
 * Responsabilidad única: Editor interactivo de una zona individual con Google Maps
 *
 * - Renderiza círculo arrastrable
 * - 4 marcadores de resize en puntos cardinales (N, S, E, W)
 * - Two-way binding: mapa ↔ inputs
 * - Emite cambios en tiempo real
 * - NO hace llamadas HTTP
 * - NO maneja formulario (solo el mapa)
 */
@Component({
  selector: 'app-google-maps-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="google-maps-container">
      <div #mapContainer class="map"></div>

      @if (isLoading()) {
        <div class="map-loading">
          <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
          <p class="mt-2">Cargando mapa...</p>
        </div>
      }

      @if (errorMessage()) {
        <div class="map-error">
          <i class="pi pi-exclamation-triangle text-4xl text-red-500"></i>
          <p class="mt-2 text-red-600">{{ errorMessage() }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .google-maps-container {
      position: relative;
      width: 100%;
      height: 400px;
    }

    .map {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }

    .map-loading,
    .map-error {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      z-index: 10;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoogleMapsEditorComponent implements AfterViewInit, OnDestroy {
  private readonly mapLoaderService = inject(MapLoaderService);
  private readonly elementRef = inject(ElementRef);

  // Inputs
  readonly restaurantCoords = input.required<{ lat: number; lon: number }>();
  readonly zoneData = input<ZoneEditorData | null>(null);
  readonly minRadius = input<number>(100); // meters
  readonly maxRadius = input<number>(50000); // meters

  // Outputs
  readonly onZoneChange = output<ZoneEditorData>();

  // State
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  // Google Maps instances
  private map: google.maps.Map | null = null;
  private circle: google.maps.Circle | null = null;
  private resizeMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  private restaurantMarker: google.maps.marker.AdvancedMarkerElement | null = null;

  // Prevent circular updates
  private isUpdatingFromInput = false;
  private isUpdatingFromMap = false;

  constructor() {
    // Effect: React to zone data changes from parent (form)
    effect(() => {
      const data = this.zoneData();
      if (data && this.map && !this.isUpdatingFromMap) {
        this.isUpdatingFromInput = true;
        this.updateMapFromData(data);
        this.isUpdatingFromInput = false;
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initializeMap();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Initialize Google Maps
   */
  private async initializeMap(): Promise<void> {
    try {
      await this.mapLoaderService.load();
      const container = this.elementRef.nativeElement.querySelector('.map');

      if (!container) {
        throw new Error('Map container not found');
      }

      const center = this.restaurantCoords();

      // Create map (using global google namespace)
      this.map = new google.maps.Map(container, {
        zoom: 14,
        center: { lat: center.lat, lng: center.lon },
        mapId: '9936d00c78382090', // Required for AdvancedMarkerElement
        draggable: true,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
      });

      // Add restaurant marker
      this.addRestaurantMarker(center);

      // If zone data exists, render it
      const data = this.zoneData();
      if (data) {
        this.createEditableZone(data);
      } else {
        // Add click listener to create zone
        if (this.map) {
          this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng && !this.circle) {
              const newZone: ZoneEditorData = {
                lat: event.latLng.lat(),
                lon: event.latLng.lng(),
                radius: 500 // Default 500m
              };
              this.createEditableZone(newZone);
              this.emitZoneChange(newZone);
            }
          });
        }
      }

      this.isLoading.set(false);
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      this.errorMessage.set('Error al cargar Google Maps. Verifica la API key.');
      this.isLoading.set(false);
    }
  }

  /**
   * Add restaurant marker to map
   */
  private addRestaurantMarker(coords: { lat: number; lon: number }): void {
    if (!this.map) return;

    const markerElement = document.createElement('div');
    markerElement.style.width = '40px';
    markerElement.style.height = '40px';
    markerElement.style.borderRadius = '50%';
    markerElement.style.backgroundColor = '#fb0021';
    markerElement.style.border = '3px solid white';
    markerElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    markerElement.style.display = 'flex';
    markerElement.style.alignItems = 'center';
    markerElement.style.justifyContent = 'center';
    markerElement.style.color = 'white';
    markerElement.style.fontWeight = 'bold';
    markerElement.innerHTML = 'R';

    this.restaurantMarker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: coords.lat, lng: coords.lon },
      map: this.map,
      content: markerElement,
      title: 'Restaurante'
    });
  }

  /**
   * Create editable zone with circle and resize handles
   */
  private createEditableZone(data: ZoneEditorData): void {
    if (!this.map) return;

    // Remove existing zone if any
    this.clearZone();

    // Create circle
    this.circle = new google.maps.Circle({
      strokeColor: '#fb0021',
      strokeOpacity: 0.5,
      strokeWeight: 2,
      fillColor: '#fb0021',
      fillOpacity: 0.15,
      map: this.map,
      center: { lat: data.lat, lng: data.lon },
      radius: data.radius,
      draggable: true,
      editable: false
    });

    // Center map on zone
    this.map.panTo({ lat: data.lat, lng: data.lon });

    // Add drag listener to circle
    this.circle.addListener('center_changed', () => {
      if (!this.isUpdatingFromInput && this.circle) {
        const center = this.circle.getCenter();
        if (center) {
          this.isUpdatingFromMap = true;
          this.updateResizeMarkersPositions();
          this.emitZoneChange({
            lat: center.lat(),
            lon: center.lng(),
            radius: this.circle.getRadius()
          });
          this.isUpdatingFromMap = false;
        }
      }
    });

    // Create resize markers
    this.createResizeMarkers();
  }

  /**
   * Create 4 resize markers at cardinal directions
   */
  private createResizeMarkers(): void {
    if (!this.circle || !this.map) return;

    const directions = [
      { bearing: 0, label: 'N' },    // North
      { bearing: 90, label: 'E' },   // East
      { bearing: 180, label: 'S' },  // South
      { bearing: 270, label: 'W' }   // West
    ];

    directions.forEach((dir) => {
      const position = this.calculateMarkerPosition(
        this.circle!.getCenter()!,
        this.circle!.getRadius(),
        dir.bearing
      );

      const markerElement = document.createElement('div');
      markerElement.style.width = '20px';
      markerElement.style.height = '20px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = '#ffffff';
      markerElement.style.border = '2px solid #fb0021';
      markerElement.style.cursor = 'grab';
      markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        map: this.map,
        content: markerElement,
        title: `Resize ${dir.label}`,
        gmpDraggable: true
      });

      // Add drag listener
      marker.addListener('drag', (event: google.maps.MapMouseEvent) => {
        if (event.latLng && this.circle) {
          this.handleResizeDrag(event.latLng);
        }
      });

      this.resizeMarkers.push(marker);
    });
  }

  /**
   * Calculate position for resize marker based on bearing
   */
  private calculateMarkerPosition(
    center: google.maps.LatLng,
    radius: number,
    bearing: number
  ): google.maps.LatLngLiteral {
    const earthRadius = 6371000; // meters
    const radLat = (center.lat() * Math.PI) / 180;
    const radLng = (center.lng() * Math.PI) / 180;
    const radBearing = (bearing * Math.PI) / 180;

    const newLatRad = Math.asin(
      Math.sin(radLat) * Math.cos(radius / earthRadius) +
        Math.cos(radLat) * Math.sin(radius / earthRadius) * Math.cos(radBearing)
    );

    const newLngRad =
      radLng +
      Math.atan2(
        Math.sin(radBearing) * Math.sin(radius / earthRadius) * Math.cos(radLat),
        Math.cos(radius / earthRadius) - Math.sin(radLat) * Math.sin(newLatRad)
      );

    return {
      lat: (newLatRad * 180) / Math.PI,
      lng: (newLngRad * 180) / Math.PI
    };
  }

  /**
   * Handle resize marker drag
   */
  private handleResizeDrag(newPosition: google.maps.LatLng): void {
    if (!this.circle || this.isUpdatingFromInput) return;

    const center = this.circle.getCenter();
    if (!center) return;

    // Calculate new radius
    const newRadius = google.maps.geometry.spherical.computeDistanceBetween(
      center,
      newPosition
    );

    // Validate radius
    const min = this.minRadius();
    const max = this.maxRadius();

    if (newRadius >= min && newRadius <= max) {
      this.isUpdatingFromMap = true;
      this.circle.setRadius(newRadius);
      this.updateResizeMarkersPositions();

      this.emitZoneChange({
        lat: center.lat(),
        lon: center.lng(),
        radius: newRadius
      });
      this.isUpdatingFromMap = false;
    }
  }

  /**
   * Update resize markers positions
   */
  private updateResizeMarkersPositions(): void {
    if (!this.circle) return;

    const center = this.circle.getCenter();
    const radius = this.circle.getRadius();
    if (!center) return;

    const bearings = [0, 90, 180, 270];

    this.resizeMarkers.forEach((marker, index) => {
      const newPosition = this.calculateMarkerPosition(center, radius, bearings[index]);
      marker.position = newPosition;
    });
  }

  /**
   * Update map from input data (form changes)
   */
  private updateMapFromData(data: ZoneEditorData): void {
    if (!this.circle) {
      this.createEditableZone(data);
      return;
    }

    this.circle.setCenter({ lat: data.lat, lng: data.lon });
    this.circle.setRadius(data.radius);
    this.updateResizeMarkersPositions();
  }

  /**
   * Emit zone change event
   */
  private emitZoneChange(data: ZoneEditorData): void {
    this.onZoneChange.emit(data);
  }

  /**
   * Clear zone from map
   */
  private clearZone(): void {
    this.circle?.setMap(null);
    this.circle = null;

    this.resizeMarkers.forEach((marker) => {
      marker.map = null;
    });
    this.resizeMarkers = [];
  }

  /**
   * Cleanup on destroy
   */
  private cleanup(): void {
    this.clearZone();
    if (this.restaurantMarker) {
      this.restaurantMarker.map = null;
    }
    this.restaurantMarker = null;
    this.map = null;
  }
}
