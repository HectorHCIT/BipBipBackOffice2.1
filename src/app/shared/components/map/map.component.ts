import {
  Component,
  AfterViewInit,
  OnDestroy,
  input,
  effect,
  viewChild,
  ElementRef,
  ChangeDetectionStrategy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../../environments/environment';

/**
 * Interface para los marcadores del mapa
 */
export interface MapMarker {
  lat: number;
  lng: number;
  icon: string;
  info?: string;
}

/**
 * Componente de mapa con Mapbox GL
 * Muestra marcadores en el mapa y se centra en el primer marcador
 */
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements AfterViewInit, OnDestroy {
  // Inputs
  mapMarkers = input<MapMarker[]>([]);
  showSearch = input<boolean>(false);

  // ViewChild para el contenedor del mapa
  private mapContainer = viewChild.required<ElementRef>('mapContainer');

  // Estado interno
  private map?: mapboxgl.Map;
  private markers: mapboxgl.Marker[] = [];
  private readonly defaultCenter: [number, number] = [-89.2182, 13.6929]; // San Salvador
  private readonly defaultZoom = 13;

  constructor() {
    // Effect para actualizar marcadores cuando cambien
    effect(() => {
      const markers = this.mapMarkers();
      if (this.map && markers && markers.length > 0) {
        this.updateMarkers(markers);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.clearMarkers();
    if (this.map) {
      this.map.remove();
    }
  }

  /**
   * Inicializar el mapa de Mapbox
   */
  private initializeMap(): void {
    const container = this.mapContainer();
    if (!container) return;

    try {
      // Crear instancia del mapa con accessToken
      this.map = new mapboxgl.Map({
        container: container.nativeElement,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: this.defaultCenter,
        zoom: this.defaultZoom,
        accessToken: environment.mapboxToken
      });

      // Agregar controles de navegación
      this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Agregar marcadores si ya existen
      const markers = this.mapMarkers();
      if (markers && markers.length > 0) {
        this.updateMarkers(markers);
      }
    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
    }
  }

  /**
   * Actualizar marcadores en el mapa
   */
  private updateMarkers(markers: MapMarker[]): void {
    if (!this.map) return;

    // Limpiar marcadores anteriores
    this.clearMarkers();

    // Agregar nuevos marcadores
    markers.forEach((marker) => {
      this.addMarker(
        { lat: marker.lat, lng: marker.lng },
        marker.icon,
        marker.info
      );
    });

    // Centrar mapa en el primer marcador
    if (markers.length > 0) {
      this.map.flyTo({
        center: [markers[0].lng, markers[0].lat],
        zoom: 14,
        speed: 1.2,
        curve: 1
      });
    }

    // Si hay 2 marcadores, ajustar bounds para mostrar ambos
    if (markers.length === 2) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach(marker => {
        bounds.extend([marker.lng, marker.lat]);
      });

      this.map.fitBounds(bounds, {
        padding: 80,
        maxZoom: 15,
        duration: 1500
      });
    }
  }

  /**
   * Agregar un marcador individual al mapa
   */
  private addMarker(coords: { lat: number; lng: number }, iconUrl: string, info?: string): void {
    const el = document.createElement('img');
    el.src = iconUrl;
    el.className = 'marker';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.border = '2px solid white';
    el.style.borderRadius = '50%';
    el.style.cursor = 'pointer';

    let popupContent = '';
    if (info) {
      const [header, subheader] = info.split('|');
      const [title, code] = subheader ? subheader.split('/') : ['', ''];

      popupContent = `
        <div class="p-3">
          <h3 class="font-semibold text-gray-900 mb-1">${header.trim()}</h3>
          ${title ? `<p class="text-sm text-gray-600">${title.trim()}</p>` : ''}
          ${code ? `<p class="text-xs text-gray-500">${code.trim()}</p>` : ''}
        </div>
      `;
    }

    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      anchor: 'bottom',
    }).setHTML(popupContent);

    // Crear marcador pasando el elemento directamente (sin especificar anchor)
    // Esto hace que Mapbox use el comportamiento por defecto correcto
    const mapboxMarker = new mapboxgl.Marker(el)
      .setLngLat([coords.lng, coords.lat])
      .setPopup(popup)
      .addTo(this.map!);

    this.markers.push(mapboxMarker);
  }

  /**
   * Limpiar todos los marcadores del mapa
   */
  private clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }
}
