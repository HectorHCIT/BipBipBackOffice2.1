---
name: mapbox-use-guide
description: Comprehensive guide for implementing Mapbox GL JS maps in Angular with ngx-mapbox-gl. Use when building interactive maps, adding markers/popups/controls, implementing geolocation, creating coverage zones with polygons, working with GeoJSON layers, geocoding/directions, or managing map state. Covers installation, components, common patterns, and advanced features for Angular standalone components with signals.
---

# Mapbox Angular Implementation Guide

## 📚 Overview

Complete skill for implementing Mapbox GL JS in Angular using the **ngx-mapbox-gl** library. This guide focuses on modern Angular patterns with standalone components, signals, and TypeScript best practices.

## ✅ When to Use This Skill

- 🗺️ Building interactive maps in Angular applications
- 📍 Adding markers, custom pins, and popups
- 🎯 Implementing geolocation and user tracking
- 🔷 Creating coverage zones with polygon layers
- 📊 Visualizing data with GeoJSON (heatmaps, clusters)
- 🔍 Implementing search with geocoding
- 🛣️ Adding directions and routing
- 🎨 Custom map controls and interactions
- 💾 Managing map state with services

## 🚀 Quick Start

### 1. Installation

```bash
npm install ngx-mapbox-gl mapbox-gl
npm install --save-dev @types/mapbox-gl
```

### 2. Configure angular.json

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

### 3. Environment Setup

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  mapboxToken: 'YOUR_MAPBOX_ACCESS_TOKEN'
};
```

### 4. Basic Map Component

```typescript
import { Component } from '@angular/core';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';

@Component({
  selector: 'app-map',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="mapStyle"
      [zoom]="[12]"
      [center]="center"
      (mapLoad)="onMapLoad($event)">
    </mgl-map>
  `,
  styles: [`
    mgl-map {
      height: 100vh;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent {
  mapStyle = 'mapbox://styles/mapbox/streets-v11';
  center: [number, number] = [-87.622088, 13.783333];

  onMapLoad(map: any) {
    console.log('Map loaded');
  }
}
```

## 🎯 Common Workflows

### Workflow 1: Display Map with Markers

1. Import `NgxMapboxGLModule` in your component
2. Add `<mgl-map>` with style and center
3. Add `<mgl-marker>` components inside the map
4. Optionally add `<mgl-popup>` inside markers

**See:** [Common Patterns - Markers](references/common-patterns.md#markers)

### Workflow 2: Create Coverage Zones

1. Prepare GeoJSON data with polygon coordinates
2. Add `<mgl-geojson-source>` with your data
3. Add fill layer for zone area
4. Add line layer for zone borders
5. Implement click/hover interactions

**See:** [Coverage Zones](references/coverage-zones.md)

### Workflow 3: Implement Search/Geocoding

1. Create search input with debounced input
2. Call Mapbox Geocoding API
3. Display results in dropdown
4. Fly to selected location with marker

**See:** [API Integration - Geocoding](references/api-integration.md#geocoding)

### Workflow 4: User Location Tracking

1. Add `<mgl-control mglGeolocate>` to map
2. Listen to `(geolocate)` event
3. Update center with user coordinates
4. Optionally add custom user marker

**See:** [Common Patterns - Geolocation](references/common-patterns.md#geolocation)

## 🧩 Core Components

### Map Styles

```typescript
const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v11',
  outdoors: 'mapbox://styles/mapbox/outdoors-v11',
  light: 'mapbox://styles/mapbox/light-v10',
  dark: 'mapbox://styles/mapbox/dark-v10',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v11'
};
```

### Available Components

| Component | Purpose | Details |
|-----------|---------|---------|
| `<mgl-map>` | Main map container | [API Reference](references/components-api.md#mgl-map) |
| `<mgl-marker>` | Add markers/pins | [API Reference](references/components-api.md#mgl-marker) |
| `<mgl-popup>` | Show popups/tooltips | [API Reference](references/components-api.md#mgl-popup) |
| `<mgl-control>` | Map controls | [API Reference](references/components-api.md#mgl-control) |
| `<mgl-layer>` | Data visualization layers | [API Reference](references/components-api.md#mgl-layer) |
| `<mgl-geojson-source>` | GeoJSON data source | [API Reference](references/components-api.md#mgl-geojson-source) |

**Full component documentation:** [Components API Reference](references/components-api.md)

## 📋 Common Use Cases

### Basic Markers

```typescript
<mgl-map [style]="mapStyle" [zoom]="[12]" [center]="center">
  <mgl-marker [lngLat]="[-87.622088, 13.783333]"></mgl-marker>
</mgl-map>
```

**More examples:** [Common Patterns - Markers](references/common-patterns.md#markers)

### Custom Markers with Icons

```typescript
<mgl-marker [lngLat]="coords" [draggable]="true">
  <div class="custom-marker">
    <img src="assets/icons/pin.svg" alt="marker" />
  </div>
</mgl-marker>
```

**More examples:** [Common Patterns - Custom Markers](references/common-patterns.md#custom-markers)

### Markers with Popups

```typescript
<mgl-marker [lngLat]="coords">
  <mgl-popup [closeOnClick]="false">
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </mgl-popup>
</mgl-marker>
```

**More examples:** [Common Patterns - Popups](references/common-patterns.md#popups)

### Map Controls

```typescript
<!-- Navigation (zoom + compass) -->
<mgl-control mglNavigation position="top-right"></mgl-control>

<!-- User location -->
<mgl-control
  mglGeolocate
  [trackUserLocation]="true"
  position="top-right">
</mgl-control>

<!-- Scale -->
<mgl-control mglScale unit="metric" position="bottom-left"></mgl-control>

<!-- Fullscreen -->
<mgl-control mglFullscreen position="top-right"></mgl-control>
```

**More examples:** [Common Patterns - Controls](references/common-patterns.md#controls)

### Polygon Layers (Coverage Zones)

```typescript
<mgl-geojson-source id="zones" [data]="zonesGeoJSON">
</mgl-geojson-source>

<mgl-layer
  id="zones-fill"
  type="fill"
  source="zones"
  [paint]="{
    'fill-color': ['get', 'color'],
    'fill-opacity': 0.4
  }">
</mgl-layer>

<mgl-layer
  id="zones-border"
  type="line"
  source="zones"
  [paint]="{
    'line-color': ['get', 'color'],
    'line-width': 2
  }">
</mgl-layer>
```

**Complete guide:** [Coverage Zones Patterns](references/coverage-zones.md)

## 🎨 Integration with Angular Patterns

### Using Signals for Map State

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-map',
  template: `
    <mgl-map
      [style]="mapStyle"
      [zoom]="zoom()"
      [center]="center()"
      (mapLoad)="onMapLoad($event)">

      @for (marker of markers(); track marker.id) {
        <mgl-marker [lngLat]="marker.coords">
          <div class="marker">{{ marker.name }}</div>
        </mgl-marker>
      }
    </mgl-map>
  `
})
export class MapComponent {
  mapStyle = 'mapbox://styles/mapbox/streets-v11';
  center = signal<[number, number]>([-87.622088, 13.783333]);
  zoom = signal<number[]>([12]);
  markers = signal<Marker[]>([]);

  // Computed values
  markerCount = computed(() => this.markers().length);

  addMarker(coords: [number, number], name: string) {
    this.markers.update(markers => [...markers, { id: Date.now(), coords, name }]);
  }

  removeMarker(id: number) {
    this.markers.update(markers => markers.filter(m => m.id !== id));
  }
}
```

**More patterns:** [Common Patterns - Angular Integration](references/common-patterns.md#angular-integration)

### Map State Service

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Map } from 'mapbox-gl';

@Injectable({ providedIn: 'root' })
export class MapService {
  private mapInstance?: Map;

  // Signals for state
  center = signal<[number, number]>([-87.622088, 13.783333]);
  zoom = signal<number>(12);
  markers = signal<MapMarker[]>([]);

  // Computed values
  markerCount = computed(() => this.markers().length);

  setMap(map: Map) {
    this.mapInstance = map;
  }

  flyTo(coords: [number, number], zoom?: number) {
    this.mapInstance?.flyTo({
      center: coords,
      zoom: zoom || this.zoom(),
      duration: 2000
    });
  }
}
```

**Complete service patterns:** [Common Patterns - Services](references/common-patterns.md#services)

## ⚡ Best Practices

### ✅ DO

- **Set explicit height** on `<mgl-map>` container
- **Use clustering** for datasets with > 100 markers
- **Use signals** for reactive state management
- **Implement debouncing** for search/geocoding
- **Use symbol layers** instead of HTML markers for better performance
- **Set map bounds** to limit navigation area
- **Preload images** used in layers
- **Clean up** map instance in component destroy

### ❌ DON'T

- **Don't forget** to add `mapbox-gl.css` to angular.json
- **Don't swap** coordinates (use `[lng, lat]` NOT `[lat, lng]`)
- **Don't use** HTML markers for large datasets (> 100 items)
- **Don't skip** error handling for geolocation
- **Don't forget** to set access token
- **Don't use** `any` type - import proper types from `mapbox-gl`

## 🔧 Troubleshooting

### Map Not Displaying

```typescript
// ❌ Missing height
<mgl-map></mgl-map>

// ✅ Set explicit height
mgl-map {
  height: 600px;
  width: 100%;
}
```

### Markers Not Showing

```typescript
// ❌ Wrong coordinate order
[lngLat]="[13.783333, -87.622088]"

// ✅ Correct order [lng, lat]
[lngLat]="[-87.622088, 13.783333]"
```

### Access Token Errors

```typescript
// Add to app.config.ts or main module
NgxMapboxGLModule.withConfig({
  accessToken: environment.mapboxToken
})
```

## 📖 Detailed Documentation

### Component API Reference
Complete documentation of all ngx-mapbox-gl components with properties, events, and methods:
- [Components API Reference](references/components-api.md)

### Common Patterns
Ready-to-use patterns for typical use cases:
- [Common Patterns](references/common-patterns.md)
  - Markers (basic, custom, draggable, multiple)
  - Popups (with markers, standalone, custom content)
  - Controls (navigation, geolocate, scale, fullscreen, custom)
  - Geolocation (tracking, manual)
  - GeoJSON Layers (lines, polygons, heatmaps)
  - Clustering
  - Map Interactions (click, hover)
  - Angular Integration (signals, services, forms)

### Coverage Zones
Patterns specific for coverage zone management:
- [Coverage Zones](references/coverage-zones.md)
  - Drawing polygons interactively
  - Editing existing zones
  - Displaying multiple zones with colors
  - Saving/loading from API
  - Validation and constraints

### API Integration
Integrating Mapbox APIs:
- [API Integration](references/api-integration.md)
  - Geocoding (search)
  - Reverse Geocoding (coords → address)
  - Directions (routing)
  - Optimization (multi-stop routes)

## 🔗 External Resources

- [ngx-mapbox-gl GitHub](https://github.com/Wykks/ngx-mapbox-gl)
- [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Mapbox Examples](https://docs.mapbox.com/mapbox-gl-js/example/)
- [Mapbox Styles](https://docs.mapbox.com/api/maps/styles/)

## 📦 Version Compatibility

- **Angular:** 17+ (standalone components with signals)
- **ngx-mapbox-gl:** 10.0.0+
- **mapbox-gl:** 2.0.0+
- **TypeScript:** 5.0+
