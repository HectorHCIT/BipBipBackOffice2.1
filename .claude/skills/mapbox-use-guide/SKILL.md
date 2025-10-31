# ngx-mapbox-gl Angular Skill

## Overview
Comprehensive skill for implementing Mapbox GL JS maps in Angular applications using the ngx-mapbox-gl library. This skill covers installation, configuration, map implementation, markers, controls, layers, and advanced features.

## When to Use This Skill
- Building interactive maps in Angular applications
- Adding custom markers, popups, and controls to maps
- Implementing geolocation features
- Creating dynamic map layers and styling
- Adding user interactions like drawing, measuring, and geocoding
- Working with GeoJSON data and visualizations

## Installation & Setup

### Step 1: Install Dependencies
```bash
npm install ngx-mapbox-gl mapbox-gl
npm install --save-dev @types/mapbox-gl
```

### Step 2: Configure angular.json
Add Mapbox GL CSS to your `angular.json`:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/mapbox-gl/dist/mapbox-gl.css",
              "src/styles.css"
            ]
          }
        }
      }
    }
  }
}
```

### Step 3: Module Configuration

#### Standalone Components (Recommended for Angular 14+)
```typescript
import { Component } from '@angular/core';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[9]"
      [center]="[-87.622088, 13.783333]">
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 100vh;
      width: 100%;
    }
  `]
})
export class AppComponent {}
```

#### Module-based Configuration
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgxMapboxGLModule.withConfig({
      accessToken: environment.mapboxToken
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### Step 4: Environment Configuration
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  mapboxToken: 'YOUR_MAPBOX_ACCESS_TOKEN'
};
```

## Basic Map Implementation

### Simple Map Component
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="mapStyle"
      [zoom]="zoom"
      [center]="center"
      (mapLoad)="onMapLoad($event)">
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
  `]
})
export class MapComponent {
  mapStyle = 'mapbox://styles/mapbox/streets-v11';
  zoom = [12];
  center: [number, number] = [-87.622088, 13.783333]; // [lng, lat]

  onMapLoad(map: any) {
    console.log('Map loaded:', map);
  }
}
```

### Available Map Styles
```typescript
// Common Mapbox styles
const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v11',
  outdoors: 'mapbox://styles/mapbox/outdoors-v11',
  light: 'mapbox://styles/mapbox/light-v10',
  dark: 'mapbox://styles/mapbox/dark-v10',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v11',
  navigation: 'mapbox://styles/mapbox/navigation-day-v1',
  navigationNight: 'mapbox://styles/mapbox/navigation-night-v1'
};
```

## Markers Implementation

### Basic Marker
```typescript
@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="[-87.622088, 13.783333]">
      
      <mgl-marker [lngLat]="[-87.622088, 13.783333]">
      </mgl-marker>
    </mgl-map>
  `
})
export class MarkerComponent {}
```

### Custom Marker with Icon
```typescript
@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">
      
      <mgl-marker 
        [lngLat]="markerCoords"
        [draggable]="true"
        (markerDragEnd)="onMarkerDragEnd($event)">
        <div class="custom-marker">
          <img src="assets/icons/custom-pin.svg" alt="marker" />
        </div>
      </mgl-marker>
    </mgl-map>
  `,
  styles: [`
    .custom-marker {
      width: 40px;
      height: 40px;
      cursor: pointer;
    }
    .custom-marker img {
      width: 100%;
      height: 100%;
    }
  `]
})
export class CustomMarkerComponent {
  center: [number, number] = [-87.622088, 13.783333];
  markerCoords: [number, number] = [-87.622088, 13.783333];

  onMarkerDragEnd(event: any) {
    const lngLat = event.marker.getLngLat();
    console.log('New position:', lngLat);
    this.markerCoords = [lngLat.lng, lngLat.lat];
  }
}
```

### Multiple Markers from Array
```typescript
@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[10]"
      [center]="center">
      
      <mgl-marker 
        *ngFor="let location of locations"
        [lngLat]="[location.lng, location.lat]">
        <div class="marker-content">
          <span>{{ location.name }}</span>
        </div>
      </mgl-marker>
    </mgl-map>
  `,
  styles: [`
    .marker-content {
      background: #3887be;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-weight: bold;
      white-space: nowrap;
    }
  `]
})
export class MultipleMarkersComponent {
  center: [number, number] = [-87.622088, 13.783333];
  
  locations = [
    { name: 'Location 1', lng: -87.622088, lat: 13.783333 },
    { name: 'Location 2', lng: -87.632088, lat: 13.793333 },
    { name: 'Location 3', lng: -87.612088, lat: 13.773333 }
  ];
}
```

## Popups

### Marker with Popup
```typescript
@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="[-87.622088, 13.783333]">
      
      <mgl-marker [lngLat]="[-87.622088, 13.783333]">
        <mgl-popup [closeOnClick]="false">
          <h3>{{ popupTitle }}</h3>
          <p>{{ popupDescription }}</p>
        </mgl-popup>
      </mgl-marker>
    </mgl-map>
  `
})
export class MarkerWithPopupComponent {
  popupTitle = 'San Marcos de Colón';
  popupDescription = 'Honduras';
}
```

### Standalone Popup
```typescript
@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">
      
      <mgl-popup
        [lngLat]="popupCoords"
        [closeButton]="true"
        [closeOnClick]="true"
        (popupClose)="onPopupClose()">
        <div class="popup-content">
          <h3>{{ selectedLocation.name }}</h3>
          <p>{{ selectedLocation.description }}</p>
          <button (click)="onLocationDetails()">Ver detalles</button>
        </div>
      </mgl-popup>
    </mgl-map>
  `,
  styles: [`
    .popup-content {
      min-width: 200px;
    }
    .popup-content h3 {
      margin-top: 0;
    }
    .popup-content button {
      margin-top: 10px;
      padding: 5px 10px;
    }
  `]
})
export class PopupComponent {
  center: [number, number] = [-87.622088, 13.783333];
  popupCoords: [number, number] = [-87.622088, 13.783333];
  
  selectedLocation = {
    name: 'Location Name',
    description: 'Location description'
  };

  onPopupClose() {
    console.log('Popup closed');
  }

  onLocationDetails() {
    console.log('Show location details');
  }
}
```

## Map Controls

### Navigation Controls
```typescript
@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="[-87.622088, 13.783333]">
      
      <!-- Navigation control (zoom buttons + compass) -->
      <mgl-control mglNavigation position="top-right"></mgl-control>
      
      <!-- Scale control -->
      <mgl-control mglScale unit="metric" position="bottom-left"></mgl-control>
      
      <!-- Fullscreen control -->
      <mgl-control mglFullscreen position="top-right"></mgl-control>
      
      <!-- Geolocate control -->
      <mgl-control 
        mglGeolocate
        [trackUserLocation]="true"
        [showUserLocation]="true"
        position="top-right">
      </mgl-control>
    </mgl-map>
  `
})
export class ControlsComponent {}
```

### Custom Control
```typescript
import { Component } from '@angular/core';
import { ControlComponent } from 'ngx-mapbox-gl';

@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">
      
      <mgl-control position="top-left">
        <div class="custom-control">
          <button (click)="resetView()">Reset View</button>
          <button (click)="toggleStyle()">Toggle Style</button>
        </div>
      </mgl-control>
    </mgl-map>
  `,
  styles: [`
    .custom-control {
      background: white;
      padding: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .custom-control button {
      display: block;
      margin: 5px 0;
      padding: 8px 12px;
      width: 100%;
    }
  `]
})
export class CustomControlComponent {
  center: [number, number] = [-87.622088, 13.783333];
  
  resetView() {
    // Logic to reset map view
  }
  
  toggleStyle() {
    // Logic to toggle map style
  }
}
```

## Geolocation

### User Location Tracking
```typescript
import { Component } from '@angular/core';
import { Map } from 'mapbox-gl';

@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="zoom"
      [center]="center"
      (mapLoad)="onMapLoad($event)">
      
      <mgl-control 
        mglGeolocate
        [trackUserLocation]="true"
        [showUserLocation]="true"
        [showAccuracyCircle]="true"
        (geolocate)="onGeolocate($event)"
        position="top-right">
      </mgl-control>
      
      <mgl-marker *ngIf="userLocation" [lngLat]="userLocation">
        <div class="user-marker">📍</div>
      </mgl-marker>
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 100vh;
      width: 100%;
    }
    .user-marker {
      font-size: 24px;
    }
  `]
})
export class GeolocationComponent {
  map?: Map;
  center: [number, number] = [-87.622088, 13.783333];
  zoom = [12];
  userLocation?: [number, number];

  onMapLoad(map: Map) {
    this.map = map;
  }

  onGeolocate(event: any) {
    const coords = event.coords;
    this.userLocation = [coords.longitude, coords.latitude];
    this.center = [coords.longitude, coords.latitude];
    console.log('User location:', this.userLocation);
    
    // Optionally fly to user location
    this.map?.flyTo({
      center: this.userLocation,
      zoom: 15
    });
  }
}
```

### Manual Geolocation
```typescript
import { Component } from '@angular/core';
import { Map } from 'mapbox-gl';

@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="zoom"
      [center]="center"
      (mapLoad)="onMapLoad($event)">
      
      <mgl-marker *ngIf="userLocation" [lngLat]="userLocation">
        <div class="pulse-marker"></div>
      </mgl-marker>
    </mgl-map>
    
    <button class="locate-btn" (click)="locateUser()">
      📍 Mi ubicación
    </button>
  `,
  styles: [`
    mgl-map {
      height: 100vh;
      width: 100%;
    }
    .locate-btn {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 1;
      padding: 10px 20px;
      background: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .pulse-marker {
      width: 20px;
      height: 20px;
      background: #4285f4;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
      }
    }
  `]
})
export class ManualGeolocationComponent {
  map?: Map;
  center: [number, number] = [-87.622088, 13.783333];
  zoom = [12];
  userLocation?: [number, number];

  onMapLoad(map: Map) {
    this.map = map;
  }

  locateUser() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = [
            position.coords.longitude,
            position.coords.latitude
          ];
          
          this.map?.flyTo({
            center: this.userLocation,
            zoom: 15,
            duration: 2000
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('No se pudo obtener la ubicación');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
    }
  }
}
```

## Layers and Sources

### GeoJSON Layer
```typescript
import { Component } from '@angular/core';
import { Map } from 'mapbox-gl';

@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[10]"
      [center]="center"
      (mapLoad)="onMapLoad($event)">
      
      <mgl-geojson-source
        id="route"
        [data]="routeData">
      </mgl-geojson-source>
      
      <mgl-layer
        id="route-layer"
        type="line"
        source="route"
        [paint]="{
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }">
      </mgl-layer>
      
      <mgl-layer
        id="route-arrows"
        type="symbol"
        source="route"
        [layout]="{
          'symbol-placement': 'line',
          'symbol-spacing': 50,
          'icon-image': 'arrow',
          'icon-size': 0.5
        }">
      </mgl-layer>
    </mgl-map>
  `
})
export class GeoJSONLayerComponent {
  map?: Map;
  center: [number, number] = [-87.622088, 13.783333];
  
  routeData = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [
        [-87.622088, 13.783333],
        [-87.632088, 13.793333],
        [-87.642088, 13.803333]
      ]
    }
  };

  onMapLoad(map: Map) {
    this.map = map;
  }
}
```

### Polygon Layer
```typescript
@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">
      
      <mgl-geojson-source
        id="delivery-zones"
        [data]="zonesData">
      </mgl-geojson-source>
      
      <mgl-layer
        id="zones-fill"
        type="fill"
        source="delivery-zones"
        [paint]="{
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.4
        }">
      </mgl-layer>
      
      <mgl-layer
        id="zones-outline"
        type="line"
        source="delivery-zones"
        [paint]="{
          'line-color': ['get', 'color'],
          'line-width': 2
        }">
      </mgl-layer>
    </mgl-map>
  `
})
export class PolygonLayerComponent {
  center: [number, number] = [-87.622088, 13.783333];
  
  zonesData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Zone 1',
          color: '#3887be'
        },
        geometry: {
          type: 'Polygon',
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
        type: 'Feature',
        properties: {
          name: 'Zone 2',
          color: '#e55e5e'
        },
        geometry: {
          type: 'Polygon',
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
}
```

### Heatmap Layer
```typescript
@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/dark-v10'"
      [zoom]="[10]"
      [center]="center">
      
      <mgl-geojson-source
        id="delivery-density"
        [data]="deliveryPoints">
      </mgl-geojson-source>
      
      <mgl-layer
        id="heatmap"
        type="heatmap"
        source="delivery-density"
        [paint]="{
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'count'],
            0, 0,
            6, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            15, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            15, 20
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            15, 0.5
          ]
        }">
      </mgl-layer>
    </mgl-map>
  `
})
export class HeatmapComponent {
  center: [number, number] = [-87.622088, 13.783333];
  
  deliveryPoints = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { count: 5 },
        geometry: {
          type: 'Point',
          coordinates: [-87.622088, 13.783333]
        }
      },
      // Add more delivery points...
    ]
  };
}
```

## Map Interactions

### Click Events
```typescript
import { Component } from '@angular/core';
import { MapMouseEvent } from 'mapbox-gl';

@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center"
      (mapClick)="onMapClick($event)">
      
      <mgl-marker 
        *ngFor="let marker of markers; let i = index"
        [lngLat]="marker">
        <div class="custom-marker" (click)="onMarkerClick(i)">
          {{ i + 1 }}
        </div>
      </mgl-marker>
    </mgl-map>
    
    <div class="info-panel" *ngIf="selectedMarker !== null">
      <h3>Marker {{ selectedMarker + 1 }}</h3>
      <p>Coordinates: {{ markers[selectedMarker] }}</p>
      <button (click)="removeMarker(selectedMarker)">Remove</button>
    </div>
  `,
  styles: [`
    .custom-marker {
      background: #3887be;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-weight: bold;
    }
    .info-panel {
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 1;
    }
  `]
})
export class MapInteractionsComponent {
  center: [number, number] = [-87.622088, 13.783333];
  markers: [number, number][] = [];
  selectedMarker: number | null = null;

  onMapClick(event: MapMouseEvent) {
    const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat];
    this.markers.push(lngLat);
    console.log('Added marker at:', lngLat);
  }

  onMarkerClick(index: number) {
    this.selectedMarker = index;
  }

  removeMarker(index: number) {
    this.markers.splice(index, 1);
    this.selectedMarker = null;
  }
}
```

### Hover Effects
```typescript
@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[10]"
      [center]="center"
      (mapLoad)="onMapLoad($event)">
      
      <mgl-geojson-source
        id="zones"
        [data]="zonesData">
      </mgl-geojson-source>
      
      <mgl-layer
        id="zones-layer"
        type="fill"
        source="zones"
        [paint]="{
          'fill-color': '#3887be',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.8,
            0.4
          ]
        }"
        (layerMouseEnter)="onZoneHover($event)"
        (layerMouseLeave)="onZoneLeave($event)">
      </mgl-layer>
    </mgl-map>
  `
})
export class HoverEffectsComponent {
  map?: any;
  center: [number, number] = [-87.622088, 13.783333];
  hoveredZoneId: string | null = null;
  
  zonesData = {
    type: 'FeatureCollection',
    features: [
      // Zone features...
    ]
  };

  onMapLoad(map: any) {
    this.map = map;
  }

  onZoneHover(event: any) {
    if (event.features.length > 0) {
      if (this.hoveredZoneId !== null) {
        this.map.setFeatureState(
          { source: 'zones', id: this.hoveredZoneId },
          { hover: false }
        );
      }
      this.hoveredZoneId = event.features[0].id;
      this.map.setFeatureState(
        { source: 'zones', id: this.hoveredZoneId },
        { hover: true }
      );
      this.map.getCanvas().style.cursor = 'pointer';
    }
  }

  onZoneLeave() {
    if (this.hoveredZoneId !== null) {
      this.map.setFeatureState(
        { source: 'zones', id: this.hoveredZoneId },
        { hover: false }
      );
    }
    this.hoveredZoneId = null;
    this.map.getCanvas().style.cursor = '';
  }
}
```

## Advanced Features

### Directions and Routing
```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Map } from 'mapbox-gl';

@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center"
      (mapLoad)="onMapLoad($event)"
      (mapClick)="onMapClick($event)">
      
      <mgl-geojson-source
        *ngIf="routeGeometry"
        id="route"
        [data]="routeGeometry">
      </mgl-geojson-source>
      
      <mgl-layer
        *ngIf="routeGeometry"
        id="route"
        type="line"
        source="route"
        [paint]="{
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }">
      </mgl-layer>
      
      <mgl-marker *ngIf="start" [lngLat]="start">
        <div class="route-marker start">A</div>
      </mgl-marker>
      
      <mgl-marker *ngIf="end" [lngLat]="end">
        <div class="route-marker end">B</div>
      </mgl-marker>
    </mgl-map>
    
    <div class="instructions" *ngIf="routeInstructions.length > 0">
      <h3>Directions</h3>
      <div *ngFor="let instruction of routeInstructions">
        {{ instruction }}
      </div>
    </div>
  `,
  styles: [`
    .route-marker {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    .route-marker.start {
      background: #3887be;
    }
    .route-marker.end {
      background: #e55e5e;
    }
    .instructions {
      position: absolute;
      top: 10px;
      left: 10px;
      background: white;
      padding: 15px;
      border-radius: 4px;
      max-width: 300px;
      max-height: 400px;
      overflow-y: auto;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  `]
})
export class DirectionsComponent {
  map?: Map;
  center: [number, number] = [-87.622088, 13.783333];
  start?: [number, number];
  end?: [number, number];
  routeGeometry?: any;
  routeInstructions: string[] = [];

  constructor(private http: HttpClient) {}

  onMapLoad(map: Map) {
    this.map = map;
  }

  onMapClick(event: any) {
    const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat];
    
    if (!this.start) {
      this.start = lngLat;
    } else if (!this.end) {
      this.end = lngLat;
      this.getRoute();
    } else {
      // Reset
      this.start = lngLat;
      this.end = undefined;
      this.routeGeometry = undefined;
      this.routeInstructions = [];
    }
  }

  getRoute() {
    if (!this.start || !this.end) return;

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${this.start[0]},${this.start[1]};${this.end[0]},${this.end[1]}?steps=true&geometries=geojson&access_token=YOUR_TOKEN`;

    this.http.get(url).subscribe((response: any) => {
      const route = response.routes[0];
      this.routeGeometry = {
        type: 'Feature',
        properties: {},
        geometry: route.geometry
      };
      
      this.routeInstructions = route.legs[0].steps.map((step: any) => 
        step.maneuver.instruction
      );

      // Fit bounds to route
      const bounds = new mapboxgl.LngLatBounds();
      route.geometry.coordinates.forEach((coord: [number, number]) => {
        bounds.extend(coord);
      });
      this.map?.fitBounds(bounds, { padding: 50 });
    });
  }
}
```

### Geocoding Integration
```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="zoom"
      [center]="center"
      (mapLoad)="onMapLoad($event)">
      
      <mgl-marker *ngIf="selectedLocation" [lngLat]="selectedLocation">
        <div class="search-marker">📍</div>
      </mgl-marker>
    </mgl-map>
    
    <div class="search-box">
      <input 
        type="text"
        placeholder="Search for a place..."
        (input)="onSearch($event)"
        [(ngModel)]="searchQuery" />
      
      <div class="results" *ngIf="searchResults.length > 0">
        <div 
          *ngFor="let result of searchResults"
          class="result-item"
          (click)="selectLocation(result)">
          <strong>{{ result.text }}</strong>
          <small>{{ result.place_name }}</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-box {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 1;
      width: 300px;
    }
    .search-box input {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .results {
      background: white;
      margin-top: 5px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      max-height: 300px;
      overflow-y: auto;
    }
    .result-item {
      padding: 10px;
      cursor: pointer;
      border-bottom: 1px solid #eee;
    }
    .result-item:hover {
      background: #f5f5f5;
    }
    .result-item strong {
      display: block;
    }
    .result-item small {
      color: #666;
    }
  `]
})
export class GeocodingComponent {
  map?: any;
  center: [number, number] = [-87.622088, 13.783333];
  zoom = [12];
  searchQuery = '';
  searchResults: any[] = [];
  selectedLocation?: [number, number];
  private searchSubject = new Subject<string>();

  constructor(private http: HttpClient) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.geocodeSearch(query))
    ).subscribe(results => {
      this.searchResults = results;
    });
  }

  onMapLoad(map: any) {
    this.map = map;
  }

  onSearch(event: any) {
    const query = event.target.value;
    if (query.length > 2) {
      this.searchSubject.next(query);
    } else {
      this.searchResults = [];
    }
  }

  geocodeSearch(query: string) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=YOUR_TOKEN&limit=5`;
    return this.http.get(url).pipe(
      map((response: any) => response.features)
    );
  }

  selectLocation(result: any) {
    this.selectedLocation = result.center;
    this.searchResults = [];
    this.searchQuery = result.place_name;
    
    this.map?.flyTo({
      center: this.selectedLocation,
      zoom: 14,
      duration: 2000
    });
  }
}
```

### Clustering
```typescript
@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[10]"
      [center]="center"
      (mapLoad)="onMapLoad($event)">
      
      <mgl-geojson-source
        id="deliveries"
        [data]="deliveriesData"
        [cluster]="true"
        [clusterMaxZoom]="14"
        [clusterRadius]="50">
      </mgl-geojson-source>
      
      <!-- Clusters -->
      <mgl-layer
        id="clusters"
        type="circle"
        source="deliveries"
        [filter]="['has', 'point_count']"
        [paint]="{
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            10, '#f1f075',
            30, '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10, 30,
            30, 40
          ]
        }"
        (layerClick)="onClusterClick($event)">
      </mgl-layer>
      
      <!-- Cluster count -->
      <mgl-layer
        id="cluster-count"
        type="symbol"
        source="deliveries"
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
        source="deliveries"
        [filter]="['!', ['has', 'point_count']]"
        [paint]="{
          'circle-color': '#11b4da',
          'circle-radius': 8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }"
        (layerClick)="onPointClick($event)">
      </mgl-layer>
    </mgl-map>
  `
})
export class ClusteringComponent {
  map?: any;
  center: [number, number] = [-87.622088, 13.783333];
  
  deliveriesData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: 1,
          status: 'completed'
        },
        geometry: {
          type: 'Point',
          coordinates: [-87.622088, 13.783333]
        }
      }
      // Add more delivery points...
    ]
  };

  onMapLoad(map: any) {
    this.map = map;
  }

  onClusterClick(event: any) {
    const features = this.map.queryRenderedFeatures(event.point, {
      layers: ['clusters']
    });
    
    const clusterId = features[0].properties.cluster_id;
    this.map.getSource('deliveries').getClusterExpansionZoom(
      clusterId,
      (err: any, zoom: number) => {
        if (err) return;
        
        this.map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      }
    );
  }

  onPointClick(event: any) {
    const coordinates = event.features[0].geometry.coordinates.slice();
    const properties = event.features[0].properties;
    
    console.log('Delivery details:', properties);
    // Show popup or details panel
  }
}
```

## Performance Optimization

### Best Practices
```typescript
@Component({
  template: `
    <mgl-map
      [style]="mapStyle"
      [zoom]="zoom"
      [center]="center"
      [preserveDrawingBuffer]="false"
      [fadeDuration]="300"
      [trackResize]="true"
      (mapLoad)="onMapLoad($event)">
      
      <!-- Use image sources for static markers -->
      <mgl-image 
        id="custom-marker"
        url="assets/markers/custom-pin.png">
      </mgl-image>
      
      <!-- Optimize large datasets with clustering -->
      <mgl-geojson-source
        id="large-dataset"
        [data]="data"
        [cluster]="true"
        [clusterMaxZoom]="14"
        [clusterRadius]="50"
        [buffer]="128"
        [tolerance]="0.375">
      </mgl-geojson-source>
    </mgl-map>
  `
})
export class OptimizedMapComponent {
  mapStyle = 'mapbox://styles/mapbox/streets-v11';
  zoom = [12];
  center: [number, number] = [-87.622088, 13.783333];
  data: any;

  onMapLoad(map: any) {
    // Preload images
    map.loadImage('assets/markers/pin.png', (error: any, image: any) => {
      if (error) throw error;
      map.addImage('custom-pin', image);
    });

    // Optimize rendering
    map.setMaxBounds([
      [-89, 13],  // Southwest coordinates
      [-85, 15]   // Northeast coordinates
    ]);
  }

  // Implement lazy loading for large datasets
  loadData() {
    // Load data in chunks or use pagination
  }
}
```

## Common Patterns

### Service for Map State Management
```typescript
// map.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Map, LngLatLike } from 'mapbox-gl';

export interface MapState {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
}

export interface MapMarker {
  id: string;
  lngLat: [number, number];
  properties: any;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map?: Map;
  private mapStateSubject = new BehaviorSubject<MapState>({
    center: [-87.622088, 13.783333],
    zoom: 12,
    markers: []
  });

  mapState$: Observable<MapState> = this.mapStateSubject.asObservable();

  setMap(map: Map) {
    this.map = map;
  }

  getMap(): Map | undefined {
    return this.map;
  }

  setCenter(center: [number, number]) {
    if (this.map) {
      this.map.flyTo({ center });
      this.updateState({ center });
    }
  }

  setZoom(zoom: number) {
    if (this.map) {
      this.map.setZoom(zoom);
      this.updateState({ zoom });
    }
  }

  addMarker(marker: MapMarker) {
    const currentState = this.mapStateSubject.value;
    this.updateState({
      markers: [...currentState.markers, marker]
    });
  }

  removeMarker(id: string) {
    const currentState = this.mapStateSubject.value;
    this.updateState({
      markers: currentState.markers.filter(m => m.id !== id)
    });
  }

  private updateState(partial: Partial<MapState>) {
    const currentState = this.mapStateSubject.value;
    this.mapStateSubject.next({ ...currentState, ...partial });
  }

  // Utility methods
  flyTo(center: LngLatLike, zoom?: number) {
    if (this.map) {
      this.map.flyTo({
        center,
        zoom: zoom || this.map.getZoom(),
        duration: 2000
      });
    }
  }

  fitBounds(coordinates: [number, number][]) {
    if (this.map && coordinates.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => bounds.extend(coord));
      this.map.fitBounds(bounds, { padding: 50 });
    }
  }
}
```

### Using the Service
```typescript
@Component({
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="(mapState$ | async)?.zoom || 12"
      [center]="(mapState$ | async)?.center || defaultCenter"
      (mapLoad)="onMapLoad($event)">
      
      <mgl-marker 
        *ngFor="let marker of (mapState$ | async)?.markers"
        [lngLat]="marker.lngLat">
        <div class="marker">{{ marker.id }}</div>
      </mgl-marker>
    </mgl-map>
  `
})
export class MapWithServiceComponent {
  defaultCenter: [number, number] = [-87.622088, 13.783333];
  mapState$ = this.mapService.mapState$;

  constructor(private mapService: MapService) {}

  onMapLoad(map: Map) {
    this.mapService.setMap(map);
  }
}
```

## Troubleshooting

### Common Issues and Solutions

1. **Map not displaying:**
```typescript
// Ensure CSS is loaded
// Check that mapbox-gl.css is in angular.json styles array
// Verify container has explicit height
mgl-map {
  height: 600px; // Must have explicit height
  width: 100%;
}
```

2. **Access token errors:**
```typescript
// Set token in module
NgxMapboxGLModule.withConfig({
  accessToken: 'your-token-here'
})

// Or set globally in index.html
<script>
  mapboxgl.accessToken = 'your-token-here';
</script>
```

3. **Markers not showing:**
```typescript
// Ensure coordinates are [lng, lat] not [lat, lng]
// Correct:
[lngLat]="[-87.622088, 13.783333]"
// Incorrect:
[lngLat]="[13.783333, -87.622088]"
```

4. **Performance with many markers:**
```typescript
// Use clustering for > 100 markers
// Or use symbol layer instead of HTML markers
<mgl-layer
  type="symbol"
  source="markers"
  [layout]="{
    'icon-image': 'custom-marker',
    'icon-size': 1
  }">
</mgl-layer>
```

## Testing

### Unit Testing Map Components
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgxMapboxGLModule.withConfig({
          accessToken: 'test-token'
        })
      ],
      declarations: [MapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default center', () => {
    expect(component.center).toEqual([-87.622088, 13.783333]);
  });

  it('should add marker on map click', () => {
    const mockEvent = {
      lngLat: { lng: -87.62, lat: 13.78 }
    };
    
    component.onMapClick(mockEvent as any);
    expect(component.markers.length).toBe(1);
  });
});
```

## References
- [ngx-mapbox-gl GitHub](https://github.com/Wykks/ngx-mapbox-gl)
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Mapbox Examples](https://docs.mapbox.com/mapbox-gl-js/example/)

## Version Compatibility
- Angular: 14+ (standalone components), 12+ (module-based)
- ngx-mapbox-gl: 10.0.0+
- mapbox-gl: 2.0.0+

## Best Practices Summary
1. Always set explicit height on map container
2. Use clustering for large datasets (>100 markers)
3. Implement proper error handling for geolocation
4. Debounce search/geocoding requests
5. Use symbol layers instead of HTML markers for better performance
6. Implement lazy loading for large GeoJSON datasets
7. Set appropriate map bounds to limit navigation
8. Use feature state for hover effects instead of re-rendering
9. Preload images used in layers
10. Clean up map instance in ngOnDestroy
