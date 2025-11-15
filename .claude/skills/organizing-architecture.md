# Organizing Architecture

Provides folder structure conventions, naming patterns, and routing architecture for migrated Angular modules. Ensures consistency across all features with standardized organization, clear naming rules, and proper module boundaries.

## Table of Contents

- [Folder Structure](#folder-structure)
- [Feature Areas](#feature-areas)
- [Naming Conventions](#naming-conventions)
- [Routing Architecture](#routing-architecture)
- [Component Organization](#component-organization)
- [Models Organization](#models-organization)
- [Import Organization](#import-organization)
- [Examples](#examples)
- [Checklist](#checklist)

## Folder Structure

Every feature follows this exact structure:

```
src/app/features/{feature-area}/{feature-name}/
├── components/              # Reusable components
│   ├── {name}-form/        # Form components (drawers)
│   ├── {name}-filter/      # Filter components
│   └── {name}-card/        # Display components
├── models/                  # TypeScript interfaces
│   └── {name}.model.ts     # All interfaces for feature
├── pages/                   # Page components (routes)
│   ├── {name}-list/        # List/index page
│   └── {name}-detail/      # Detail page (if needed)
├── services/                # Business logic services
│   └── {name}.service.ts   # Main service with signals
└── {feature-name}.routes.ts # Route configuration
```

## Feature Areas

Organize features into logical business domains:

| Feature Area | Purpose | Examples |
|--------------|---------|----------|
| `accounting/` | Financial operations | Companies, Invoices, Settlements |
| `client-app/` | Client-facing features | Channels, FAQs, Notifications |
| `contingencies/` | Emergency handling | SAAO, Signal Monitoring |
| `dashboards/` | Analytics & KPIs | Orders, Drivers, Customers |
| `maintenance/` | System configuration | Brands, Prices, Credentials |
| `notification-managements/` | Notification system | Alerts, Target Audience |
| `reports/` | Reporting features | General reports |
| `restaurants/` | Restaurant management | Restaurant CRUD, Coverage |
| `sac/` | Customer service | Chats, Orders, Occurrences |

## Naming Conventions

### Files

```
Components:  {name}.component.ts        # companies-list.component.ts
             {name}.component.html
Services:    {name}.service.ts          # company.service.ts
Models:      {name}.model.ts            # company.model.ts
Routes:      {feature-name}.routes.ts   # companies.routes.ts
```

Avoid `.component.css` files - use Tailwind instead!

### Selectors

```typescript
app-{feature}-{name}          // app-company-form
app-{feature}-{name}-{type}   // app-company-list-filter
```

### Classes

```typescript
// Components
{Name}{Type}Component         // CompaniesListComponent
{Name}FormComponent           // CompanyFormComponent

// Services
{Name}Service                 // CompanyService

// Interfaces
{Name}                        // Company
{Name}Detail                  // CompanyDetail
Create{Name}Request           // CreateCompanyRequest
Update{Name}Request           // UpdateCompanyRequest
{Name}ListResponse            // CompanyListResponse
```

## Routing Architecture

### Three-Level Hierarchy

Routes are organized in three levels for optimal lazy loading:

```typescript
// Level 1: App routes (src/app/app.routes.ts)
{
  path: '',
  component: ProtectedLayoutComponent,
  canActivate: [authGuard],
  children: [
    {
      path: 'accounting',
      loadChildren: () => import('./features/accounting/accounting.routes')
        .then(m => m.ACCOUNTING_ROUTES)
    }
  ]
}

// Level 2: Feature area routes (accounting.routes.ts)
export const ACCOUNTING_ROUTES: Routes = [
  { path: '', redirectTo: 'companies', pathMatch: 'full' },
  {
    path: 'companies',
    loadChildren: () => import('./companies/companies.routes')
      .then(m => m.COMPANIES_ROUTES)
  }
];

// Level 3: Feature routes (companies.routes.ts)
export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/companies-list/companies-list.component')
      .then(m => m.CompaniesListComponent),
    title: 'Gestión de Empresas'
  }
];
```

### Route Patterns

**Simple (Single Page):**
```typescript
export const CHANNELS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/channels-page/channels-page.component')
      .then(m => m.ChannelsPageComponent),
    title: 'Gestión de Canales'
  }
];
```

**Complex (Multiple Pages):**
```typescript
export const RESTAURANTS_ROUTES: Routes = [
  { path: '', redirectTo: 'restaurant', pathMatch: 'full' },
  {
    path: 'restaurant',
    loadComponent: () => import('./pages/restaurants-list/restaurants-list.component')
      .then(m => m.RestaurantsListComponent),
    title: 'Gestión de Restaurantes'
  },
  {
    path: 'restaurant/:id',
    loadComponent: () => import('./pages/restaurant-detail/restaurant-detail.component')
      .then(m => m.RestaurantDetailComponent),
    title: 'Detalle de Restaurante'
  }
];
```

### Preserve Old Routes

**Critical**: Always keep the same route paths when migrating!

```typescript
// OLD: old/src/app/modules/companies/companies-routing.module.ts
{ path: 'company-management/list', component: CompanyListComponent }

// NEW: Keep identical path
{
  path: 'company-management/list',
  loadComponent: () => import('./pages/companies-list/companies-list.component')
}
```

## Component Organization

### Pages (Route Components)

Located in `pages/` - these are route entry points:

**Characteristics:**
- Loaded by router via lazy loading
- Orchestrate child components
- Manage page-level state with signals
- Handle routing and navigation
- Integrate with services

**Example:**
```
pages/
├── companies-list/
│   ├── companies-list.component.ts
│   └── companies-list.component.html
└── company-detail/
    ├── company-detail.component.ts
    └── company-detail.component.html
```

### Components (Reusable)

Located in `components/` - these are feature-specific reusables:

**Characteristics:**
- Used by page components
- Receive data via `input()`
- Emit events via `output()`
- Focused single responsibility
- Minimal or no direct service calls

**Example:**
```
components/
├── company-form/
│   ├── company-form.component.ts
│   └── company-form.component.html
├── company-filter/
│   ├── company-filter.component.ts
│   └── company-filter.component.html
└── company-card/
    ├── company-card.component.ts
    └── company-card.component.html
```

### Drawer vs Page Decision

**Use Drawer:**
- ✅ Create/edit forms
- ✅ Quick detail views
- ✅ Filters and search panels
- ✅ Single-entity operations

**Use Separate Page:**
- ✅ Complex multi-tab details
- ✅ Multi-step wizards
- ✅ Full-screen editors
- ✅ Independent navigation history

## Models Organization

Keep all interfaces in a single `{name}.model.ts` file:

```typescript
// models/company.model.ts

// List entity (minimal fields)
export interface Company {
  id: number;
  name: string;
  status: string;
  createdDate: string;
}

// Detail entity (all fields)
export interface CompanyDetail extends Company {
  address: string;
  phone: string;
  email: string;
  taxId: string;
}

// API request payloads
export interface CreateCompanyRequest {
  name: string;
  address: string;
  phone: string;
}

export interface UpdateCompanyRequest {
  id: number;
  name?: string;
  address?: string;
}

// API response wrapper
export interface CompanyListResponse {
  data: Company[];
  metadata: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  };
}
```

## Import Organization

Order imports consistently:

```typescript
// 1. Angular core
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// 2. Angular forms/reactive
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

// 3. RxJS
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// 4. PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';

// 5. App services
import { CompanyService } from '../../services/company.service';
import { DataService } from '@core/services/data.service';

// 6. App models
import { Company, CompanyDetail } from '../../models/company.model';

// 7. App components
import { CompanyFormComponent } from '../../components/company-form/company-form.component';
```

## Examples

### Simple Feature

```
features/client-app/channels/
├── models/
│   └── channel.model.ts
├── pages/
│   └── channels-page/
│       ├── channels-page.component.ts
│       └── channels-page.component.html
├── services/
│   └── channel.service.ts
└── channels.routes.ts
```

### Complex Feature (CRUD)

```
features/accounting/companies/
├── components/
│   ├── company-form/
│   │   ├── company-form.component.ts
│   │   └── company-form.component.html
│   └── company-filter/
│       ├── company-filter.component.ts
│       └── company-filter.component.html
├── models/
│   └── company.model.ts
├── pages/
│   └── companies-list/
│       ├── companies-list.component.ts
│       └── companies-list.component.html
├── services/
│   └── company.service.ts
└── companies.routes.ts
```

### Very Complex Feature (Multi-tab)

```
features/restaurants/restaurant/
├── components/
│   ├── restaurant-form/
│   ├── coverage-zone-form/
│   ├── schedule-form/
│   └── payment-method-form/
├── models/
│   ├── restaurant.model.ts
│   ├── coverage-zone.model.ts
│   └── schedule.model.ts
├── pages/
│   ├── restaurants-list/
│   └── restaurant-detail/
│       ├── restaurant-detail.component.ts
│       └── restaurant-detail.component.html
├── services/
│   ├── restaurant.service.ts
│   ├── coverage-zone.service.ts
│   └── schedule.service.ts
└── restaurant.routes.ts
```

## Migration Mapping

Transform old structure to new:

```
OLD: old/src/app/modules/companies/

companies.module.ts              → DELETE (no NgModules)
companies-routing.module.ts      → companies.routes.ts
companies.component.ts           → pages/companies-list/
company-form.component.ts        → components/company-form/
company.service.ts               → services/company.service.ts (add signals)
company.model.ts                 → models/company.model.ts (keep)
shared/                          → DELETE (use PrimeNG)
```

## Checklist

- [ ] Feature in correct feature area folder
- [ ] Folder structure follows convention
- [ ] Route file with lazy loading created
- [ ] Routes preserve old path names
- [ ] Models file contains all interfaces
- [ ] Service uses signals pattern
- [ ] Components are standalone
- [ ] Naming conventions followed
- [ ] Imports organized correctly
- [ ] No NgModules created
- [ ] PrimeNG components used (no custom UI)

---

**Consistency is key!** Follow these patterns exactly for every migration.
