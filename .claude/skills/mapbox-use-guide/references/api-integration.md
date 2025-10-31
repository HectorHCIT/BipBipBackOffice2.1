# Mapbox API Integration Patterns

Patterns for integrating Mapbox APIs (Geocoding, Directions, Optimization) with Angular.

## 📖 Table of Contents

- [Geocoding](#geocoding)
- [Reverse Geocoding](#reverse-geocoding)
- [Directions (Routing)](#directions-routing)
- [Route Optimization](#route-optimization)
- [Service Pattern](#service-pattern)

---

## Geocoding

Search for addresses and places.

### Basic Geocoding Service

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';

export interface GeocodingFeature {
  id: string;
  type: string;
  place_name: string;
  text: string;
  center: [number, number];
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    accuracy?: string;
  };
  context?: Array<{
    id: string;
    text: string;
  }>;
}

export interface GeocodingResponse {
  type: 'FeatureCollection';
  query: string[];
  features: GeocodingFeature[];
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private http = inject(HttpClient);
  private baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  private accessToken = environment.mapboxToken;

  /**
   * Search for places by text query
   * @param query Search text
   * @param options Search options
   */
  search(query: string, options: GecodingOptions = {}): Observable<GeocodingFeature[]> {
    const params = this.buildParams(options);
    const url = `${this.baseUrl}/${encodeURIComponent(query)}.json?access_token=${this.accessToken}&${params}`;

    return this.http.get<GeocodingResponse>(url).pipe(
      map(response => response.features)
    );
  }

  /**
   * Search with proximity bias (results closer to a location are prioritized)
   */
  searchNear(query: string, proximity: [number, number], options: GecodingOptions = {}): Observable<GeocodingFeature[]> {
    return this.search(query, {
      ...options,
      proximity: proximity.join(',')
    });
  }

  /**
   * Search within a bounding box
   */
  searchInBounds(query: string, bbox: [number, number, number, number], options: GecodingOptions = {}): Observable<GeocodingFeature[]> {
    return this.search(query, {
      ...options,
      bbox: bbox.join(',')
    });
  }

  /**
   * Search only within specific countries
   */
  searchInCountries(query: string, countries: string[], options: GecodingOptions = {}): Observable<GeocodingFeature[]> {
    return this.search(query, {
      ...options,
      country: countries.join(',')
    });
  }

  private buildParams(options: GecodingOptions): string {
    const params = new URLSearchParams();

    if (options.proximity) params.append('proximity', options.proximity);
    if (options.bbox) params.append('bbox', options.bbox);
    if (options.country) params.append('country', options.country);
    if (options.types) params.append('types', options.types.join(','));
    if (options.language) params.append('language', options.language);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.autocomplete !== undefined) params.append('autocomplete', options.autocomplete.toString());

    return params.toString();
  }
}

export interface GecodingOptions {
  proximity?: string; // lng,lat
  bbox?: string; // minLng,minLat,maxLng,maxLat
  country?: string; // ISO 3166 country codes (e.g., 'hn,sv,gt')
  types?: string[]; // place types (e.g., ['address', 'poi'])
  language?: string; // ISO 639-1 language code (e.g., 'es')
  limit?: number; // Max results (1-10, default 5)
  autocomplete?: boolean; // Enable autocomplete
}
```

### Geocoding Search Component

```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { GeocodingService, GeocodingFeature } from './geocoding.service';
import { Map } from 'mapbox-gl';

@Component({
  selector: 'app-geocoding-search',
  imports: [NgxMapboxGLModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="search-panel">
        <h3>Search Location</h3>

        <div class="search-box">
          <input
            type="text"
            [formControl]="searchControl"
            placeholder="Search for a place..."
            class="search-input" />

          @if (loading()) {
            <span class="loading-indicator">🔄</span>
          }
        </div>

        @if (results().length > 0) {
          <div class="results-list">
            @for (result of results(); track result.id) {
              <div
                class="result-item"
                [class.selected]="selectedResult()?.id === result.id"
                (click)="selectResult(result)">
                <div class="result-icon">📍</div>
                <div class="result-content">
                  <div class="result-name">{{ result.text }}</div>
                  <div class="result-address">{{ result.place_name }}</div>
                </div>
              </div>
            }
          </div>
        } @else if (searchControl.value && !loading()) {
          <div class="no-results">
            No results found for "{{ searchControl.value }}"
          </div>
        }
      </div>

      <mgl-map
        [style]="'mapbox://styles/mapbox/streets-v11'"
        [zoom]="zoom()"
        [center]="center()"
        (mapLoad)="onMapLoad($event)">

        @if (selectedResult()) {
          <mgl-marker [lngLat]="selectedResult()!.center">
            <div class="search-marker">
              <div class="marker-icon">📍</div>
            </div>
          </mgl-marker>

          <mgl-popup
            [lngLat]="selectedResult()!.center"
            [closeButton]="true"
            [closeOnClick]="false">
            <div class="popup-content">
              <h4>{{ selectedResult()!.text }}</h4>
              <p>{{ selectedResult()!.place_name }}</p>
              <button (click)="getDirections()">Get Directions</button>
            </div>
          </mgl-popup>
        }
      </mgl-map>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      height: 600px;
      gap: 16px;
    }
    .search-panel {
      width: 350px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .search-panel h3 {
      margin: 0;
      padding: 16px;
      border-bottom: 1px solid #eee;
      font-size: 18px;
      font-weight: 600;
    }
    .search-box {
      padding: 16px;
      position: relative;
    }
    .search-input {
      width: 100%;
      padding: 12px 40px 12px 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .search-input:focus {
      outline: none;
      border-color: #3887be;
    }
    .loading-indicator {
      position: absolute;
      right: 28px;
      top: 28px;
      font-size: 16px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .results-list {
      flex: 1;
      overflow-y: auto;
    }
    .result-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .result-item:hover {
      background: #f8f9fa;
    }
    .result-item.selected {
      background: #e3f2fd;
    }
    .result-icon {
      font-size: 20px;
      margin-top: 2px;
    }
    .result-content {
      flex: 1;
      min-width: 0;
    }
    .result-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
    }
    .result-address {
      font-size: 13px;
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .no-results {
      padding: 32px 16px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    mgl-map {
      flex: 1;
      border-radius: 8px;
      overflow: hidden;
    }
    .search-marker {
      transform: translateY(-100%);
    }
    .marker-icon {
      font-size: 40px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }
    .popup-content h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
    }
    .popup-content p {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }
    .popup-content button {
      width: 100%;
      padding: 8px 16px;
      background: #3887be;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeocodingSearchComponent {
  private geocodingService = inject(GeocodingService);
  map?: Map;

  searchControl = new FormControl('');
  loading = signal(false);
  results = signal<GeocodingFeature[]>([]);
  selectedResult = signal<GeocodingFeature | null>(null);
  center = signal<[number, number]>([-87.622088, 13.783333]);
  zoom = signal<number[]>([12]);

  constructor() {
    // Setup search with debouncing
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 3) {
          this.results.set([]);
          return of([]);
        }

        this.loading.set(true);
        return this.geocodingService.searchNear(
          query,
          this.center(),
          {
            country: 'hn', // Honduras
            language: 'es',
            limit: 10,
            autocomplete: true
          }
        );
      })
    ).subscribe({
      next: (features) => {
        this.results.set(features);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Geocoding error:', error);
        this.loading.set(false);
      }
    });
  }

  onMapLoad(map: Map) {
    this.map = map;
  }

  selectResult(result: GeocodingFeature) {
    this.selectedResult.set(result);
    this.center.set(result.center);
    this.zoom.set([14]);

    // Fly to location
    this.map?.flyTo({
      center: result.center,
      zoom: 14,
      duration: 2000
    });
  }

  getDirections() {
    console.log('Get directions to:', this.selectedResult());
    // Implement directions
  }
}
```

---

## Reverse Geocoding

Convert coordinates to address.

### Reverse Geocoding Method

```typescript
// Add to GeocodingService

reverseGeocode(coords: [number, number], options: ReverseGecodingOptions = {}): Observable<GeocodingFeature | null> {
  const params = this.buildReverseParams(options);
  const url = `${this.baseUrl}/${coords[0]},${coords[1]}.json?access_token=${this.accessToken}&${params}`;

  return this.http.get<GeocodingResponse>(url).pipe(
    map(response => response.features.length > 0 ? response.features[0] : null)
  );
}

private buildReverseParams(options: ReverseGecodingOptions): string {
  const params = new URLSearchParams();

  if (options.types) params.append('types', options.types.join(','));
  if (options.language) params.append('language', options.language);
  if (options.limit) params.append('limit', options.limit.toString());

  return params.toString();
}

export interface ReverseGecodingOptions {
  types?: string[];
  language?: string;
  limit?: number;
}
```

### Reverse Geocoding Component

```typescript
import { Component, signal } from '@angular/core';
import { MapMouseEvent } from 'mapbox-gl';

@Component({
  selector: 'app-reverse-geocoding',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center"
      (mapClick)="onMapClick($event)">

      @if (clickedLocation()) {
        <mgl-marker [lngLat]="clickedLocation()!.coords">
          <div class="marker">📍</div>
        </mgl-marker>

        @if (clickedLocation()!.address) {
          <mgl-popup
            [lngLat]="clickedLocation()!.coords"
            [closeButton]="true"
            [closeOnClick]="false"
            (popupClose)="clearLocation()">
            <div class="popup-content">
              <h4>{{ clickedLocation()!.address!.text }}</h4>
              <p>{{ clickedLocation()!.address!.place_name }}</p>
              <div class="coords">
                <small>
                  {{ clickedLocation()!.coords[0].toFixed(6) }},
                  {{ clickedLocation()!.coords[1].toFixed(6) }}
                </small>
              </div>
            </div>
          </mgl-popup>
        }
      }
    </mgl-map>

    @if (loading()) {
      <div class="loading-overlay">
        <div class="spinner">Loading address...</div>
      </div>
    }

    <div class="instructions">
      <p>Click on the map to get address information</p>
    </div>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .marker {
      font-size: 32px;
    }
    .popup-content h4 {
      margin: 0 0 8px 0;
    }
    .popup-content p {
      margin: 0 0 8px 0;
      color: #666;
    }
    .coords {
      padding-top: 8px;
      border-top: 1px solid #eee;
    }
    .coords small {
      color: #999;
      font-family: monospace;
    }
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
    .instructions {
      position: absolute;
      top: 10px;
      left: 10px;
      background: white;
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReverseGeocodingComponent {
  private geocodingService = inject(GeocodingService);
  center: [number, number] = [-87.622088, 13.783333];

  loading = signal(false);
  clickedLocation = signal<{ coords: [number, number]; address: GeocodingFeature | null } | null>(null);

  onMapClick(event: MapMouseEvent) {
    const coords: [number, number] = [event.lngLat.lng, event.lngLat.lat];

    this.clickedLocation.set({ coords, address: null });
    this.loading.set(true);

    this.geocodingService.reverseGeocode(coords, {
      types: ['address', 'poi'],
      language: 'es'
    }).subscribe({
      next: (address) => {
        this.clickedLocation.update(loc =>
          loc ? { ...loc, address } : null
        );
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Reverse geocoding error:', error);
        this.loading.set(false);
      }
    });
  }

  clearLocation() {
    this.clickedLocation.set(null);
  }
}
```

---

## Directions (Routing)

Get routes between two or more points.

### Directions Service

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';

export interface DirectionsRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  legs: Array<{
    distance: number;
    duration: number;
    steps: Array<{
      distance: number;
      duration: number;
      geometry: {
        type: 'LineString';
        coordinates: [number, number][];
      };
      name: string;
      maneuver: {
        type: string;
        instruction: string;
        bearing_before: number;
        bearing_after: number;
        location: [number, number];
      };
    }>;
  }>;
}

export interface DirectionsResponse {
  routes: DirectionsRoute[];
  waypoints: Array<{
    name: string;
    location: [number, number];
  }>;
  code: string;
}

type DirectionsProfile = 'driving' | 'driving-traffic' | 'walking' | 'cycling';

@Injectable({ providedIn: 'root' })
export class DirectionsService {
  private http = inject(HttpClient);
  private baseUrl = 'https://api.mapbox.com/directions/v5/mapbox';
  private accessToken = environment.mapboxToken;

  /**
   * Get route between two or more points
   * @param coordinates Array of [lng, lat] coordinates
   * @param profile Travel profile
   * @param options Additional options
   */
  getRoute(
    coordinates: [number, number][],
    profile: DirectionsProfile = 'driving',
    options: DirectionsOptions = {}
  ): Observable<DirectionsRoute | null> {
    const coordsString = coordinates.map(c => c.join(',')).join(';');
    const params = this.buildParams(options);
    const url = `${this.baseUrl}/${profile}/${coordsString}?access_token=${this.accessToken}&${params}`;

    return this.http.get<DirectionsResponse>(url).pipe(
      map(response => response.routes.length > 0 ? response.routes[0] : null)
    );
  }

  /**
   * Get multiple alternative routes
   */
  getAlternativeRoutes(
    coordinates: [number, number][],
    profile: DirectionsProfile = 'driving',
    alternatives: number = 3
  ): Observable<DirectionsRoute[]> {
    const coordsString = coordinates.map(c => c.join(',')).join(';');
    const params = `alternatives=${alternatives}&geometries=geojson&steps=true`;
    const url = `${this.baseUrl}/${profile}/${coordsString}?access_token=${this.accessToken}&${params}`;

    return this.http.get<DirectionsResponse>(url).pipe(
      map(response => response.routes)
    );
  }

  private buildParams(options: DirectionsOptions): string {
    const params = new URLSearchParams();

    params.append('geometries', 'geojson');
    params.append('steps', 'true');

    if (options.alternatives !== undefined) params.append('alternatives', options.alternatives.toString());
    if (options.overview) params.append('overview', options.overview);
    if (options.exclude) params.append('exclude', options.exclude.join(','));
    if (options.continue_straight !== undefined) params.append('continue_straight', options.continue_straight.toString());

    return params.toString();
  }
}

export interface DirectionsOptions {
  alternatives?: number; // Number of alternative routes (max 3)
  overview?: 'full' | 'simplified' | 'false';
  exclude?: string[]; // Exclude road types (e.g., ['toll', 'ferry'])
  continue_straight?: boolean;
}
```

### Directions Component

```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { DirectionsService, DirectionsRoute } from './directions.service';
import { Map, LngLatBounds } from 'mapbox-gl';

@Component({
  selector: 'app-directions',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="zoom()"
      [center]="center"
      (mapLoad)="onMapLoad($event)"
      (mapClick)="onMapClick($event)">

      <!-- Route line -->
      @if (routeGeoJSON()) {
        <mgl-geojson-source
          id="route"
          [data]="routeGeoJSON()">
        </mgl-geojson-source>

        <mgl-layer
          id="route-line"
          type="line"
          source="route"
          [paint]="{
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }">
        </mgl-layer>
      }

      <!-- Start marker -->
      @if (start()) {
        <mgl-marker [lngLat]="start()!" [anchor]="'bottom'">
          <div class="route-marker start">
            <span>A</span>
          </div>
        </mgl-marker>
      }

      <!-- End marker -->
      @if (end()) {
        <mgl-marker [lngLat]="end()!" [anchor]="'bottom'">
          <div class="route-marker end">
            <span>B</span>
          </div>
        </mgl-marker>
      }
    </mgl-map>

    <!-- Control panel -->
    <div class="control-panel">
      <h3>Directions</h3>

      <div class="instructions-header">
        @if (!start()) {
          <p class="hint">Click on map to set start point (A)</p>
        } @else if (!end()) {
          <p class="hint">Click on map to set end point (B)</p>
        } @else if (loading()) {
          <p class="hint">Loading route...</p>
        } @else if (route()) {
          <div class="route-summary">
            <div class="summary-item">
              <span class="label">Distance:</span>
              <span class="value">{{ formatDistance(route()!.distance) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Duration:</span>
              <span class="value">{{ formatDuration(route()!.duration) }}</span>
            </div>
          </div>
        }
      </div>

      @if (route()) {
        <div class="instructions-list">
          <h4>Turn-by-turn</h4>
          @for (step of route()!.legs[0].steps; track $index) {
            <div class="instruction">
              <div class="step-number">{{ $index + 1 }}</div>
              <div class="step-content">
                <div class="step-text">{{ step.maneuver.instruction }}</div>
                <div class="step-distance">{{ formatDistance(step.distance) }}</div>
              </div>
            </div>
          }
        </div>
      }

      @if (start() || end()) {
        <button class="btn-reset" (click)="reset()">
          Reset
        </button>
      }
    </div>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .route-marker {
      width: 40px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      color: white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .route-marker span {
      transform: rotate(45deg);
    }
    .route-marker.start {
      background: #4caf50;
    }
    .route-marker.end {
      background: #f44336;
    }
    .control-panel {
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      width: 320px;
      max-height: 580px;
      display: flex;
      flex-direction: column;
      z-index: 1;
    }
    .control-panel h3 {
      margin: 0;
      padding: 16px;
      border-bottom: 1px solid #eee;
      font-size: 18px;
    }
    .instructions-header {
      padding: 16px;
    }
    .hint {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .route-summary {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }
    .summary-item .label {
      color: #666;
    }
    .summary-item .value {
      font-weight: 600;
      color: #3887be;
    }
    .instructions-list {
      flex: 1;
      overflow-y: auto;
      padding: 0 16px 16px;
    }
    .instructions-list h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
    }
    .instruction {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .step-number {
      width: 24px;
      height: 24px;
      background: #e3f2fd;
      color: #3887be;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .step-content {
      flex: 1;
    }
    .step-text {
      font-size: 14px;
      margin-bottom: 4px;
    }
    .step-distance {
      font-size: 12px;
      color: #666;
    }
    .btn-reset {
      margin: 16px;
      padding: 10px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectionsComponent {
  private directionsService = inject(DirectionsService);
  map?: Map;
  center: [number, number] = [-87.622088, 13.783333];
  zoom = signal<number[]>([12]);

  start = signal<[number, number] | null>(null);
  end = signal<[number, number] | null>(null);
  route = signal<DirectionsRoute | null>(null);
  loading = signal(false);

  routeGeoJSON = computed(() => {
    const r = this.route();
    if (!r) return null;

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: r.geometry
    };
  });

  onMapLoad(map: Map) {
    this.map = map;
  }

  onMapClick(event: any) {
    const coords: [number, number] = [event.lngLat.lng, event.lngLat.lat];

    if (!this.start()) {
      this.start.set(coords);
    } else if (!this.end()) {
      this.end.set(coords);
      this.calculateRoute();
    } else {
      // Reset and start over
      this.reset();
      this.start.set(coords);
    }
  }

  calculateRoute() {
    const startCoords = this.start();
    const endCoords = this.end();

    if (!startCoords || !endCoords) return;

    this.loading.set(true);
    this.directionsService.getRoute([startCoords, endCoords], 'driving').subscribe({
      next: (route) => {
        this.route.set(route);
        this.loading.set(false);

        if (route) {
          this.fitBoundsToRoute(route);
        }
      },
      error: (error) => {
        console.error('Directions error:', error);
        this.loading.set(false);
      }
    });
  }

  fitBoundsToRoute(route: DirectionsRoute) {
    if (!this.map) return;

    const coordinates = route.geometry.coordinates;
    const bounds = new LngLatBounds();

    coordinates.forEach(coord => {
      bounds.extend(coord as [number, number]);
    });

    this.map.fitBounds(bounds, { padding: 80 });
  }

  reset() {
    this.start.set(null);
    this.end.set(null);
    this.route.set(null);
  }

  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  }
}
```

---

## Route Optimization

Optimize route for multiple stops (Traveling Salesman Problem).

### Optimization Service

```typescript
// Add to DirectionsService

getOptimizedRoute(
  coordinates: [number, number][],
  profile: DirectionsProfile = 'driving'
): Observable<DirectionsRoute | null> {
  const coordsString = coordinates.map(c => c.join(',')).join(';');
  const params = 'geometries=geojson&steps=true&source=first&destination=last';
  const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/${profile}/${coordsString}?access_token=${this.accessToken}&${params}`;

  return this.http.get<DirectionsResponse>(url).pipe(
    map(response => response.routes.length > 0 ? response.routes[0] : null)
  );
}
```

---

## Service Pattern

### Complete API Service

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class MapboxApiService {
  private http = inject(HttpClient);
  private accessToken = environment.mapboxToken;

  // Geocoding
  geocode(query: string, options?: GecodingOptions): Observable<GeocodingFeature[]> {
    const url = this.buildGeocodingUrl(query, options);
    return this.http.get<GeocodingResponse>(url).pipe(
      map(response => response.features),
      retry(2),
      catchError(this.handleError)
    );
  }

  reverseGeocode(coords: [number, number], options?: ReverseGecodingOptions): Observable<GeocodingFeature | null> {
    const url = this.buildReverseGeocodingUrl(coords, options);
    return this.http.get<GeocodingResponse>(url).pipe(
      map(response => response.features.length > 0 ? response.features[0] : null),
      retry(2),
      catchError(this.handleError)
    );
  }

  // Directions
  getDirections(
    coordinates: [number, number][],
    profile: DirectionsProfile = 'driving',
    options?: DirectionsOptions
  ): Observable<DirectionsRoute | null> {
    const url = this.buildDirectionsUrl(coordinates, profile, options);
    return this.http.get<DirectionsResponse>(url).pipe(
      map(response => response.routes.length > 0 ? response.routes[0] : null),
      retry(2),
      catchError(this.handleError)
    );
  }

  // Optimization
  optimizeRoute(
    coordinates: [number, number][],
    profile: DirectionsProfile = 'driving'
  ): Observable<DirectionsRoute | null> {
    const url = this.buildOptimizationUrl(coordinates, profile);
    return this.http.get<DirectionsResponse>(url).pipe(
      map(response => response.routes.length > 0 ? response.routes[0] : null),
      retry(2),
      catchError(this.handleError)
    );
  }

  private buildGeocodingUrl(query: string, options?: GecodingOptions): string {
    const baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
    const params = new URLSearchParams({ access_token: this.accessToken });

    if (options?.proximity) params.append('proximity', options.proximity);
    if (options?.bbox) params.append('bbox', options.bbox);
    if (options?.country) params.append('country', options.country);
    if (options?.types) params.append('types', options.types.join(','));
    if (options?.language) params.append('language', options.language);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.autocomplete !== undefined) params.append('autocomplete', options.autocomplete.toString());

    return `${baseUrl}/${encodeURIComponent(query)}.json?${params.toString()}`;
  }

  private buildReverseGeocodingUrl(coords: [number, number], options?: ReverseGecodingOptions): string {
    const baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
    const params = new URLSearchParams({ access_token: this.accessToken });

    if (options?.types) params.append('types', options.types.join(','));
    if (options?.language) params.append('language', options.language);

    return `${baseUrl}/${coords[0]},${coords[1]}.json?${params.toString()}`;
  }

  private buildDirectionsUrl(
    coordinates: [number, number][],
    profile: DirectionsProfile,
    options?: DirectionsOptions
  ): string {
    const baseUrl = 'https://api.mapbox.com/directions/v5/mapbox';
    const coordsString = coordinates.map(c => c.join(',')).join(';');
    const params = new URLSearchParams({
      access_token: this.accessToken,
      geometries: 'geojson',
      steps: 'true'
    });

    if (options?.alternatives !== undefined) params.append('alternatives', options.alternatives.toString());
    if (options?.overview) params.append('overview', options.overview);

    return `${baseUrl}/${profile}/${coordsString}?${params.toString()}`;
  }

  private buildOptimizationUrl(coordinates: [number, number][], profile: DirectionsProfile): string {
    const baseUrl = 'https://api.mapbox.com/optimized-trips/v1/mapbox';
    const coordsString = coordinates.map(c => c.join(',')).join(';');
    const params = new URLSearchParams({
      access_token: this.accessToken,
      geometries: 'geojson',
      steps: 'true',
      source: 'first',
      destination: 'last'
    });

    return `${baseUrl}/${profile}/${coordsString}?${params.toString()}`;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```

---

## 🔗 Additional Resources

- [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)
- [Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/)
- [Mapbox Optimization API](https://docs.mapbox.com/api/navigation/optimization/)
