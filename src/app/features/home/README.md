# Home Module

Este módulo contiene la página principal de inicio con el dashboard integrado.

## Estructura

```
home/
├── components/           # Componentes reutilizables
│   ├── brand-card/      # Tarjeta de marca
│   └── dashboard-overview/  # Dashboard con KPIs y gráficos
├── pages/               # Páginas del módulo
│   └── home/           # Página de inicio (incluye dashboard)
├── services/           # Servicios del módulo
│   ├── home.service.ts
│   └── dashboard.service.ts
├── models/             # Modelos de datos
│   └── dashboard.model.ts
└── home.routes.ts      # Configuración de rutas
```

## Rutas

- `/home` - Página de inicio con dashboard integrado

## Dashboard Overview

El dashboard incluye:

### Filtros
- **Ciudad**: Select para filtrar por ciudad
- **Rango de fechas**: DatePicker para seleccionar período

### KPIs (3 tarjetas)
- Total de Órdenes
- Total de Órdenes Entregadas
- Total de Órdenes en Proceso

### Visualizaciones
- **Tabla**: Órdenes por Método de Pago (Efectivo, Tarjeta, Puntos Bips, Pendiente)
- **Gráfico Donut**: Órdenes por Canal (Domicilio, *5000, Para llevar, Restaurante)

## Componentes Utilizados

- **PrimeNG**:
  - `Select` - Filtro de ciudad
  - `DatePicker` - Filtro de fechas
  - `Card` - Contenedores de KPIs y visualizaciones
  - `Table` - Tabla de métodos de pago
  - `Chart` - Gráfico donut (usa Chart.js)
  - `Button` - Acciones

## Servicios

### DashboardService

```typescript
getDashboardData(): Observable<DashboardData>
```

Obtiene los datos del dashboard. Actualmente retorna datos mock, pero está preparado para conectarse al backend.

### Conectar con Backend

Para conectar con el backend real, actualizar el servicio:

```typescript
getDashboardData(filters?: DashboardFilters): Observable<DashboardData> {
  return this.http.get<DashboardData>(`${environment.apiURL}dashboard`, {
    params: this.buildParams(filters)
  });
}
```

## Modelos

### DashboardData
Estructura principal que contiene todos los datos del dashboard.

### DashboardKPI
Interface para los indicadores clave de rendimiento.

### OrdersByPaymentMethod
Datos de órdenes agrupadas por método de pago.

### OrdersByChannel
Datos de órdenes agrupadas por canal de venta.

### DashboardFilters
Filtros aplicables al dashboard (ciudad, fechas).
