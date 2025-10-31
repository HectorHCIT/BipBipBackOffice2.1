# ngx-mapbox-gl Components API Reference

Complete reference for all ngx-mapbox-gl components with properties, events, and methods.

## 📖 Table of Contents

- [mgl-map](#mgl-map)
- [mgl-marker](#mgl-marker)
- [mgl-popup](#mgl-popup)
- [mgl-control](#mgl-control)
- [mgl-layer](#mgl-layer)
- [mgl-geojson-source](#mgl-geojson-source)
- [mgl-image](#mgl-image)

---

## mgl-map

Main map container component.

### Properties (Inputs)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `style` | `string \| Style` | Required | Map style URL or object |
| `center` | `[number, number]` | `[0, 0]` | Map center [lng, lat] |
| `zoom` | `[number]` | `[0]` | Initial zoom level |
| `bearing` | `[number]` | `[0]` | Initial bearing (rotation) |
| `pitch` | `[number]` | `[0]` | Initial pitch (tilt) |
| `minZoom` | `number` | `0` | Minimum zoom level |
| `maxZoom` | `number` | `22` | Maximum zoom level |
| `minPitch` | `number` | `0` | Minimum pitch |
| `maxPitch` | `number` | `60` | Maximum pitch |
| `scrollZoom` | `boolean` | `true` | Enable scroll to zoom |
| `dragRotate` | `boolean` | `true` | Enable drag to rotate |
| `dragPan` | `boolean` | `true` | Enable drag to pan |
| `keyboard` | `boolean` | `true` | Enable keyboard navigation |
| `doubleClickZoom` | `boolean` | `true` | Enable double click zoom |
| `touchZoomRotate` | `boolean` | `true` | Enable touch zoom/rotate |
| `trackResize` | `boolean` | `true` | Track container resize |
| `preserveDrawingBuffer` | `boolean` | `false` | Preserve drawing buffer |
| `fadeDuration` | `number` | `300` | Fade animation duration |
| `fitBounds` | `LngLatBoundsLike` | - | Fit map to bounds |
| `fitBoundsOptions` | `FitBoundsOptions` | - | Options for fitBounds |
| `maxBounds` | `LngLatBoundsLike` | - | Max bounds for map |
| `cursorStyle` | `string` | - | Custom cursor style |

### Events (Outputs)

| Event | Type | Description |
|-------|------|-------------|
| `mapLoad` | `Map` | Fired when map is loaded |
| `mapResize` | `Map` | Fired when map is resized |
| `mapRemove` | `Map` | Fired when map is removed |
| `mapClick` | `MapMouseEvent` | Fired on map click |
| `mapDblClick` | `MapMouseEvent` | Fired on double click |
| `mapMouseDown` | `MapMouseEvent` | Mouse down on map |
| `mapMouseUp` | `MapMouseEvent` | Mouse up on map |
| `mapMouseMove` | `MapMouseEvent` | Mouse move on map |
| `mapMouseEnter` | `MapMouseEvent` | Mouse enters map |
| `mapMouseLeave` | `MapMouseEvent` | Mouse leaves map |
| `mapMouseOver` | `MapMouseEvent` | Mouse over map |
| `mapMouseOut` | `MapMouseEvent` | Mouse out of map |
| `mapContextMenu` | `MapMouseEvent` | Right click on map |
| `mapTouchStart` | `MapTouchEvent` | Touch start |
| `mapTouchEnd` | `MapTouchEvent` | Touch end |
| `mapTouchMove` | `MapTouchEvent` | Touch move |
| `mapTouchCancel` | `MapTouchEvent` | Touch cancelled |
| `mapWheel` | `MapWheelEvent` | Mouse wheel event |
| `moveStart` | `Map` | Map starts moving |
| `move` | `Map` | Map is moving |
| `moveEnd` | `Map` | Map stops moving |
| `dragStart` | `Map` | Drag starts |
| `drag` | `Map` | Map is dragging |
| `dragEnd` | `Map` | Drag ends |
| `zoomStart` | `Map` | Zoom starts |
| `zoom` | `Map` | Map is zooming |
| `zoomEnd` | `Map` | Zoom ends |
| `rotateStart` | `Map` | Rotation starts |
| `rotate` | `Map` | Map is rotating |
| `rotateEnd` | `Map` | Rotation ends |
| `pitchStart` | `Map` | Pitch starts |
| `pitch` | `Map` | Map is pitching |
| `pitchEnd` | `Map` | Pitch ends |
| `boxZoomStart` | `Map` | Box zoom starts |
| `boxZoomEnd` | `Map` | Box zoom ends |

### Example

```typescript
<mgl-map
  [style]="'mapbox://styles/mapbox/streets-v11'"
  [zoom]="[12]"
  [center]="[-87.622088, 13.783333]"
  [minZoom]="8"
  [maxZoom]="16"
  [scrollZoom]="true"
  [dragPan]="true"
  (mapLoad)="onMapLoad($event)"
  (mapClick)="onMapClick($event)">
</mgl-map>
```

---

## mgl-marker

Adds a marker to the map.

### Properties (Inputs)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `lngLat` | `[number, number]` | Required | Marker position [lng, lat] |
| `offset` | `PointLike` | `[0, 0]` | Offset in pixels |
| `anchor` | `Anchor` | `'center'` | Anchor position |
| `color` | `string` | `'#3FB1CE'` | Marker color (default marker only) |
| `draggable` | `boolean` | `false` | Enable dragging |
| `rotation` | `number` | `0` | Rotation in degrees |
| `rotationAlignment` | `'map' \| 'viewport'` | `'auto'` | Rotation alignment |
| `pitchAlignment` | `'map' \| 'viewport'` | `'auto'` | Pitch alignment |

### Events (Outputs)

| Event | Type | Description |
|-------|------|-------------|
| `markerDragStart` | `Marker` | Marker drag starts |
| `markerDrag` | `Marker` | Marker is dragging |
| `markerDragEnd` | `Marker` | Marker drag ends |

### Anchor Values

- `'center'`, `'top'`, `'bottom'`, `'left'`, `'right'`
- `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`

### Example

```typescript
<!-- Default marker -->
<mgl-marker [lngLat]="[-87.622088, 13.783333]"></mgl-marker>

<!-- Custom marker with dragging -->
<mgl-marker
  [lngLat]="coords"
  [draggable]="true"
  [anchor]="'bottom'"
  (markerDragEnd)="onDragEnd($event)">
  <div class="custom-marker">
    <img src="assets/icons/pin.svg" />
  </div>
</mgl-marker>
```

---

## mgl-popup

Displays a popup on the map.

### Properties (Inputs)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `lngLat` | `[number, number]` | - | Popup position (standalone) |
| `closeButton` | `boolean` | `true` | Show close button |
| `closeOnClick` | `boolean` | `true` | Close on map click |
| `closeOnMove` | `boolean` | `false` | Close on map move |
| `anchor` | `Anchor` | - | Popup anchor position |
| `offset` | `number \| PointLike` | - | Offset in pixels |
| `className` | `string` | - | Custom CSS class |
| `maxWidth` | `string` | `'240px'` | Maximum width |

### Events (Outputs)

| Event | Type | Description |
|-------|------|-------------|
| `popupOpen` | `Popup` | Popup opened |
| `popupClose` | `Popup` | Popup closed |

### Example

```typescript
<!-- Popup with marker -->
<mgl-marker [lngLat]="coords">
  <mgl-popup [closeOnClick]="false">
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </mgl-popup>
</mgl-marker>

<!-- Standalone popup -->
<mgl-popup
  [lngLat]="[-87.622088, 13.783333]"
  [closeButton]="true"
  [maxWidth]="'300px'"
  (popupClose)="onClose()">
  <div class="popup-content">
    Content here
  </div>
</mgl-popup>
```

---

## mgl-control

Adds controls to the map.

### Built-in Controls

#### mglNavigation

Navigation control (zoom + compass).

```typescript
<mgl-control mglNavigation [position]="'top-right'"></mgl-control>
```

**Options:**
- `showCompass`: `boolean` (default: `true`)
- `showZoom`: `boolean` (default: `true`)
- `visualizePitch`: `boolean` (default: `false`)

#### mglGeolocate

Geolocation control.

```typescript
<mgl-control
  mglGeolocate
  [position]="'top-right'"
  [trackUserLocation]="true"
  [showUserLocation]="true"
  (geolocate)="onGeolocate($event)">
</mgl-control>
```

**Options:**
- `trackUserLocation`: `boolean` - Track user location
- `showUserLocation`: `boolean` - Show user marker
- `showAccuracyCircle`: `boolean` - Show accuracy circle
- `positionOptions`: `PositionOptions` - Geolocation options

**Events:**
- `geolocate`: Fired when location is obtained
- `error`: Fired on geolocation error

#### mglScale

Scale control.

```typescript
<mgl-control
  mglScale
  [position]="'bottom-left'"
  [unit]="'metric'">
</mgl-control>
```

**Options:**
- `unit`: `'imperial' | 'metric' | 'nautical'`
- `maxWidth`: `number` - Maximum width in pixels

#### mglFullscreen

Fullscreen control.

```typescript
<mgl-control mglFullscreen [position]="'top-right'"></mgl-control>
```

#### mglAttribution

Attribution control.

```typescript
<mgl-control mglAttribution [position]="'bottom-right'"></mgl-control>
```

**Options:**
- `compact`: `boolean` - Compact mode
- `customAttribution`: `string | string[]` - Custom attribution

### Custom Control

```typescript
<mgl-control [position]="'top-left'">
  <div class="custom-control">
    <button (click)="resetView()">Reset</button>
  </div>
</mgl-control>
```

### Position Values

- `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`

---

## mgl-layer

Adds a data visualization layer to the map.

### Properties (Inputs)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | Required | Unique layer ID |
| `type` | `LayerType` | Required | Layer type |
| `source` | `string` | - | Source ID |
| `sourceLayer` | `string` | - | Source layer (vector tiles) |
| `minzoom` | `number` | - | Minimum zoom |
| `maxzoom` | `number` | - | Maximum zoom |
| `filter` | `any[]` | - | Layer filter |
| `layout` | `Layout` | - | Layout properties |
| `paint` | `Paint` | - | Paint properties |
| `before` | `string` | - | Insert before layer ID |

### Layer Types

- `'fill'` - Filled polygons
- `'line'` - Line strings
- `'symbol'` - Icons and text
- `'circle'` - Circles
- `'heatmap'` - Heatmap
- `'fill-extrusion'` - 3D extrusions
- `'raster'` - Raster tiles
- `'hillshade'` - Hillshade
- `'background'` - Background

### Events (Outputs)

| Event | Type | Description |
|-------|------|-------------|
| `layerClick` | `MapLayerMouseEvent` | Layer clicked |
| `layerDblClick` | `MapLayerMouseEvent` | Layer double clicked |
| `layerMouseEnter` | `MapLayerMouseEvent` | Mouse enters layer |
| `layerMouseLeave` | `MapLayerMouseEvent` | Mouse leaves layer |
| `layerMouseMove` | `MapLayerMouseEvent` | Mouse moves on layer |

### Example

```typescript
<!-- Fill layer (polygon) -->
<mgl-layer
  id="zones-fill"
  type="fill"
  source="zones"
  [paint]="{
    'fill-color': '#3887be',
    'fill-opacity': 0.4
  }"
  (layerClick)="onZoneClick($event)">
</mgl-layer>

<!-- Line layer -->
<mgl-layer
  id="route-line"
  type="line"
  source="route"
  [paint]="{
    'line-color': '#3887be',
    'line-width': 5
  }">
</mgl-layer>

<!-- Circle layer -->
<mgl-layer
  id="points"
  type="circle"
  source="points"
  [paint]="{
    'circle-radius': 8,
    'circle-color': '#3887be'
  }">
</mgl-layer>

<!-- Symbol layer -->
<mgl-layer
  id="markers"
  type="symbol"
  source="markers"
  [layout]="{
    'icon-image': 'custom-marker',
    'icon-size': 1
  }">
</mgl-layer>

<!-- Heatmap layer -->
<mgl-layer
  id="heatmap"
  type="heatmap"
  source="data"
  [paint]="{
    'heatmap-weight': 1,
    'heatmap-intensity': 1,
    'heatmap-radius': 20
  }">
</mgl-layer>
```

---

## mgl-geojson-source

Adds a GeoJSON data source to the map.

### Properties (Inputs)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | Required | Unique source ID |
| `data` | `GeoJSON.Feature \| GeoJSON.FeatureCollection \| string` | Required | GeoJSON data or URL |
| `cluster` | `boolean` | `false` | Enable clustering |
| `clusterMaxZoom` | `number` | - | Max zoom for clustering |
| `clusterRadius` | `number` | `50` | Cluster radius in pixels |
| `clusterMinPoints` | `number` | - | Min points to form cluster |
| `clusterProperties` | `object` | - | Cluster property aggregations |
| `lineMetrics` | `boolean` | `false` | Calculate line distances |
| `tolerance` | `number` | `0.375` | Simplification tolerance |
| `buffer` | `number` | `128` | Tile buffer on each side |
| `maxzoom` | `number` | `18` | Maximum zoom level |
| `attribution` | `string` | - | Attribution string |

### Example

```typescript
<!-- Basic GeoJSON source -->
<mgl-geojson-source
  id="route"
  [data]="routeGeoJSON">
</mgl-geojson-source>

<!-- GeoJSON source with clustering -->
<mgl-geojson-source
  id="points"
  [data]="pointsGeoJSON"
  [cluster]="true"
  [clusterMaxZoom]="14"
  [clusterRadius]="50">
</mgl-geojson-source>

<!-- GeoJSON from URL -->
<mgl-geojson-source
  id="data"
  [data]="'https://api.example.com/data.geojson'">
</mgl-geojson-source>
```

### GeoJSON Data Format

```typescript
// Feature
const feature: GeoJSON.Feature = {
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
};

// FeatureCollection
const featureCollection: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [feature1, feature2, feature3]
};
```

---

## mgl-image

Loads an image into the map for use in layers.

### Properties (Inputs)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | Required | Unique image ID |
| `url` | `string` | - | Image URL |
| `data` | `HTMLImageElement \| ImageData` | - | Image data |
| `options` | `ImageOptions` | - | Image options |

### ImageOptions

- `pixelRatio`: `number` - Pixel ratio
- `sdf`: `boolean` - Signed distance field

### Example

```typescript
<!-- Load image from URL -->
<mgl-image
  id="custom-marker"
  [url]="'assets/markers/pin.png'">
</mgl-image>

<!-- Use in symbol layer -->
<mgl-layer
  id="markers"
  type="symbol"
  source="markers"
  [layout]="{
    'icon-image': 'custom-marker',
    'icon-size': 1
  }">
</mgl-layer>
```

---

## 🔗 Additional Resources

- [Mapbox GL JS API Documentation](https://docs.mapbox.com/mapbox-gl-js/api/)
- [ngx-mapbox-gl GitHub](https://github.com/Wykks/ngx-mapbox-gl)
- [Mapbox Style Specification](https://docs.mapbox.com/mapbox-gl-js/style-spec/)
