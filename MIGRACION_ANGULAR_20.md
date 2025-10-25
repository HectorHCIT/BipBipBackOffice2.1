# 🚀 Plan de Migración: BipBip Backoffice v2 → v3

## 📋 Resumen Ejecutivo

**Estrategia:** Crear proyecto nuevo Angular 20 + PrimeNG desde cero y migrar lógica módulo por módulo.

**Razón:** Evitar el dolor de actualizar versión por versión (17→18→19→20) y eliminar deuda técnica de golpe.

**Duración estimada:** 2-3 meses
**Riesgo:** Bajo (v2 sigue funcionando en paralelo)
**ROI:** Alto (código limpio, mejor performance, stack moderno)

---

## 🎯 Objetivos

### Técnicos
- ✅ Angular 20 con standalone components
- ✅ PrimeNG en vez de Angular Material (60% menos bundle size)
- ✅ Signals en vez de RxJS BehaviorSubjects
- ✅ Functional guards e interceptors
- ✅ Control flow moderno (`@if`, `@for`, `@switch`)
- ✅ Eliminar NgModules completamente
- ✅ Vite/esbuild (compilación 10x más rápida)

### De Negocio
- ✅ Mantener v2 funcionando sin interrupciones
- ✅ Beta testing en v3 antes de go-live
- ✅ Rollback fácil si algo falla
- ✅ Migración gradual sin feature freeze

---

## 📊 Estado Actual vs Objetivo

| Aspecto | v2 (Angular 17) | v3 (Angular 20) |
|---------|----------------|----------------|
| **Arquitectura** | NgModules | 100% Standalone |
| **UI Library** | Angular Material | PrimeNG |
| **State** | BehaviorSubjects | Signals |
| **Guards** | Class-based | Functional |
| **Interceptors** | Class-based | Functional |
| **Templates** | `*ngIf`, `*ngFor` | `@if`, `@for` |
| **Bundle size** | ~500KB | ~200KB (estimado) |
| **Build time** | ~45s | ~5s (estimado) |
| **TypeScript** | 5.2.x | 5.6+ |
| **Node** | 18.x | 20.11+ |

---

## 🗺️ Roadmap General

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 1: Setup (Semana 1)                                    │
│ • Crear proyecto Angular 20                                 │
│ • Instalar PrimeNG + dependencias                          │
│ • Configurar estructura de carpetas                         │
│ • Setup Tailwind + variables BipBip                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 2: Core (Semana 2)                                     │
│ • Migrar servicios (AuthService, etc)                       │
│ • Crear interceptors funcionales                            │
│ • Crear guards funcionales                                  │
│ • Configurar routing base                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 3: Shared Components (Semana 3-4)                      │
│ • AppSidebar (reemplaza bip-drawer)                        │
│ • AppTable (wrapper de PrimeNG Table)                      │
│ • AppSelect (wrapper de PrimeNG Dropdown)                  │
│ • AppDatePicker (wrapper de PrimeNG Calendar)              │
│ • AppMultiSelect                                            │
│ • AppBreadcrumb                                             │
│ • AppPaginator                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 4: Feature Modules (Semana 5-10)                       │
│ Prioridad ALTA:                                             │
│ • Auth Module (Login, Register, Recovery)                  │
│ • Dashboard Module (KPIs, Charts)                          │
│                                                             │
│ Prioridad MEDIA:                                            │
│ • Push In App Module                                        │
│ • SAC Module (Chat, Tickets)                               │
│ • Reports Module                                            │
│                                                             │
│ Prioridad BAJA:                                             │
│ • Resto de módulos                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ FASE 5: Testing & Deploy (Semana 11-12)                     │
│ • Testing completo                                          │
│ • Beta testing con usuarios reales                         │
│ • Performance optimization                                  │
│ • Go live y deprecar v2                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 FASE 1: Primeros Pasos (COMENZAR AQUÍ)

### Día 1: Crear el proyecto

#### 1.1 Pre-requisitos

```bash
# Actualizar Node a versión 20.11+
nvm install 20.11.0
nvm use 20.11.0

# Verificar versión
node -v  # Debe ser 20.11.0 o superior
npm -v   # Debe ser 10.2.4 o superior

# Actualizar Angular CLI globalmente
npm install -g @angular/cli@20

# Verificar versión
ng version  # Debe ser Angular CLI: 20.x.x
```

#### 1.2 Crear proyecto base

```bash
# Navegar a la carpeta padre donde está BipBipBackoffice2.0
cd d:\CIT

# Crear proyecto nuevo (standalone por defecto en Angular 20)
ng new BipBipBackoffice3.0 \
  --standalone \
  --routing \
  --style=scss \
  --ssr=false \
  --package-manager=npm \
  --skip-git

# Entrar al proyecto
cd BipBipBackoffice3.0
```

**Opciones explicadas:**
- `--standalone`: Todos los componentes son standalone (no NgModules)
- `--routing`: Incluye Angular Router
- `--style=scss`: Usa SCSS en vez de CSS
- `--ssr=false`: Sin Server-Side Rendering (no lo necesitamos)
- `--skip-git`: No inicializar git (ya está en el proyecto padre)

#### 1.3 Instalar dependencias core

```bash
# PrimeNG (UI Library principal)
npm install primeng primeicons

# Angular Fire (Firebase)
npm install @angular/fire@18

# Utilities
npm install luxon jwt-decode socket.io-client

# Excel y archivos
npm install exceljs file-saver

# Types
npm install --save-dev @types/luxon @types/file-saver

# Mapbox (si lo usás)
npm install mapbox-gl @types/mapbox-gl

# Tailwind (opcional, pero recomendado)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

#### 1.4 Estructura de carpetas

```bash
# Crear estructura base
mkdir -p src/app/core/{guards,interceptors,services,models}
mkdir -p src/app/shared/{components,directives,pipes,utils}
mkdir -p src/app/features

# Estructura final:
# src/app/
# ├── core/
# │   ├── guards/          # Functional guards
# │   ├── interceptors/    # Functional interceptors
# │   ├── services/        # Servicios singleton (Auth, Data, etc)
# │   └── models/          # Interfaces y tipos
# ├── shared/
# │   ├── components/      # Componentes reutilizables
# │   ├── directives/      # Directivas custom
# │   ├── pipes/           # Pipes custom
# │   └── utils/           # Funciones helper
# ├── features/
# │   ├── auth/           # Feature: Autenticación
# │   ├── dashboard/      # Feature: Dashboard
# │   ├── push-in-app/    # Feature: Push In App
# │   └── ...             # Otros features
# └── app.component.ts    # Root component
```

### Día 2: Configuración base

#### 2.1 Configurar tsconfig.json (path aliases)

**Archivo:** `tsconfig.json`

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "baseUrl": "./src",
    "paths": {
      "@core/*": ["app/core/*"],
      "@shared/*": ["app/shared/*"],
      "@features/*": ["app/features/*"]
    }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

#### 2.2 Configurar PrimeNG

**Archivo:** `src/styles.scss`

```scss
// =============================================================================
// PRIMENG THEME
// =============================================================================
@import "primeng/resources/themes/lara-light-blue/theme.css";
@import "primeng/resources/primeng.css";
@import "primeicons/primeicons.css";

// =============================================================================
// TAILWIND (Opcional)
// =============================================================================
@tailwind base;
@tailwind components;
@tailwind utilities;

// =============================================================================
// BIPBIP BRAND VARIABLES
// =============================================================================
:root {
  // Brand Colors
  --brand-red: #fb0021;
  --brand-red-hover: #e6001e;
  --brand-red-10: rgba(251, 0, 33, 0.1);

  --brand-black-default: #1e1e1e;
  --brand-black: #000000;

  --brand-light: #6b7280;

  // Neutrals
  --neutral-gray: #f3f4f6;
  --neutral-gray-two: #e5e7eb;
  --neutral-main-border: #d1d5db;

  // Semantic Colors
  --semantic-success: #10b981;
  --semantic-warning: #f59e0b;
  --semantic-fail: #ef4444;
  --semantic-info: #3b82f6;
}

// =============================================================================
// CUSTOM CLASSES (migrar desde v2)
// =============================================================================
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
  @apply bg-brand-red text-white hover:bg-brand-red-hover;
}

.btn-outline {
  @apply border border-neutral-main-border bg-white text-brand-black-default;
  @apply hover:bg-neutral-gray;
}

.input {
  @apply w-full px-4 py-2 border border-neutral-main-border rounded-lg;
  @apply focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent;
}
```

**Archivo:** `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': '#fb0021',
        'brand-red-hover': '#e6001e',
        'brand-black': '#1e1e1e',
      }
    },
  },
  plugins: [],
}
```

#### 2.3 Configurar angular.json

**Actualizar:** `angular.json` (sección `styles`)

```json
{
  "projects": {
    "BipBipBackoffice3.0": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "src/styles.scss"
            ],
            "scripts": []
          }
        }
      }
    }
  }
}
```

#### 2.4 Configurar variables de entorno

**Crear:** `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiURL: 'https://api-dev.bipbip.com/',
  firebaseConfig: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    // ... resto de config
  },
  mapboxToken: 'YOUR_MAPBOX_TOKEN'
};
```

**Crear:** `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiURL: 'https://api.bipbip.com/',
  // ... resto de config
};
```

### Día 3: Setup Core básico

#### 3.1 Crear app.config.ts

**Archivo:** `src/app/app.config.ts`

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([
        // Los interceptors se agregarán en Fase 2
      ])
    )
  ]
};
```

#### 3.2 Crear routing base

**Archivo:** `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
```

#### 3.3 Crear layout base

**Archivo:** `src/app/app.component.ts`

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Aquí irá el layout (navbar, sidebar, etc) -->
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  title = 'BipBip Backoffice 3.0';
}
```

### Día 4-5: Verificación inicial

```bash
# Levantar el proyecto
npm start

# Debería abrir en http://localhost:4200
# Si ves la página de Angular funcionando, ¡TODO BIEN! ✅
```

**Build de prueba:**

```bash
# Build desarrollo
npm run build

# Verificar que compile sin errores
# Debería crear carpeta dist/ con los archivos
```

---

## 📝 Checklist Fase 1

Antes de pasar a Fase 2, verificar:

- [ ] Node 20.11+ instalado
- [ ] Angular CLI 20 instalado
- [ ] Proyecto creado sin errores
- [ ] PrimeNG instalado
- [ ] Estructura de carpetas creada
- [ ] tsconfig.json configurado con path aliases
- [ ] styles.scss configurado con PrimeNG + variables BipBip
- [ ] tailwind.config.js configurado (si usas Tailwind)
- [ ] environment.ts creados
- [ ] app.config.ts configurado
- [ ] app.routes.ts creado
- [ ] `npm start` funciona sin errores
- [ ] `npm run build` funciona sin errores

---

## 🔄 Estrategia de Migración de Código

### ¿Qué copiar del proyecto v2?

#### ✅ COPIAR (Solo la lógica)
- **Servicios**: La lógica de negocio (métodos, llamadas HTTP)
- **Interfaces/Models**: Tipos y modelos de datos
- **Utilities**: Funciones helper puras
- **Constants**: Configuraciones, enums, constantes
- **Guards/Interceptors**: La lógica, pero reescribir como funcionales

#### ❌ NO COPIAR (Reescribir)
- **NgModules**: No existen en v3
- **Component decorators viejos**: Reescribir como standalone
- **@ViewChild**: Usar signals en vez
- **BehaviorSubject**: Usar signals
- **RxJS operators complejos**: Simplificar con signals
- **Template syntax viejo**: Usar `@if`, `@for`, etc

### Ejemplo de migración

**v2 (Angular 17):**
```typescript
// auth.service.ts (v2)
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  login(credentials: LoginCredentials) {
    return this.http.post('/auth/login', credentials)
      .pipe(
        tap(response => {
          this.userSubject.next(response.user);
        })
      );
  }
}
```

**v3 (Angular 20):**
```typescript
// auth.service.ts (v3)
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // 🔥 Signal en vez de BehaviorSubject
  user = signal<User | null>(null);

  login(credentials: LoginCredentials) {
    return this.http.post<AuthResponse>('/auth/login', credentials)
      .pipe(
        tap(response => {
          this.user.set(response.user); // ✅ Más simple
        })
      );
  }
}
```

---

## 📚 Recursos y Documentación

### Angular 20
- [Angular Docs](https://angular.dev)
- [Standalone Components](https://angular.dev/guide/components/importing)
- [Signals](https://angular.dev/guide/signals)
- [Migration Guide](https://angular.dev/reference/migrations)

### PrimeNG
- [PrimeNG Docs](https://primeng.org)
- [Components Showcase](https://primeng.org/showcase)
- [Themes](https://primeng.org/theming)

### Guías de migración
- [Angular Update Guide](https://update.angular.io)
- [Standalone Migration](https://angular.dev/reference/migrations/standalone)

---

## 🚨 Problemas Comunes y Soluciones

### Error: "Module not found"
**Solución:** Verificar path aliases en `tsconfig.json`

### Error: "Cannot find module 'primeng/...'"
**Solución:** `npm install primeng primeicons`

### Error: "NG0303: Can't bind to 'formGroup'"
**Solución:** Importar `ReactiveFormsModule` en el componente standalone

### Build lento
**Solución:** Angular 20 usa Vite por defecto, debería ser rápido. Verificar que no estés usando webpack.

---

## 📞 Próximos Pasos

Una vez completada la **Fase 1**, continuar con:

1. **FASE 2: Core Services** (migrar auth, guards, interceptors)
2. **FASE 3: Shared Components** (crear wrappers de PrimeNG)
3. **FASE 4: Feature Modules** (migrar módulo por módulo)

---

## 📊 Métricas de Éxito

Al final de la migración, deberíamos lograr:

| Métrica | v2 | v3 | Mejora |
|---------|----|----|--------|
| Bundle size | ~500KB | ~200KB | 60% |
| Build time | ~45s | ~5s | 90% |
| Lighthouse score | 75 | 95+ | +20pts |
| Líneas de código | ~50,000 | ~30,000 | 40% |
| Componentes | 150+ | 150+ | = |
| Test coverage | 60% | 80%+ | +20% |

---

## ✅ Conclusión

**Esta estrategia te permite:**
- ✅ Evitar el dolor de migrar versión por versión
- ✅ Eliminar deuda técnica de golpe
- ✅ Aprender Angular moderno correctamente
- ✅ Mantener v2 funcionando sin riesgos
- ✅ Rollback fácil si algo falla
- ✅ Migración gradual módulo por módulo

**Tiempo estimado total:** 2-3 meses trabajando dedicado

**¡Éxito en la migración, maje! 🚀🔥**

---

_Documento creado: {{ fecha }}_
_Versión: 1.0_
_Autor: Equipo BipBip_
