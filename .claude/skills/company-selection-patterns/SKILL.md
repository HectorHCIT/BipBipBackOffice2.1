---
name: company-selection-patterns
description: Patrones para manejo de contexto de compañía en el proyecto. Usa esto cuando trabajes con módulos que necesiten filtrar datos por compañía. Incluye patrón global (CompanyContextService) y patrón local (selector manual).
---

# Company Selection Patterns 🏢

Guía para implementar correctamente el manejo de compañías en módulos del proyecto.

## Dos Patrones Disponibles

El proyecto tiene **dos patrones** para manejar la selección de compañía según las necesidades del módulo.

### Patrón 1: Global Context (Recomendado para la mayoría)

**Cuándo usar**: Cuando el módulo trabaja con datos que dependen de una compañía seleccionada a nivel global.

**Ubicación**: `src/app/core/services/company-context.service.ts`

### Patrón 2: Local Selection (Para módulos específicos)

**Cuándo usar**: Cuando el módulo necesita su propio selector independiente del contexto global (ej: Biométricos).

**Implementación**: Selector dropdown local + servicio `getCompaniesForDropdown()`

---

## Patrón 1: Global Context Service (Recomendado) ✅

### Servicio: CompanyContextService

```typescript
import { Injectable, signal, computed, effect } from '@angular/core';

interface CompanyContext {
  companyId: number;
  companyName: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyContextService {
  // Private writable signal
  private _selectedCompany = signal<CompanyContext | null>(null);

  // Public readonly signal
  selectedCompany = this._selectedCompany.asReadonly();

  // Computed helper
  hasCompanySelected = computed(() => this.selectedCompany() !== null);

  constructor() {
    // Auto-recover from localStorage
    this.loadFromLocalStorage();

    // Auto-persist on changes
    effect(() => {
      const company = this.selectedCompany();
      if (company) {
        localStorage.setItem('selectedCompany', JSON.stringify(company));
      }
    });
  }

  setCompany(company: CompanyContext): void {
    this._selectedCompany.set(company);
  }

  clearCompany(): void {
    this._selectedCompany.set(null);
    localStorage.removeItem('selectedCompany');
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('selectedCompany');
    if (stored) {
      try {
        const company = JSON.parse(stored) as CompanyContext;
        this._selectedCompany.set(company);
      } catch (error) {
        console.error('Error loading company from localStorage:', error);
      }
    }
  }
}
```

### Uso en Feature Modules

```typescript
import { Component, inject, signal, effect, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CompanyContextService } from '@core/services';

@Component({
  selector: 'app-salary-increase-list',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalaryIncreaseListComponent {
  private companyContext = inject(CompanyContextService);
  private salaryIncreaseService = inject(SalaryIncreaseService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  // Expose company signal to template
  selectedCompany = this.companyContext.selectedCompany;

  // Component state
  salaryIncreases = signal<SalaryIncrease[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  pageSize = signal(10);

  constructor() {
    // React to company changes automatically
    effect(() => {
      const company = this.selectedCompany();
      if (company) {
        console.log('🏢 Company changed:', company.companyName);
        this.currentPage.set(1); // Reset pagination
        this.loadData();
      }
    });
  }

  loadData(): void {
    const company = this.selectedCompany();
    if (!company) {
      console.warn('⚠️ No company selected');
      return;
    }

    this.loading.set(true);

    this.salaryIncreaseService
      .getSalaryIncreases(company.companyId, this.currentPage(), this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.salaryIncreases.set(data);
          this.loading.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los datos'
          });
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }
}
```

### Template Pattern

```html
<div class="container p-4">
  <!-- Header with company info -->
  <div class="mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold">Aumentos Salariales</h2>
        @if (selectedCompany()) {
          <p class="text-sm text-gray-600 mt-1">
            <i class="pi pi-building text-blue-600"></i>
            {{ selectedCompany()?.companyName }}
          </p>
        }
      </div>
      <div class="flex gap-2">
        @if (selectedCompany()) {
          <p-button
            label="Nuevo"
            icon="pi pi-plus"
            (click)="openCreateForm()">
          </p-button>
        }
      </div>
    </div>
  </div>

  <!-- Empty state when no company selected -->
  @if (!selectedCompany()) {
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
      <i class="pi pi-building text-5xl text-blue-400 mb-4 block"></i>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">
        Seleccione una empresa
      </h3>
      <p class="text-gray-600">
        Seleccione una empresa desde la barra superior para ver los datos
      </p>
    </div>
  }

  <!-- Data table (only shows if company selected) -->
  @if (selectedCompany()) {
    <p-table [value]="salaryIncreases()" [loading]="loading()">
      <!-- Table content -->
    </p-table>
  }
</div>
```

### Características del Patrón Global

1. **Persistencia Automática**: Se guarda en localStorage
2. **Recuperación Automática**: Se carga al iniciar la app
3. **Reactividad**: Los componentes reaccionan automáticamente a cambios
4. **Centralizado**: Una sola fuente de verdad para toda la app
5. **Type-safe**: Señales tipadas con `CompanyContext`

---

## Patrón 2: Local Selection 🎯

### Cuándo Usar

- El módulo necesita cambiar de compañía sin afectar otros módulos
- Funcionalidad administrativa que requiere consultar múltiples compañías
- Módulos de configuración o mantenimiento

### Implementación Completa

#### Servicio de Compañías (Ya existe)

```typescript
// src/app/features/structures/services/companies.service.ts

interface CompanyDropdownItem {
  value: number;  // companyId
  text: string;   // companyName
}

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}Structure/companies`;

  getCompaniesForDropdown(): Observable<CompanyDropdownItem[]> {
    const url = `${this.apiUrl}/dropdown`;
    return this.http.get<ApiResponse<CompanyDropdownItem[]>>(url).pipe(
      map(response => response.data || [])
    );
  }
}
```

#### Component TypeScript

```typescript
import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CompaniesService } from '@features/structures/services/companies.service';
import { CompanyDropdownItem } from '@features/structures/models/company.model';

@Component({
  selector: 'app-biometric-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,  // Required for [(ngModel)]
    TableModule,
    SelectModule,
    // ... other modules
  ]
})
export class BiometricListComponent implements OnInit {
  private companiesService = inject(CompaniesService);
  private biometricService = inject(BiometricService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  // Local company selection state
  companies = signal<CompanyDropdownItem[]>([]);
  selectedCompanyId = signal<number | null>(null);
  loadingCompanies = signal(false);

  // Feature data
  biometrics = signal<Biometric[]>([]);
  loading = signal(false);

  // Computed signals
  showEmptyMessage = computed(() => !this.selectedCompanyId());

  constructor() {
    // Auto-load data when company changes
    effect(() => {
      const companyId = this.selectedCompanyId();
      if (companyId) {
        console.log('🏢 Company selected:', companyId);
        this.loadBiometrics();
      }
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loadingCompanies.set(true);

    this.companiesService.getCompaniesForDropdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (companies) => {
          this.companies.set(companies);
          this.loadingCompanies.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading companies:', error);
          this.loadingCompanies.set(false);
          this.cdr.markForCheck();
        }
      });
  }

  onCompanyChange(): void {
    // Optional: Reset filters when company changes
    this.currentPage.set(1);
    // Data loads automatically via effect()
  }

  loadBiometrics(): void {
    const companyId = this.selectedCompanyId();
    if (!companyId) return;

    this.loading.set(true);

    this.biometricService.getBiometricsByCompany(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (biometrics) => {
          this.biometrics.set(biometrics);
          this.loading.set(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading biometrics:', error);
          this.loading.set(false);
          this.cdr.markForCheck();
        }
      });
  }
}
```

#### Component HTML

```html
<div class="container p-4">
  <!-- Header -->
  <div class="mb-4">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="text-2xl font-bold">Dispositivos Biométricos</h2>
        <p class="text-sm text-gray-600 mt-1">
          Gestión de dispositivos por empresa
        </p>
      </div>
      <div class="flex gap-2">
        @if (selectedCompanyId()) {
          <p-button
            label="Nuevo"
            icon="pi pi-plus"
            (click)="openCreateForm()">
          </p-button>
        }
      </div>
    </div>

    <!-- Company Selector -->
    <div class="mb-4">
      <label for="companySelector" class="block text-sm font-medium text-gray-700 mb-2">
        Empresa <span class="text-red-500">*</span>
      </label>
      <p-select
        inputId="companySelector"
        [(ngModel)]="selectedCompanyId"
        [options]="companies()"
        optionLabel="text"
        optionValue="value"
        placeholder="Seleccione una empresa"
        [loading]="loadingCompanies()"
        (onChange)="onCompanyChange()"
        [style]="{ width: '100%', maxWidth: '400px' }">
      </p-select>
    </div>
  </div>

  <!-- Empty state -->
  @if (showEmptyMessage()) {
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
      <i class="pi pi-building text-5xl text-blue-400 mb-4 block"></i>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">
        Seleccione una empresa
      </h3>
      <p class="text-gray-600">
        Seleccione una empresa del selector superior
      </p>
    </div>
  }

  <!-- Data table -->
  @if (!showEmptyMessage()) {
    <p-table [value]="biometrics()" [loading]="loading()">
      <!-- Table content -->
    </p-table>
  }
</div>
```

### Características del Patrón Local

1. **Independiente**: No afecta otros módulos
2. **Flexible**: Puede cambiar compañía libremente
3. **Visible**: Usuario ve claramente qué compañía está viendo
4. **No Persistente**: La selección no se guarda (se resetea al recargar)

---

## Comparación de Patrones

| Característica | Global Context | Local Selection |
|----------------|----------------|-----------------|
| **Persistencia** | ✅ localStorage | ❌ No persiste |
| **Afecta toda la app** | ✅ Sí | ❌ Solo el módulo |
| **Selector visible** | En barra superior | En el módulo |
| **Casos de uso** | Módulos operativos | Módulos administrativos |
| **Ejemplos** | Salary Increases, Vacations | Biometrics, Config |

## Mejores Prácticas

### ✅ Do's

- Usar Global Context para módulos operativos del día a día
- Usar Local Selection para módulos administrativos
- Siempre verificar `if (!company)` antes de cargar datos
- Usar `effect()` para reaccionar a cambios de compañía
- Resetear paginación cuando cambia la compañía
- Mostrar mensaje claro cuando no hay compañía seleccionada
- Usar `takeUntilDestroyed()` para limpiar suscripciones

### ❌ Don'ts

- No mezclar ambos patrones en el mismo módulo
- No olvidar `cdr.markForCheck()` con OnPush
- No cargar datos sin verificar que hay compañía seleccionada
- No permitir crear/editar sin compañía seleccionada
- No guardar `companyId` en estado local si usas Global Context

## Migración de Patrones

### De Global a Local

Si un módulo necesita cambiar de Global Context a Local Selection:

1. Remover inyección de `CompanyContextService`
2. Agregar `CompaniesService` y `FormsModule`
3. Crear signals: `companies`, `selectedCompanyId`
4. Agregar `loadCompanies()` y selector en template
5. Cambiar `effect()` para escuchar `selectedCompanyId()`
6. Actualizar empty states y condiciones

### De Local a Global

Si un módulo necesita cambiar de Local Selection a Global Context:

1. Agregar `CompanyContextService`
2. Remover signals locales de compañía
3. Usar `selectedCompany()` del servicio
4. Remover selector del template
5. Actualizar `effect()` para escuchar `selectedCompany()`

## Ejemplos Reales

### Usando Global Context

- `src/app/features/salary-increase/pages/salary-increase-list/`
- `src/app/features/vacations/pages/vacations-list/`
- `src/app/features/permissions/pages/permissions-list/`

### Usando Local Selection

- `src/app/features/biometrics/pages/biometric-list/`

## Referencias

- Servicio Global: `src/app/core/services/company-context.service.ts`
- Servicio Compañías: `src/app/features/structures/services/companies.service.ts`
- Modelo: `src/app/features/structures/models/company.model.ts`
