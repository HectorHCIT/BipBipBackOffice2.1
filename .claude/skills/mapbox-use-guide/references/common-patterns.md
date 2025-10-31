# Common Mapbox Patterns for Angular

Ready-to-use patterns for typical Mapbox use cases in Angular with signals and TypeScript.

## 📖 Table of Contents

- [Markers](#markers)
- [Custom Markers](#custom-markers)
- [Popups](#popups)
- [Controls](#controls)
- [Geolocation](#geolocation)
- [GeoJSON Layers](#geojson-layers)
- [Clustering](#clustering)
- [Map Interactions](#map-interactions)
- [Angular Integration](#angular-integration)
- [Services](#services)

---

## Markers

### Basic Marker

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';

@Component({
  selector: 'app-basic-marker',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">

      <mgl-marker [lngLat]="center"></mgl-marker>
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicMarkerComponent {
  center: [number, number] = [-87.622088, 13.783333];
}
```

### Multiple Markers from Array

```typescript
import { Component, signal } from '@angular/core';

interface Location {
  id: number;
  name: string;
  coords: [number, number];
}

@Component({
  selector: 'app-multiple-markers',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[10]"
      [center]="center">

      @for (location of locations(); track location.id) {
        <mgl-marker [lngLat]="location.coords">
          <div class="marker-label">
            {{ location.name }}
          </div>
        </mgl-marker>
      }
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .marker-label {
      background: #3887be;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultipleMarkersComponent {
  center: [number, number] = [-87.622088, 13.783333];

  locations = signal<Location[]>([
    { id: 1, name: 'Location 1', coords: [-87.622088, 13.783333] },
    { id: 2, name: 'Location 2', coords: [-87.632088, 13.793333] },
    { id: 3, name: 'Location 3', coords: [-87.612088, 13.773333] }
  ]);

  addLocation(name: string, coords: [number, number]) {
    this.locations.update(locs => [
      ...locs,
      { id: Date.now(), name, coords }
    ]);
  }
}
```

### Draggable Marker

```typescript
import { Component, signal } from '@angular/core';
import { Map } from 'mapbox-gl';

@Component({
  selector: 'app-draggable-marker',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">

      <mgl-marker
        [lngLat]="markerPosition()"
        [draggable]="true"
        (markerDragEnd)="onDragEnd($event)">
        <div class="drag-marker">📍</div>
      </mgl-marker>
    </mgl-map>

    <div class="info-panel">
      <p>Coordinates: {{ markerPosition()[0].toFixed(6) }}, {{ markerPosition()[1].toFixed(6) }}</p>
    </div>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .drag-marker {
      font-size: 32px;
      cursor: move;
    }
    .info-panel {
      position: absolute;
      top: 10px;
      left: 10px;
      background: white;
      padding: 10px 15px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraggableMarkerComponent {
  center: [number, number] = [-87.622088, 13.783333];
  markerPosition = signal<[number, number]>([-87.622088, 13.783333]);

  onDragEnd(event: any) {
    const lngLat = event.marker.getLngLat();
    this.markerPosition.set([lngLat.lng, lngLat.lat]);
    console.log('New position:', lngLat);
  }
}
```

---

## Custom Markers

### Image Marker

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-image-marker',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">

      <mgl-marker
        [lngLat]="center"
        [anchor]="'bottom'">
        <div class="custom-marker">
          <img src="assets/icons/location-pin.svg" alt="marker" />
        </div>
      </mgl-marker>
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .custom-marker {
      width: 40px;
      height: 40px;
      cursor: pointer;
    }
    .custom-marker img {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageMarkerComponent {
  center: [number, number] = [-87.622088, 13.783333];
}
```

### Marker with Badge

```typescript
import { Component, signal } from '@angular/core';

interface DeliveryPoint {
  id: number;
  coords: [number, number];
  count: number;
  status: 'pending' | 'completed' | 'failed';
}

@Component({
  selector: 'app-badge-markers',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[11]"
      [center]="center">

      @for (point of deliveryPoints(); track point.id) {
        <mgl-marker [lngLat]="point.coords">
          <div class="marker-badge" [attr.data-status]="point.status">
            <span class="count">{{ point.count }}</span>
          </div>
        </mgl-marker>
      }
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .marker-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      cursor: pointer;
    }
    .marker-badge[data-status="pending"] {
      background: #ffc107;
    }
    .marker-badge[data-status="completed"] {
      background: #4caf50;
    }
    .marker-badge[data-status="failed"] {
      background: #f44336;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeMarkersComponent {
  center: [number, number] = [-87.622088, 13.783333];

  deliveryPoints = signal<DeliveryPoint[]>([
    { id: 1, coords: [-87.622088, 13.783333], count: 5, status: 'completed' },
    { id: 2, coords: [-87.632088, 13.793333], count: 3, status: 'pending' },
    { id: 3, coords: [-87.612088, 13.773333], count: 1, status: 'failed' }
  ]);
}
```

### Animated Pulse Marker

```typescript
@Component({
  selector: 'app-pulse-marker',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/dark-v10'"
      [zoom]="[13]"
      [center]="center">

      <mgl-marker [lngLat]="center">
        <div class="pulse-marker">
          <div class="pulse-ring"></div>
          <div class="pulse-dot"></div>
        </div>
      </mgl-marker>
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .pulse-marker {
      position: relative;
      width: 20px;
      height: 20px;
    }
    .pulse-dot {
      position: absolute;
      width: 20px;
      height: 20px;
      background: #4285f4;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
      z-index: 2;
    }
    .pulse-ring {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(66, 133, 244, 0.3);
      animation: pulse 2s ease-out infinite;
      z-index: 1;
    }
    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: scale(3);
        opacity: 0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PulseMarkerComponent {
  center: [number, number] = [-87.622088, 13.783333];
}
```

---

## Popups

### Marker with Simple Popup

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-marker-popup',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">

      <mgl-marker [lngLat]="center">
        <mgl-popup [closeOnClick]="false">
          <h3>San Marcos de Colón</h3>
          <p>Choluteca, Honduras</p>
        </mgl-popup>
      </mgl-marker>
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    :host ::ng-deep .mapboxgl-popup-content h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
    }
    :host ::ng-deep .mapboxgl-popup-content p {
      margin: 0;
      color: #666;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkerPopupComponent {
  center: [number, number] = [-87.622088, 13.783333];
}
```

### Popup with Actions

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-popup-actions',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">

      <mgl-marker [lngLat]="center">
        <mgl-popup [closeButton]="true" [maxWidth]="'300px'">
          <div class="popup-content">
            <h3>Delivery Point</h3>
            <p class="address">{{ address }}</p>
            <div class="actions">
              <button class="btn-primary" (click)="viewDetails()">
                View Details
              </button>
              <button class="btn-secondary" (click)="getDirections()">
                Directions
              </button>
            </div>
          </div>
        </mgl-popup>
      </mgl-marker>
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .popup-content {
      padding: 4px;
    }
    .popup-content h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
    }
    .address {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
    .actions button {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    .btn-primary {
      background: #3887be;
      color: white;
    }
    .btn-secondary {
      background: #f0f0f0;
      color: #333;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupActionsComponent {
  center: [number, number] = [-87.622088, 13.783333];
  address = 'Calle Principal, San Marcos de Colón';

  viewDetails() {
    console.log('View details clicked');
  }

  getDirections() {
    console.log('Get directions clicked');
  }
}
```

### Dynamic Popups on Click

```typescript
import { Component, signal } from '@angular/core';
import { MapMouseEvent } from 'mapbox-gl';

interface PopupData {
  coords: [number, number];
  title: string;
  description: string;
}

@Component({
  selector: 'app-click-popup',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center"
      (mapClick)="onMapClick($event)">

      @if (popupData()) {
        <mgl-popup
          [lngLat]="popupData()!.coords"
          [closeButton]="true"
          (popupClose)="closePopup()">
          <div class="popup-content">
            <h4>{{ popupData()!.title }}</h4>
            <p>{{ popupData()!.description }}</p>
          </div>
        </mgl-popup>
      }
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .popup-content h4 {
      margin: 0 0 8px 0;
    }
    .popup-content p {
      margin: 0;
      color: #666;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClickPopupComponent {
  center: [number, number] = [-87.622088, 13.783333];
  popupData = signal<PopupData | null>(null);

  onMapClick(event: MapMouseEvent) {
    const coords: [number, number] = [event.lngLat.lng, event.lngLat.lat];
    this.popupData.set({
      coords,
      title: 'Selected Location',
      description: `Coordinates: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
    });
  }

  closePopup() {
    this.popupData.set(null);
  }
}
```

---

## Controls

### All Controls Example

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-all-controls',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">

      <!-- Navigation (zoom + compass) -->
      <mgl-control
        mglNavigation
        [showCompass]="true"
        [showZoom]="true"
        [visualizePitch]="false"
        position="top-right">
      </mgl-control>

      <!-- Geolocation -->
      <mgl-control
        mglGeolocate
        [trackUserLocation]="true"
        [showUserLocation]="true"
        [showAccuracyCircle]="true"
        position="top-right">
      </mgl-control>

      <!-- Scale -->
      <mgl-control
        mglScale
        [unit]="'metric'"
        [maxWidth]="100"
        position="bottom-left">
      </mgl-control>

      <!-- Fullscreen -->
      <mgl-control
        mglFullscreen
        position="top-right">
      </mgl-control>
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllControlsComponent {
  center: [number, number] = [-87.622088, 13.783333];
}
```

### Custom Control - Style Switcher

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-style-switcher',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="currentStyle()"
      [zoom]="[12]"
      [center]="center">

      <mgl-control position="top-left">
        <div class="style-switcher">
          <h4>Map Style</h4>
          @for (style of styles; track style.id) {
            <button
              [class.active]="currentStyle() === style.url"
              (click)="changeStyle(style.url)">
              {{ style.name }}
            </button>
          }
        </div>
      </mgl-control>
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .style-switcher {
      background: white;
      padding: 12px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      min-width: 150px;
    }
    .style-switcher h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
    }
    .style-switcher button {
      display: block;
      width: 100%;
      padding: 8px 12px;
      margin: 4px 0;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      text-align: left;
      transition: all 0.2s;
    }
    .style-switcher button:hover {
      background: #f5f5f5;
    }
    .style-switcher button.active {
      background: #3887be;
      color: white;
      border-color: #3887be;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StyleSwitcherComponent {
  center: [number, number] = [-87.622088, 13.783333];
  currentStyle = signal('mapbox://styles/mapbox/streets-v11');

  styles = [
    { id: 1, name: 'Streets', url: 'mapbox://styles/mapbox/streets-v11' },
    { id: 2, name: 'Outdoors', url: 'mapbox://styles/mapbox/outdoors-v11' },
    { id: 3, name: 'Satellite', url: 'mapbox://styles/mapbox/satellite-streets-v11' },
    { id: 4, name: 'Dark', url: 'mapbox://styles/mapbox/dark-v10' },
    { id: 5, name: 'Light', url: 'mapbox://styles/mapbox/light-v10' }
  ];

  changeStyle(styleUrl: string) {
    this.currentStyle.set(styleUrl);
  }
}
```

---

## Geolocation

### Track User Location

```typescript
import { Component, signal } from '@angular/core';
import { Map } from 'mapbox-gl';

@Component({
  selector: 'app-track-location',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="zoom()"
      [center]="center()"
      (mapLoad)="onMapLoad($event)">

      <mgl-control
        mglGeolocate
        [trackUserLocation]="true"
        [showUserLocation]="true"
        [showAccuracyCircle]="true"
        (geolocate)="onGeolocate($event)"
        (error)="onError($event)"
        position="top-right">
      </mgl-control>

      @if (userLocation()) {
        <mgl-marker [lngLat]="userLocation()!">
          <div class="user-marker">
            <div class="pulse"></div>
            <div class="dot"></div>
          </div>
        </mgl-marker>
      }
    </mgl-map>

    @if (accuracy()) {
      <div class="info-panel">
        <p><strong>Your Location</strong></p>
        <p>Accuracy: ±{{ accuracy() }}m</p>
      </div>
    }
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .user-marker {
      position: relative;
      width: 20px;
      height: 20px;
    }
    .dot {
      position: absolute;
      width: 20px;
      height: 20px;
      background: #4285f4;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
    }
    .pulse {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(66, 133, 244, 0.3);
      animation: pulse 2s ease-out infinite;
    }
    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: scale(3);
        opacity: 0;
      }
    }
    .info-panel {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background: white;
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 1;
    }
    .info-panel p {
      margin: 4px 0;
      font-size: 14px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackLocationComponent {
  map?: Map;
  center = signal<[number, number]>([-87.622088, 13.783333]);
  zoom = signal<number[]>([12]);
  userLocation = signal<[number, number] | null>(null);
  accuracy = signal<number | null>(null);

  onMapLoad(map: Map) {
    this.map = map;
  }

  onGeolocate(event: any) {
    const coords = event.coords;
    const lngLat: [number, number] = [coords.longitude, coords.latitude];

    this.userLocation.set(lngLat);
    this.accuracy.set(Math.round(coords.accuracy));

    // Fly to user location
    this.map?.flyTo({
      center: lngLat,
      zoom: 15,
      duration: 2000
    });
  }

  onError(error: any) {
    console.error('Geolocation error:', error);
  }
}
```

---

## GeoJSON Layers

### Line Layer (Route)

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-route-layer',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[11]"
      [center]="center">

      <mgl-geojson-source
        id="route"
        [data]="routeGeoJSON">
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

      <!-- Start and end markers -->
      <mgl-marker [lngLat]="routeGeoJSON.geometry.coordinates[0]">
        <div class="route-marker start">A</div>
      </mgl-marker>

      <mgl-marker [lngLat]="routeGeoJSON.geometry.coordinates[routeGeoJSON.geometry.coordinates.length - 1]">
        <div class="route-marker end">B</div>
      </mgl-marker>
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .route-marker {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .route-marker.start {
      background: #4caf50;
    }
    .route-marker.end {
      background: #f44336;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteLayerComponent {
  center: [number, number] = [-87.622088, 13.783333];

  routeGeoJSON = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [-87.622088, 13.783333],
        [-87.625, 13.785],
        [-87.628, 13.788],
        [-87.632088, 13.793333]
      ]
    }
  };
}
```

### Polygon Layer

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-polygon-layer',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">

      <mgl-geojson-source
        id="zones"
        [data]="zonesGeoJSON">
      </mgl-geojson-source>

      <!-- Fill layer -->
      <mgl-layer
        id="zones-fill"
        type="fill"
        source="zones"
        [paint]="{
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.4
        }"
        (layerClick)="onZoneClick($event)">
      </mgl-layer>

      <!-- Border layer -->
      <mgl-layer
        id="zones-border"
        type="line"
        source="zones"
        [paint]="{
          'line-color': ['get', 'color'],
          'line-width': 2
        }">
      </mgl-layer>
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolygonLayerComponent {
  center: [number, number] = [-87.622088, 13.783333];

  zonesGeoJSON = {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: {
          name: 'Zone 1',
          color: '#3887be'
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [-87.630, 13.790],
            [-87.620, 13.790],
            [-87.620, 13.780],
            [-87.630, 13.780],
            [-87.630, 13.790]
          ]]
        }
      },
      {
        type: 'Feature' as const,
        properties: {
          name: 'Zone 2',
          color: '#e55e5e'
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [-87.640, 13.800],
            [-87.630, 13.800],
            [-87.630, 13.790],
            [-87.640, 13.790],
            [-87.640, 13.800]
          ]]
        }
      }
    ]
  };

  onZoneClick(event: any) {
    if (event.features && event.features.length > 0) {
      const zone = event.features[0].properties;
      console.log('Clicked zone:', zone.name);
    }
  }
}
```

---

## Clustering

### Clustered Markers

```typescript
import { Component, signal } from '@angular/core';
import { Map } from 'mapbox-gl';

@Component({
  selector: 'app-clustered-markers',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[10]"
      [center]="center"
      (mapLoad)="onMapLoad($event)">

      <mgl-geojson-source
        id="points"
        [data]="pointsGeoJSON"
        [cluster]="true"
        [clusterMaxZoom]="14"
        [clusterRadius]="50">
      </mgl-geojson-source>

      <!-- Clusters -->
      <mgl-layer
        id="clusters"
        type="circle"
        source="points"
        [filter]="['has', 'point_count']"
        [paint]="{
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6', 10,
            '#f1f075', 30,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, 10,
            30, 30,
            40
          ]
        }"
        (layerClick)="onClusterClick($event)">
      </mgl-layer>

      <!-- Cluster count -->
      <mgl-layer
        id="cluster-count"
        type="symbol"
        source="points"
        [filter]="['has', 'point_count']"
        [layout]="{
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }">
      </mgl-layer>

      <!-- Unclustered points -->
      <mgl-layer
        id="unclustered-point"
        type="circle"
        source="points"
        [filter]="['!', ['has', 'point_count']]"
        [paint]="{
          'circle-color': '#11b4da',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }"
        (layerClick)="onPointClick($event)">
      </mgl-layer>
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClusteredMarkersComponent {
  map?: Map;
  center: [number, number] = [-87.622088, 13.783333];

  pointsGeoJSON = {
    type: 'FeatureCollection' as const,
    features: Array.from({ length: 100 }, (_, i) => ({
      type: 'Feature' as const,
      properties: {
        id: i,
        title: `Point ${i + 1}`
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [
          -87.622088 + (Math.random() - 0.5) * 0.2,
          13.783333 + (Math.random() - 0.5) * 0.2
        ]
      }
    }))
  };

  onMapLoad(map: Map) {
    this.map = map;
  }

  onClusterClick(event: any) {
    const features = this.map?.queryRenderedFeatures(event.point, {
      layers: ['clusters']
    });

    if (features && features.length > 0) {
      const clusterId = features[0].properties!['cluster_id'];
      const source = this.map?.getSource('points') as any;

      source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;

        this.map?.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom
        });
      });
    }
  }

  onPointClick(event: any) {
    if (event.features && event.features.length > 0) {
      const properties = event.features[0].properties;
      console.log('Clicked point:', properties.title);
    }
  }
}
```

---

## Map Interactions

### Click to Add Markers

```typescript
import { Component, signal } from '@angular/core';
import { MapMouseEvent } from 'mapbox-gl';

@Component({
  selector: 'app-click-markers',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center"
      (mapClick)="onMapClick($event)">

      @for (marker of markers(); track marker.id) {
        <mgl-marker [lngLat]="marker.coords">
          <div class="marker" (click)="removeMarker(marker.id)">
            {{ marker.index }}
          </div>
        </mgl-marker>
      }
    </mgl-map>

    <div class="instructions">
      <p>Click on the map to add markers</p>
      <p>Click on markers to remove them</p>
      <p>Total markers: {{ markers().length }}</p>
    </div>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .marker {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #3887be;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      cursor: pointer;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .marker:hover {
      background: #2a6a9a;
      transform: scale(1.1);
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
    .instructions p {
      margin: 4px 0;
      font-size: 14px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClickMarkersComponent {
  center: [number, number] = [-87.622088, 13.783333];
  markers = signal<Array<{ id: number; coords: [number, number]; index: number }>>([]);

  onMapClick(event: MapMouseEvent) {
    const coords: [number, number] = [event.lngLat.lng, event.lngLat.lat];
    const id = Date.now();
    const index = this.markers().length + 1;

    this.markers.update(markers => [...markers, { id, coords, index }]);
  }

  removeMarker(id: number) {
    this.markers.update(markers => markers.filter(m => m.id !== id));
  }
}
```

---

## Angular Integration

### Using with Reactive Forms

```typescript
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-map-form',
  imports: [NgxMapboxGLModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <form [formGroup]="locationForm" class="form-panel">
        <div class="form-group">
          <label>Latitude</label>
          <input type="number" formControlName="lat" step="0.000001" />
        </div>

        <div class="form-group">
          <label>Longitude</label>
          <input type="number" formControlName="lng" step="0.000001" />
        </div>

        <button type="button" (click)="updateMapCenter()">
          Update Map
        </button>
      </form>

      <mgl-map
        [style]="'mapbox://styles/mapbox/streets-v11'"
        [zoom]="[12]"
        [center]="mapCenter()"
        (mapClick)="onMapClick($event)">

        <mgl-marker [lngLat]="mapCenter()" [draggable]="true" (markerDragEnd)="onMarkerDrag($event)">
        </mgl-marker>
      </mgl-map>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      height: 600px;
      gap: 16px;
    }
    .form-panel {
      width: 250px;
      background: white;
      padding: 16px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
    }
    .form-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      width: 100%;
      padding: 10px;
      background: #3887be;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    mgl-map {
      flex: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapFormComponent {
  mapCenter = signal<[number, number]>([-87.622088, 13.783333]);

  locationForm = new FormGroup({
    lat: new FormControl(13.783333),
    lng: new FormControl(-87.622088)
  });

  updateMapCenter() {
    const lat = this.locationForm.value.lat!;
    const lng = this.locationForm.value.lng!;
    this.mapCenter.set([lng, lat]);
  }

  onMapClick(event: any) {
    this.locationForm.patchValue({
      lat: event.lngLat.lat,
      lng: event.lngLat.lng
    });
    this.mapCenter.set([event.lngLat.lng, event.lngLat.lat]);
  }

  onMarkerDrag(event: any) {
    const lngLat = event.marker.getLngLat();
    this.locationForm.patchValue({
      lat: lngLat.lat,
      lng: lngLat.lng
    });
  }
}
```

---

## Services

### Map State Service with Signals

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Map } from 'mapbox-gl';

export interface MapMarker {
  id: number;
  coords: [number, number];
  properties: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class MapStateService {
  private mapInstance?: Map;

  // State signals
  center = signal<[number, number]>([-87.622088, 13.783333]);
  zoom = signal<number>(12);
  markers = signal<MapMarker[]>([]);
  selectedMarkerId = signal<number | null>(null);

  // Computed values
  markerCount = computed(() => this.markers().length);
  selectedMarker = computed(() => {
    const id = this.selectedMarkerId();
    return id ? this.markers().find(m => m.id === id) : null;
  });

  setMap(map: Map) {
    this.mapInstance = map;
  }

  getMap(): Map | undefined {
    return this.mapInstance;
  }

  setCenter(coords: [number, number]) {
    this.center.set(coords);
  }

  setZoom(zoom: number) {
    this.zoom.set(zoom);
  }

  addMarker(coords: [number, number], properties: Record<string, any> = {}) {
    const marker: MapMarker = {
      id: Date.now(),
      coords,
      properties
    };
    this.markers.update(markers => [...markers, marker]);
    return marker;
  }

  removeMarker(id: number) {
    this.markers.update(markers => markers.filter(m => m.id !== id));
    if (this.selectedMarkerId() === id) {
      this.selectedMarkerId.set(null);
    }
  }

  selectMarker(id: number) {
    this.selectedMarkerId.set(id);
  }

  flyTo(coords: [number, number], zoom?: number) {
    this.mapInstance?.flyTo({
      center: coords,
      zoom: zoom || this.zoom(),
      duration: 2000
    });
  }

  fitBounds(coordinates: [number, number][], padding = 50) {
    if (this.mapInstance && coordinates.length > 0) {
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      this.mapInstance.fitBounds(bounds, { padding });
    }
  }
}
```

### Using the Service

```typescript
import { Component, inject, effect } from '@angular/core';
import { MapStateService } from './map-state.service';

@Component({
  selector: 'app-map-with-service',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[mapService.zoom()]"
      [center]="mapService.center()"
      (mapLoad)="onMapLoad($event)">

      @for (marker of mapService.markers(); track marker.id) {
        <mgl-marker
          [lngLat]="marker.coords"
          (click)="mapService.selectMarker(marker.id)">
          <div
            class="marker"
            [class.selected]="mapService.selectedMarkerId() === marker.id">
            {{ marker.properties['name'] }}
          </div>
        </mgl-marker>
      }
    </mgl-map>

    <div class="info">
      <p>Total markers: {{ mapService.markerCount() }}</p>
      @if (mapService.selectedMarker(); as selected) {
        <p>Selected: {{ selected.properties['name'] }}</p>
      }
    </div>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .marker {
      padding: 8px 12px;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid #3887be;
    }
    .marker.selected {
      background: #3887be;
      color: white;
    }
    .info {
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      padding: 12px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapWithServiceComponent {
  mapService = inject(MapStateService);

  constructor() {
    // React to marker selection
    effect(() => {
      const selected = this.mapService.selectedMarker();
      if (selected) {
        this.mapService.flyTo(selected.coords, 14);
      }
    });
  }

  onMapLoad(map: Map) {
    this.mapService.setMap(map);
  }
}
```
