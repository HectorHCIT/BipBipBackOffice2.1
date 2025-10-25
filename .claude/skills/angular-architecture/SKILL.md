---
name: Structuring Angular Projects
description: Folder structure and naming conventions for Angular projects. Use when creating new features, components, pages, services, or any file in the Angular project. Includes feature module structure with components/, pages/, services/, and models/ folders.
---

# Angular Project Architecture 📁

## Feature Module Structure

**ALWAYS** follow this folder structure pattern for feature modules:

```
src/app/features
├── {feature-name}/
│   ├── components/          # Reusable components specific to this feature
│   │   └── {component-name}/
│   │       ├── {component-name}.component.ts
│   │       ├── {component-name}.component.html
│   │       └── {component-name}.component.scss
│   ├── pages/               # Smart components (containers) that compose the feature
│   │   └── {page-name}/
│   │       ├── {page-name}.component.ts
│   │       ├── {page-name}.component.html
│   │       └── {page-name}.component.scss
│   ├── services/            # Business logic and API calls
│   │   └── {service-name}.service.ts
│   ├── models/              # Interfaces, types, and enums
│   │   └── {model-name}.model.ts
│   └── {feature-name}.routes.ts
```

### Folder Responsibilities

- **components/**: Presentational components, reusable UI elements specific to this feature. **Each component MUST be in its own folder** containing .ts, .html, and .scss files
- **pages/**: Container components that handle routing and orchestrate feature logic. **Each page MUST be in its own folder** containing .ts, .html, and .scss files
- **services/**: Injectable services for data fetching, state management, and business logic
- **models/**: TypeScript interfaces, types, enums, and constants

### File Naming Conventions

Follow these naming patterns strictly:

- **Components**: Inside `components/{component-name}/` folder
  - `{component-name}.component.ts`
  - `{component-name}.component.html`
  - `{component-name}.component.scss`
- **Pages**: Inside `pages/{page-name}/` folder
  - `{page-name}.component.ts` (NOT .page.ts)
  - `{page-name}.component.html`
  - `{page-name}.component.scss`
- **Services**: `{service-name}.service.ts`
- **Models**: `{model-name}.model.ts` or `{model-name}.interface.ts`

### Important Rules

- ✅ **ALWAYS** create a folder for each component/page
- ✅ **ALWAYS** include .ts, .html, and .scss files together in the same folder
- ❌ **NEVER** use `.page.ts` suffix - use `.component.ts` for both pages and components
- ✅ Pages in `pages/` folder are just components that handle routing

## Parent Module Pattern (Módulos Padre)

Para módulos grandes con múltiples submódulos relacionados, usa el patrón de **módulos padre** para mejor organización:

```
src/app/features/
├── {parent-module}/                    # Módulo padre (ej: maintenance, sac, drivers)
│   ├── {parent-module}.routes.ts      # Rutas consolidadas del módulo padre
│   ├── {sub-module-1}/                # Submódulo 1 (ej: brands)
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── models/
│   │   └── {sub-module-1}.routes.ts
│   ├── {sub-module-2}/                # Submódulo 2
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── models/
│   │   └── {sub-module-2}.routes.ts
│   └── ... más submódulos
```

### Ejemplo Real: Maintenance

```
src/app/features/maintenance/
├── maintenance.routes.ts              # Consolida todas las rutas de mantenimiento
├── brands/                            # Submódulo de marcas
│   ├── brands.routes.ts
│   ├── components/
│   │   └── brand-form/
│   ├── pages/
│   │   └── brands/
│   ├── services/
│   │   └── brand.service.ts
│   └── models/
│       └── brand.model.ts
├── app-configs/                       # Futuro submódulo
└── automatic-assignment/              # Futuro submódulo
```

### Archivo de Rutas del Módulo Padre

El archivo `{parent-module}.routes.ts` debe:

```typescript
import { Routes } from '@angular/router';

export const MAINTENANCE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'brands',  // Ruta por defecto
    pathMatch: 'full'
  },
  {
    path: 'brands',
    loadChildren: () => import('./brands/brands.routes').then(m => m.BRANDS_ROUTES),
    title: 'Gestión de Marcas'
  },
  {
    path: 'app-configuration',
    loadChildren: () => import('./app-configs/app-configs.routes').then(m => m.APP_CONFIGS_ROUTES),
    title: 'Configuración de App'
  }
  // ... más submódulos
];
```

### Integración en app.routes.ts

En lugar de registrar cada submódulo individualmente:

```typescript
// ❌ ANTES: Rutas individuales
{
  path: 'maintenance/brands',
  loadChildren: () => import('./features/brands/brands.routes').then(m => m.BRANDS_ROUTES)
},
{
  path: 'maintenance/app-configs',
  loadChildren: () => import('./features/app-configs/app-configs.routes').then(m => m.APP_CONFIGS_ROUTES)
}

// ✅ DESPUÉS: Ruta padre consolidada
{
  path: 'maintenance',
  loadChildren: () => import('./features/maintenance/maintenance.routes').then(m => m.MAINTENANCE_ROUTES)
}
```

### Beneficios del Patrón

- ✅ **Escalabilidad**: Fácil agregar nuevos submódulos relacionados
- ✅ **Organización**: Módulos relacionados agrupados lógicamente
- ✅ **Mantenibilidad**: Un solo archivo de rutas por módulo padre
- ✅ **App.routes.ts más limpio**: Menos rutas en el archivo principal
- ✅ **Patrón replicable**: Se puede aplicar a otros módulos padre (SAC, Drivers, etc.)

### Cuándo Usar Este Patrón

Usa módulos padre cuando:
- Tienes **3 o más submódulos relacionados**
- Los submódulos comparten un dominio común (ej: Mantenimiento, SAC)
- Quieres mantener app.routes.ts limpio y escalable

## Key Principles

- Keep the structure consistent across all features
- One feature should be self-contained within its folder
- Shared/common components go in `src/app/shared` or `src/app/core`
- Always use kebab-case for file and folder names
- Group related features under parent modules when you have 3+ related submódules
