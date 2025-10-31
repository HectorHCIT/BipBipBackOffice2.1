import {
  Component,
  ElementRef,
  input,
  output,
  effect,
  signal,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import { circle as turfCircle } from '@turf/turf';
import { environment } from '../../../../environments/environment';

/**
 * Interface for coverage zones to display
 */
export interface MapZone {
  id: number;
  name: string;
  lat: number;
  lon: number;
  radius: number; // in meters
  color?: string;
}

/**
 * Interface for restaurant marker
 */
export interface MapMarker {
  lat: number;
  lon: number;
  title: string;
  icon?: string;
}

/**
 * MapboxViewerComponent
 *
 * Responsabilidad única: Visualizar zonas de cobertura en Mapbox (solo lectura)
 *
 * - Recibe zonas como círculos (centro + radio)
 * - Convierte a polígonos GeoJSON con Turf.js
 * - Renderiza capas: fill, line, labels
 * - Emite eventos de click en zonas
 * - NO maneja edición (solo visualización)
 */
@Component({
  selector: 'app-mapbox-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper">
      <div #mapContainer class="map"></div>

      @if (isLoading()) {
        <div class="map-loading">
          <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
          <p class="mt-2">Cargando mapa...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .map-wrapper {
      width: 100%;
      height: 500px;
      position: relative;
    }

    .map {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }

    .map-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      z-index: 10;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapboxViewerComponent implements AfterViewInit, OnDestroy {
  // Inputs
  readonly zones = input<MapZone[]>([]);
  readonly restaurantMarker = input<MapMarker | null>(null);
  readonly centerCoords = input<{ lat: number; lon: number }>({ lat: 14.065070, lon: -87.192136 });
  readonly initialZoom = input<number>(13);

  // Outputs
  readonly onZoneClick = output<number>(); // Emite zone.id

  // State
  readonly isLoading = signal<boolean>(true);

  // Mapbox instance
  private map: mapboxgl.Map | null = null;
  private restaurantMarkerInstance: mapboxgl.Marker | null = null;

  constructor(private elementRef: ElementRef) {
    // Effect: React to zones changes
    effect(() => {
      const currentZones = this.zones();
      if (this.map && !this.isLoading()) {
        this.renderZones(currentZones);
      }
    });

    // Effect: React to restaurant marker changes
    effect(() => {
      const marker = this.restaurantMarker();
      if (this.map && !this.isLoading()) {
        this.updateRestaurantMarker(marker);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  /**
   * Initialize Mapbox map
   */
  private initializeMap(): void {
    const container = this.elementRef.nativeElement.querySelector('.map');
    if (!container) return;

    const center = this.centerCoords();
    const safeCenter: [number, number] = [center.lon || -87.192136, center.lat || 14.065070];

    try {
      this.map = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: safeCenter,
        zoom: this.initialZoom(),
        accessToken: environment.mapboxToken
      });

      this.map.on('load', () => {
        this.isLoading.set(false);

        // Render initial data
        this.renderZones(this.zones());
        this.updateRestaurantMarker(this.restaurantMarker());
      });

      // Add navigation controls
      this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (error) {
      console.error('Error initializing Mapbox:', error);
      this.isLoading.set(false);
    }
  }

  /**
   * Render coverage zones on map
   */
  private renderZones(zones: MapZone[]): void {
    if (!this.map) return;

    // Remove all existing zone layers and sources
    this.removeAllZoneLayers();

    // Add each zone
    zones.forEach((zone, index) => {
      this.addZoneToMap(zone, index);
    });
  }

  /**
   * Add a single zone to the map
   */
  private addZoneToMap(zone: MapZone, index: number): void {
    if (!this.map) return;

    const sourceId = `zone-${zone.id}`;
    const fillLayerId = `zone-fill-${zone.id}`;
    const lineLayerId = `zone-line-${zone.id}`;
    const labelLayerId = `zone-label-${zone.id}`;

    // Convert circle to GeoJSON polygon using Turf.js
    const circleGeoJSON = turfCircle(
      [zone.lon, zone.lat],
      zone.radius,
      { steps: 64, units: 'meters' }
    );

    // Add source
    this.map.addSource(sourceId, {
      type: 'geojson',
      data: circleGeoJSON
    });

    // Add fill layer
    this.map.addLayer({
      id: fillLayerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': zone.color || '#fb0021',
        'fill-opacity': 0.15
      }
    });

    // Add line layer (border)
    this.map.addLayer({
      id: lineLayerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': zone.color || '#fb0021',
        'line-width': 2,
        'line-opacity': 0.5
      }
    });

    // Add label layer
    const radiusKm = zone.radius >= 1000
      ? `${(zone.radius / 1000).toFixed(1)} km`
      : `${zone.radius} m`;

    this.map.addLayer({
      id: labelLayerId,
      type: 'symbol',
      source: sourceId,
      layout: {
        'text-field': `${zone.name}\n${radiusKm}`,
        'text-size': 14,
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#1f1f1f',
        'text-halo-width': 1.5
      }
    });

    // Add click handler to fill layer
    this.map.on('click', fillLayerId, () => {
      this.onZoneClick.emit(zone.id);
    });

    // Change cursor on hover
    this.map.on('mouseenter', fillLayerId, () => {
      if (this.map) {
        this.map.getCanvas().style.cursor = 'pointer';
      }
    });

    this.map.on('mouseleave', fillLayerId, () => {
      if (this.map) {
        this.map.getCanvas().style.cursor = '';
      }
    });
  }

  /**
   * Remove all zone layers and sources
   */
  private removeAllZoneLayers(): void {
    if (!this.map) return;

    const style = this.map.getStyle();
    if (!style || !style.layers) return;

    // Remove all layers and sources that start with 'zone-'
    style.layers.forEach((layer) => {
      if (layer.id.startsWith('zone-')) {
        this.map?.removeLayer(layer.id);
      }
    });

    Object.keys(style.sources).forEach((sourceId) => {
      if (sourceId.startsWith('zone-')) {
        this.map?.removeSource(sourceId);
      }
    });
  }

  /**
   * Update restaurant marker
   */
  private updateRestaurantMarker(marker: MapMarker | null): void {
    if (!this.map) return;

    // Remove existing marker
    if (this.restaurantMarkerInstance) {
      this.restaurantMarkerInstance.remove();
      this.restaurantMarkerInstance = null;
    }

    // Add new marker if provided
    if (marker) {
      const el = document.createElement('div');
      el.className = 'restaurant-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundImage = marker.icon
        ? `url(${marker.icon})`
        : 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI2ZiMDAyMSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1zaXplPSIyMCI+UjwvdGV4dD48L3N2Zz4=)';
      el.style.backgroundSize = 'cover';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.title = marker.title;

      this.restaurantMarkerInstance = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([marker.lon, marker.lat])
        .addTo(this.map);

      // Center map on restaurant
      this.map.flyTo({
        center: [marker.lon, marker.lat],
        zoom: this.initialZoom()
      });
    }
  }
}
