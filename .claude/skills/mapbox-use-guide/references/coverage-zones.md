# Coverage Zone Management Patterns

Specific patterns for managing coverage zones with polygons in Mapbox for Angular. Perfect for delivery zones, service areas, and geographic boundaries.

## 📖 Table of Contents

- [Display Coverage Zones](#display-coverage-zones)
- [Draw Polygons Interactively](#draw-polygons-interactively)
- [Edit Existing Zones](#edit-existing-zones)
- [Zone Interactions](#zone-interactions)
- [Integration with API](#integration-with-api)
- [Complete Example](#complete-example)

---

## Display Coverage Zones

### Basic Zone Display

```typescript
import { Component, signal } from '@angular/core';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';

interface CoverageZone {
  id: number;
  name: string;
  color: string;
  polygon: number[][][]; // GeoJSON polygon coordinates
  active: boolean;
}

@Component({
  selector: 'app-coverage-zones',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">

      <!-- GeoJSON source for all zones -->
      <mgl-geojson-source
        id="coverage-zones"
        [data]="zonesGeoJSON()">
      </mgl-geojson-source>

      <!-- Fill layer (zone area) -->
      <mgl-layer
        id="zones-fill"
        type="fill"
        source="coverage-zones"
        [paint]="{
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.3
        }"
        (layerClick)="onZoneClick($event)"
        (layerMouseEnter)="onZoneHover($event)"
        (layerMouseLeave)="onZoneLeave()">
      </mgl-layer>

      <!-- Border layer -->
      <mgl-layer
        id="zones-border"
        type="line"
        source="coverage-zones"
        [paint]="{
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-opacity': 0.8
        }">
      </mgl-layer>

      <!-- Zone labels -->
      <mgl-layer
        id="zones-labels"
        type="symbol"
        source="coverage-zones"
        [layout]="{
          'text-field': ['get', 'name'],
          'text-size': 14,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
        }"
        [paint]="{
          'text-color': '#333',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        }">
      </mgl-layer>
    </mgl-map>

    <!-- Zone legend -->
    <div class="legend">
      <h4>Coverage Zones</h4>
      @for (zone of zones(); track zone.id) {
        <div class="legend-item">
          <span class="color-box" [style.background-color]="zone.color"></span>
          <span class="zone-name">{{ zone.name }}</span>
          <span class="status" [class.active]="zone.active">
            {{ zone.active ? '✓' : '✗' }}
          </span>
        </div>
      }
    </div>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .legend {
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      min-width: 200px;
      z-index: 1;
    }
    .legend h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
    }
    .color-box {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 2px solid rgba(0,0,0,0.1);
    }
    .zone-name {
      flex: 1;
      font-size: 14px;
    }
    .status {
      font-size: 16px;
      color: #ccc;
    }
    .status.active {
      color: #4caf50;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoverageZonesComponent {
  center: [number, number] = [-87.622088, 13.783333];

  zones = signal<CoverageZone[]>([
    {
      id: 1,
      name: 'Zone Centro',
      color: '#3887be',
      active: true,
      polygon: [[
        [-87.630, 13.790],
        [-87.620, 13.790],
        [-87.620, 13.780],
        [-87.630, 13.780],
        [-87.630, 13.790]
      ]]
    },
    {
      id: 2,
      name: 'Zone Norte',
      color: '#4caf50',
      active: true,
      polygon: [[
        [-87.640, 13.800],
        [-87.630, 13.800],
        [-87.630, 13.790],
        [-87.640, 13.790],
        [-87.640, 13.800]
      ]]
    },
    {
      id: 3,
      name: 'Zone Sur',
      color: '#ff9800',
      active: false,
      polygon: [[
        [-87.630, 13.780],
        [-87.620, 13.780],
        [-87.620, 13.770],
        [-87.630, 13.770],
        [-87.630, 13.780]
      ]]
    }
  ]);

  // Convert zones to GeoJSON format
  zonesGeoJSON = computed(() => ({
    type: 'FeatureCollection' as const,
    features: this.zones().map(zone => ({
      type: 'Feature' as const,
      id: zone.id,
      properties: {
        name: zone.name,
        color: zone.color,
        active: zone.active
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: zone.polygon
      }
    }))
  }));

  onZoneClick(event: any) {
    if (event.features && event.features.length > 0) {
      const zoneName = event.features[0].properties.name;
      console.log('Clicked zone:', zoneName);
    }
  }

  onZoneHover(event: any) {
    if (event.target) {
      event.target.getCanvas().style.cursor = 'pointer';
    }
  }

  onZoneLeave() {
    // Reset cursor
  }
}
```

---

## Draw Polygons Interactively

### Drawing Tool Component

```typescript
import { Component, signal, computed } from '@angular/core';
import { Map } from 'mapbox-gl';

type DrawMode = 'view' | 'draw' | 'edit';

@Component({
  selector: 'app-zone-drawer',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center"
      (mapLoad)="onMapLoad($event)"
      (mapClick)="onMapClick($event)">

      <!-- Existing zones -->
      @if (existingZonesGeoJSON()) {
        <mgl-geojson-source
          id="existing-zones"
          [data]="existingZonesGeoJSON()">
        </mgl-geojson-source>

        <mgl-layer
          id="existing-zones-fill"
          type="fill"
          source="existing-zones"
          [paint]="{
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.3
          }">
        </mgl-layer>

        <mgl-layer
          id="existing-zones-border"
          type="line"
          source="existing-zones"
          [paint]="{
            'line-color': ['get', 'color'],
            'line-width': 2
          }">
        </mgl-layer>
      }

      <!-- Drawing points -->
      @for (point of drawingPoints(); track $index) {
        <mgl-marker [lngLat]="point">
          <div class="draw-point" (click)="removePoint($index)">
            {{ $index + 1 }}
          </div>
        </mgl-marker>
      }

      <!-- Current drawing polygon -->
      @if (currentPolygonGeoJSON()) {
        <mgl-geojson-source
          id="current-polygon"
          [data]="currentPolygonGeoJSON()">
        </mgl-geojson-source>

        <mgl-layer
          id="current-polygon-fill"
          type="fill"
          source="current-polygon"
          [paint]="{
            'fill-color': currentZoneColor(),
            'fill-opacity': 0.4
          }">
        </mgl-layer>

        <mgl-layer
          id="current-polygon-border"
          type="line"
          source="current-polygon"
          [paint]="{
            'line-color': currentZoneColor(),
            'line-width': 3,
            'line-dasharray': [2, 2]
          }">
        </mgl-layer>
      }
    </mgl-map>

    <!-- Drawing controls -->
    <div class="controls">
      <h4>Zone Drawing</h4>

      <div class="mode-buttons">
        <button
          [class.active]="mode() === 'view'"
          (click)="setMode('view')">
          View
        </button>
        <button
          [class.active]="mode() === 'draw'"
          (click)="setMode('draw')">
          Draw
        </button>
      </div>

      @if (mode() === 'draw') {
        <div class="draw-controls">
          <p class="hint">Click on map to add points</p>
          <p class="hint">Click first point to close</p>

          <div class="form-group">
            <label>Zone Name</label>
            <input
              type="text"
              [(ngModel)]="zoneName"
              placeholder="Enter zone name" />
          </div>

          <div class="form-group">
            <label>Zone Color</label>
            <input
              type="color"
              [value]="currentZoneColor()"
              (input)="setZoneColor($event)" />
          </div>

          <p>Points: {{ drawingPoints().length }}</p>

          <div class="action-buttons">
            <button
              class="btn-primary"
              [disabled]="drawingPoints().length < 3"
              (click)="finishDrawing()">
              Finish Zone
            </button>
            <button
              class="btn-secondary"
              (click)="cancelDrawing()">
              Cancel
            </button>
          </div>
        </div>
      }

      <!-- Saved zones list -->
      <div class="zones-list">
        <h5>Saved Zones ({{ savedZones().length }})</h5>
        @for (zone of savedZones(); track zone.id) {
          <div class="zone-item">
            <span class="zone-color" [style.background-color]="zone.color"></span>
            <span class="zone-name">{{ zone.name }}</span>
            <button class="btn-delete" (click)="deleteZone(zone.id)">×</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .draw-point {
      width: 24px;
      height: 24px;
      background: #fff;
      border: 3px solid #3887be;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: #3887be;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .draw-point:hover {
      background: #ffe0e0;
      border-color: #f44336;
      color: #f44336;
    }
    .controls {
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      width: 280px;
      max-height: 580px;
      overflow-y: auto;
      z-index: 1;
    }
    .controls h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }
    .mode-buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .mode-buttons button {
      flex: 1;
      padding: 8px;
      border: 2px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    .mode-buttons button.active {
      background: #3887be;
      color: white;
      border-color: #3887be;
    }
    .draw-controls {
      border-top: 1px solid #eee;
      padding-top: 12px;
    }
    .hint {
      font-size: 13px;
      color: #666;
      margin: 4px 0;
    }
    .form-group {
      margin: 12px 0;
    }
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-size: 13px;
      font-weight: 500;
    }
    .form-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    .btn-primary, .btn-secondary {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-primary {
      background: #4caf50;
      color: white;
    }
    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: #f0f0f0;
      color: #333;
    }
    .zones-list {
      border-top: 1px solid #eee;
      padding-top: 12px;
      margin-top: 16px;
    }
    .zones-list h5 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
    }
    .zone-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border: 1px solid #eee;
      border-radius: 4px;
      margin-bottom: 6px;
    }
    .zone-color {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      border: 1px solid rgba(0,0,0,0.1);
    }
    .zone-name {
      flex: 1;
      font-size: 13px;
    }
    .btn-delete {
      width: 24px;
      height: 24px;
      border: none;
      background: #f44336;
      color: white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoneDrawerComponent {
  map?: Map;
  center: [number, number] = [-87.622088, 13.783333];

  // State
  mode = signal<DrawMode>('view');
  drawingPoints = signal<[number, number][]>([]);
  currentZoneColor = signal('#3887be');
  zoneName = '';
  savedZones = signal<CoverageZone[]>([]);

  // Computed
  currentPolygonGeoJSON = computed(() => {
    const points = this.drawingPoints();
    if (points.length < 3) return null;

    // Close the polygon by adding first point at the end
    const coordinates = [...points, points[0]];

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coordinates]
      }
    };
  });

  existingZonesGeoJSON = computed(() => {
    const zones = this.savedZones();
    if (zones.length === 0) return null;

    return {
      type: 'FeatureCollection' as const,
      features: zones.map(zone => ({
        type: 'Feature' as const,
        id: zone.id,
        properties: {
          name: zone.name,
          color: zone.color
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: zone.polygon
        }
      }))
    };
  });

  onMapLoad(map: Map) {
    this.map = map;
  }

  setMode(mode: DrawMode) {
    this.mode.set(mode);
    if (mode !== 'draw') {
      this.cancelDrawing();
    }
  }

  onMapClick(event: any) {
    if (this.mode() !== 'draw') return;

    const point: [number, number] = [event.lngLat.lng, event.lngLat.lat];
    const points = this.drawingPoints();

    // Check if clicking near first point to close polygon
    if (points.length >= 3) {
      const firstPoint = points[0];
      const distance = this.calculateDistance(point, firstPoint);

      if (distance < 0.001) { // Close threshold
        this.finishDrawing();
        return;
      }
    }

    // Add new point
    this.drawingPoints.update(pts => [...pts, point]);
  }

  removePoint(index: number) {
    this.drawingPoints.update(pts => pts.filter((_, i) => i !== index));
  }

  setZoneColor(event: any) {
    this.currentZoneColor.set(event.target.value);
  }

  finishDrawing() {
    const points = this.drawingPoints();
    if (points.length < 3) {
      alert('Need at least 3 points to create a zone');
      return;
    }

    if (!this.zoneName.trim()) {
      alert('Please enter a zone name');
      return;
    }

    // Close the polygon
    const closedPolygon = [...points, points[0]];

    const newZone: CoverageZone = {
      id: Date.now(),
      name: this.zoneName,
      color: this.currentZoneColor(),
      polygon: [closedPolygon],
      active: true
    };

    this.savedZones.update(zones => [...zones, newZone]);

    // Reset
    this.cancelDrawing();
    this.setMode('view');
  }

  cancelDrawing() {
    this.drawingPoints.set([]);
    this.zoneName = '';
    this.currentZoneColor.set('#3887be');
  }

  deleteZone(id: number) {
    this.savedZones.update(zones => zones.filter(z => z.id !== id));
  }

  private calculateDistance(point1: [number, number], point2: [number, number]): number {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }
}
```

---

## Edit Existing Zones

### Editable Vertices

```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-zone-editor',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center">

      <!-- Zone polygon -->
      @if (zoneGeoJSON()) {
        <mgl-geojson-source
          id="edit-zone"
          [data]="zoneGeoJSON()">
        </mgl-geojson-source>

        <mgl-layer
          id="edit-zone-fill"
          type="fill"
          source="edit-zone"
          [paint]="{
            'fill-color': '#3887be',
            'fill-opacity': 0.3
          }">
        </mgl-layer>

        <mgl-layer
          id="edit-zone-border"
          type="line"
          source="edit-zone"
          [paint]="{
            'line-color': '#3887be',
            'line-width': 2
          }">
        </mgl-layer>
      }

      <!-- Draggable vertices -->
      @for (vertex of vertices(); track $index) {
        <mgl-marker
          [lngLat]="vertex"
          [draggable]="true"
          (markerDragEnd)="onVertexDrag($index, $event)">
          <div class="vertex">{{ $index + 1 }}</div>
        </mgl-marker>
      }
    </mgl-map>

    <div class="controls">
      <h4>Edit Zone</h4>
      <button class="btn-primary" (click)="saveChanges()">Save</button>
      <button class="btn-secondary" (click)="cancelEdit()">Cancel</button>
    </div>
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .vertex {
      width: 20px;
      height: 20px;
      background: white;
      border: 3px solid #3887be;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      color: #3887be;
      cursor: move;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .controls {
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoneEditorComponent {
  center: [number, number] = [-87.622088, 13.783333];

  vertices = signal<[number, number][]>([
    [-87.630, 13.790],
    [-87.620, 13.790],
    [-87.620, 13.780],
    [-87.630, 13.780]
  ]);

  zoneGeoJSON = computed(() => {
    const verts = this.vertices();
    if (verts.length < 3) return null;

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[...verts, verts[0]]]
      }
    };
  });

  onVertexDrag(index: number, event: any) {
    const lngLat = event.marker.getLngLat();
    this.vertices.update(verts => {
      const newVerts = [...verts];
      newVerts[index] = [lngLat.lng, lngLat.lat];
      return newVerts;
    });
  }

  saveChanges() {
    console.log('Saving zone:', this.vertices());
    // Save to API
  }

  cancelEdit() {
    console.log('Cancelling edit');
  }
}
```

---

## Zone Interactions

### Hover and Click Effects

```typescript
import { Component, signal } from '@angular/core';
import { Map } from 'mapbox-gl';

@Component({
  selector: 'app-zone-interactions',
  imports: [NgxMapboxGLModule],
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/streets-v11'"
      [zoom]="[12]"
      [center]="center"
      (mapLoad)="onMapLoad($event)">

      <mgl-geojson-source
        id="zones"
        [data]="zonesGeoJSON()">
      </mgl-geojson-source>

      <!-- Fill with hover effect -->
      <mgl-layer
        id="zones-fill"
        type="fill"
        source="zones"
        [paint]="{
          'fill-color': ['get', 'color'],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.6,
            0.3
          ]
        }"
        (layerClick)="onZoneClick($event)"
        (layerMouseEnter)="onZoneHover($event)"
        (layerMouseLeave)="onZoneLeave()">
      </mgl-layer>

      <mgl-layer
        id="zones-border"
        type="line"
        source="zones"
        [paint]="{
          'line-color': ['get', 'color'],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            4,
            2
          ]
        }">
      </mgl-layer>
    </mgl-map>

    @if (selectedZone()) {
      <div class="zone-info">
        <h4>{{ selectedZone()!.name }}</h4>
        <p>Status: {{ selectedZone()!.active ? 'Active' : 'Inactive' }}</p>
        <button (click)="toggleZoneStatus()">
          {{ selectedZone()!.active ? 'Deactivate' : 'Activate' }}
        </button>
      </div>
    }
  `,
  styles: [`
    mgl-map {
      height: 600px;
      width: 100%;
    }
    .zone-info {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      min-width: 200px;
      z-index: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoneInteractionsComponent {
  map?: Map;
  center: [number, number] = [-87.622088, 13.783333];
  hoveredZoneId: number | null = null;
  selectedZone = signal<CoverageZone | null>(null);

  zones = signal<CoverageZone[]>([
    // ... zones data
  ]);

  zonesGeoJSON = computed(() => ({
    type: 'FeatureCollection' as const,
    features: this.zones().map(zone => ({
      type: 'Feature' as const,
      id: zone.id,
      properties: {
        name: zone.name,
        color: zone.color,
        active: zone.active
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: zone.polygon
      }
    }))
  }));

  onMapLoad(map: Map) {
    this.map = map;
  }

  onZoneHover(event: any) {
    if (event.features && event.features.length > 0) {
      const zoneId = event.features[0].id;

      // Remove previous hover state
      if (this.hoveredZoneId !== null) {
        this.map?.setFeatureState(
          { source: 'zones', id: this.hoveredZoneId },
          { hover: false }
        );
      }

      // Set new hover state
      this.hoveredZoneId = zoneId;
      this.map?.setFeatureState(
        { source: 'zones', id: zoneId },
        { hover: true }
      );

      // Change cursor
      if (this.map) {
        this.map.getCanvas().style.cursor = 'pointer';
      }
    }
  }

  onZoneLeave() {
    if (this.hoveredZoneId !== null) {
      this.map?.setFeatureState(
        { source: 'zones', id: this.hoveredZoneId },
        { hover: false }
      );
    }
    this.hoveredZoneId = null;

    if (this.map) {
      this.map.getCanvas().style.cursor = '';
    }
  }

  onZoneClick(event: any) {
    if (event.features && event.features.length > 0) {
      const zoneId = event.features[0].id;
      const zone = this.zones().find(z => z.id === zoneId);
      this.selectedZone.set(zone || null);
    }
  }

  toggleZoneStatus() {
    const zone = this.selectedZone();
    if (zone) {
      this.zones.update(zones =>
        zones.map(z =>
          z.id === zone.id ? { ...z, active: !z.active } : z
        )
      );
      this.selectedZone.update(z => z ? { ...z, active: !z.active } : null);
    }
  }
}
```

---

## Integration with API

### Service for Zone Management

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CoverageZoneDTO {
  id: number;
  companyId: number;
  name: string;
  color: string;
  polygon: { coordinates: number[][][] };
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class CoverageZoneService {
  private http = inject(HttpClient);
  private apiUrl = '/api/coverage-zones';

  zones = signal<CoverageZone[]>([]);
  selectedZoneId = signal<number | null>(null);

  loadZones(companyId: number): Observable<CoverageZoneDTO[]> {
    return this.http.get<CoverageZoneDTO[]>(`${this.apiUrl}?companyId=${companyId}`);
  }

  createZone(zone: Partial<CoverageZone>): Observable<CoverageZoneDTO> {
    return this.http.post<CoverageZoneDTO>(this.apiUrl, this.toDTO(zone));
  }

  updateZone(id: number, zone: Partial<CoverageZone>): Observable<CoverageZoneDTO> {
    return this.http.put<CoverageZoneDTO>(`${this.apiUrl}/${id}`, this.toDTO(zone));
  }

  deleteZone(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private toDTO(zone: Partial<CoverageZone>): Partial<CoverageZoneDTO> {
    return {
      name: zone.name,
      color: zone.color,
      polygon: zone.polygon ? { coordinates: zone.polygon } : undefined,
      active: zone.active
    };
  }

  fromDTO(dto: CoverageZoneDTO): CoverageZone {
    return {
      id: dto.id,
      name: dto.name,
      color: dto.color,
      polygon: dto.polygon.coordinates,
      active: dto.active
    };
  }
}
```

### Component with API Integration

```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { CoverageZoneService } from './coverage-zone.service';
import { CompanyContextService } from '@/core/services/company-context.service';

@Component({
  selector: 'app-zones-manager',
  imports: [NgxMapboxGLModule],
  template: `
    @if (loading()) {
      <div class="loading">Loading zones...</div>
    } @else {
      <mgl-map
        [style]="'mapbox://styles/mapbox/streets-v11'"
        [zoom]="[12]"
        [center]="center">

        <mgl-geojson-source
          id="zones"
          [data]="zonesGeoJSON()">
        </mgl-geojson-source>

        <mgl-layer
          id="zones-fill"
          type="fill"
          source="zones"
          [paint]="{
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.3
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
      </mgl-map>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZonesManagerComponent implements OnInit {
  private zoneService = inject(CoverageZoneService);
  private companyContext = inject(CompanyContextService);

  center: [number, number] = [-87.622088, 13.783333];
  loading = signal(true);

  zonesGeoJSON = computed(() => ({
    type: 'FeatureCollection' as const,
    features: this.zoneService.zones().map(zone => ({
      type: 'Feature' as const,
      id: zone.id,
      properties: {
        name: zone.name,
        color: zone.color,
        active: zone.active
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: zone.polygon
      }
    }))
  }));

  ngOnInit() {
    this.loadZones();
  }

  loadZones() {
    const companyId = this.companyContext.selectedCompanyId();
    if (!companyId) return;

    this.loading.set(true);
    this.zoneService.loadZones(companyId).subscribe({
      next: (zones) => {
        this.zoneService.zones.set(zones.map(z => this.zoneService.fromDTO(z)));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading zones:', error);
        this.loading.set(false);
      }
    });
  }

  saveZone(zone: CoverageZone) {
    if (zone.id) {
      this.zoneService.updateZone(zone.id, zone).subscribe({
        next: () => this.loadZones(),
        error: (error) => console.error('Error updating zone:', error)
      });
    } else {
      this.zoneService.createZone(zone).subscribe({
        next: () => this.loadZones(),
        error: (error) => console.error('Error creating zone:', error)
      });
    }
  }
}
```

---

## Complete Example

### Full-Featured Zone Manager

Complete example combining all patterns with drawing, editing, saving, and API integration.

```typescript
import { Component, inject, computed, signal, effect } from '@angular/core';
import { CoverageZoneService } from './coverage-zone.service';
import { CompanyContextService } from '@/core/services/company-context.service';

type Mode = 'view' | 'draw' | 'edit';

@Component({
  selector: 'app-complete-zone-manager',
  imports: [NgxMapboxGLModule, ReactiveFormsModule],
  template: `
    <!-- Full implementation combining all features -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompleteZoneManagerComponent {
  // Inject services
  private zoneService = inject(CoverageZoneService);
  private companyContext = inject(CompanyContextService);

  // State management
  mode = signal<Mode>('view');
  selectedZone = signal<CoverageZone | null>(null);
  drawingPoints = signal<[number, number][]>([]);

  // Effects for company changes
  constructor() {
    effect(() => {
      const companyId = this.companyContext.selectedCompanyId();
      if (companyId) {
        this.loadZones(companyId);
      }
    });
  }

  // ... implementation
}
```

---

## 🔗 Additional Resources

- [GeoJSON Specification](https://geojson.org/)
- [Mapbox Drawing Tools](https://github.com/mapbox/mapbox-gl-draw)
- [Turf.js](https://turfjs.org/) - Geospatial analysis library
