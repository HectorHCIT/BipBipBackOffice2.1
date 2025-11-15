# Implementing Components

Provides patterns for converting NgModule components to standalone components with signals, modern control flow, and reactive state management. Covers component structure, migration patterns, and communication between components.

## Table of Contents

- [Component Structure](#component-structure)
- [Core Migration Patterns](#core-migration-patterns)
- [Signals Best Practices](#signals-best-practices)
- [Component Communication](#component-communication)
- [Page Components](#page-components)
- [Reusable Components](#reusable-components)
- [Common Mistakes](#common-mistakes)
- [Checklist](#checklist)

## Component Structure

Every component follows this template:

```typescript
import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';

@Component({
  selector: 'app-{feature}-{name}',
  standalone: true,
  imports: [/* PrimeNG modules, other components */],
  templateUrl: './{name}.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush  // Always!
})
export class {Name}Component {
  // 1. Inject dependencies
  private readonly service = inject(SomeService);

  // 2. Input signals (from parent)
  readonly inputProp = input<Type>();
  readonly requiredInput = input.required<Type>();

  // 3. Output signals (to parent)
  readonly onSave = output<Type>();
  readonly onClose = output<void>();

  // 4. Local state signals
  readonly isLoading = signal<boolean>(false);
  readonly items = signal<Item[]>([]);

  // 5. Service signals (reactive data)
  readonly companies = this.companyService.companies;

  // 6. Computed signals (derived state)
  readonly hasData = computed(() => this.items().length > 0);

  // 7. Lifecycle hooks
  ngOnInit(): void {
    this.loadData();
  }

  // 8. Public methods
  loadData(): void {
    this.service.getData().subscribe();
  }
}
```

## Core Migration Patterns

### @Input → input()

```typescript
// OLD
@Input() companyId!: number;
@Input() mode: 'create' | 'edit' = 'create';
@Input({ required: true }) name!: string;

// NEW
readonly companyId = input<number>();
readonly mode = input<'create' | 'edit'>('create');
readonly name = input.required<string>();

// Access: call as function
const id = this.companyId();
```

### @Output → output()

```typescript
// OLD
@Output() onSave = new EventEmitter<Company>();

// NEW
readonly onSave = output<Company>();

// Emit
this.onSave.emit(company);
```

### Properties → Signals

```typescript
// OLD
isLoading: boolean = false;
companies: Company[] = [];

// NEW
readonly isLoading = signal<boolean>(false);
readonly companies = signal<Company[]>([]);

// Update
this.isLoading.set(true);
this.companies.update(current => [...current, newItem]);
```

### Getters → Computed

```typescript
// OLD
get hasCompanies(): boolean {
  return this.companies.length > 0;
}

// NEW
readonly hasCompanies = computed(() => this.companies().length > 0);
```

### Constructor → inject()

```typescript
// OLD
constructor(
  private companyService: CompanyService,
  private router: Router
) {}

// NEW
private readonly companyService = inject(CompanyService);
private readonly router = inject(Router);
```

### Template Control Flow

```typescript
// *ngIf → @if
@if (isLoading()) {
  <div>Loading...</div>
}

// *ngFor → @for (always with track!)
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

// *ngSwitch → @switch
@switch (status()) {
  @case ('active') { <span>Active</span> }
  @case ('inactive') { <span>Inactive</span> }
  @default { <span>Unknown</span> }
}

// [ngClass] → class bindings
<div [class.active]="isActive()" [class.disabled]="isDisabled()">

// [ngStyle] → style bindings
<div [style.color]="textColor()" [style.font-size.px]="fontSize()">
```

**More patterns**: See [reference/signal-patterns](reference/signal-patterns.md)

## Signals Best Practices

### When to Use Each Type

```typescript
// signal() - For mutable state
readonly searchTerm = signal<string>('');
readonly isOpen = signal<boolean>(false);
readonly selectedItems = signal<Item[]>([]);

// computed() - For derived state
readonly filteredItems = computed(() =>
  this.items().filter(item => item.name.includes(this.searchTerm()))
);
readonly itemCount = computed(() => this.items().length);
readonly hasSelection = computed(() => this.selectedItems().length > 0);
```

### Update Methods

```typescript
// set() - Replace entire value
this.items.set([item1, item2, item3]);

// update() - Modify based on current
this.items.update(current => [...current, newItem]);
this.counter.update(current => current + 1);

// ❌ NEVER use mutate()
// this.items.mutate(current => current.push(newItem)); // Don't!
```

**Advanced patterns**: See [reference/signal-patterns](reference/signal-patterns.md)

## Component Communication

### Parent → Child (Inputs)

```typescript
// Parent
@Component({
  template: `
    <app-company-form
      [companyId]="selectedId()"
      [mode]="formMode()"
    />
  `
})
export class ParentComponent {
  readonly selectedId = signal<number | null>(null);
  readonly formMode = signal<'create' | 'edit'>('create');
}

// Child
export class CompanyFormComponent {
  readonly companyId = input<number | null>();
  readonly mode = input<'create' | 'edit'>('create');
}
```

### Child → Parent (Outputs)

```typescript
// Child
export class CompanyFormComponent {
  readonly onSave = output<Company>();

  save(): void {
    this.onSave.emit(this.company);
  }
}

// Parent
@Component({
  template: `
    <app-company-form
      (onSave)="handleSave($event)"
      (onClose)="closeDrawer()"
    />
  `
})
export class ParentComponent {
  handleSave(company: Company): void {
    this.loadCompanies(); // Refresh
  }
}
```

### Service-Based (Shared State)

```typescript
// Service
@Injectable({ providedIn: 'root' })
export class CompanyService {
  readonly companies = signal<Company[]>([]);
  readonly selectedCompany = signal<Company | null>(null);
}

// Multiple components can read/write
export class ListComponent {
  private readonly companyService = inject(CompanyService);
  readonly companies = this.companyService.companies;
}
```

## Page Components

Page components orchestrate the entire view. They MUST include:

- **Header with title and description**
- **Filters panel (always visible)**
- **Data table or cards**
- **PrimeNG Paginator** (never custom pagination)
- **MessageService** provider for notifications

### Complete Page Component Structure

```typescript
import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    PaginatorModule
  ],
  providers: [MessageService], // IMPORTANT: Required for notifications
  templateUrl: './companies-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompaniesListComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  // Expose Math for template calculations
  readonly Math = Math;

  // Data
  dataSource: Company[] = [];
  private readonly originalData = signal<Company[]>([]);
  private readonly filteredData = signal<Company[]>([]);

  // State signals
  readonly isLoading = signal<boolean>(false);
  readonly isDrawerOpen = signal<boolean>(false);

  // Pagination (for p-paginator)
  pageIndex = 0;
  readonly pageSize = signal(10);
  totalRecords = 0;

  // Filter form (always visible)
  filterForm!: FormGroup;

  // Computed
  readonly hasData = computed(() => this.filteredData().length > 0);

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  /**
   * Initialize filter form
   */
  private initializeForm(): void {
    this.filterForm = this.fb.group({
      searchText: [''],
      dateRange: [null], // PrimeNG DatePicker returns [Date, Date] array
      status: ['all']
    });
  }

  /**
   * Load data from service
   */
  loadData(): void {
    this.isLoading.set(true);

    this.companyService.getCompanies().subscribe({
      next: (data) => {
        this.originalData.set(data);
        this.applyLocalFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar los datos'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Apply local filters
   */
  private applyLocalFilters(): void {
    let filtered = [...this.originalData()];
    const filters = this.filterForm.value;

    if (filters.searchText) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(filters.searchText.toLowerCase())
      );
    }

    this.filteredData.set(filtered);
    this.updateTableData();
  }

  /**
   * Update table data with pagination
   */
  updateTableData(): void {
    const startIndex = this.pageIndex * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    this.dataSource = this.filteredData().slice(startIndex, endIndex);
    this.totalRecords = this.filteredData().length;
    this.cdr.markForCheck();
  }

  /**
   * Handle p-paginator page change
   */
  onPaginateChange(event: any): void {
    // p-paginator event: { first, rows, page, pageCount }
    this.pageIndex = event.page;
    this.pageSize.set(event.rows);
    this.updateTableData();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterForm.reset({
      searchText: '',
      dateRange: null,
      status: 'all'
    });
    this.pageIndex = 0;
    this.applyLocalFilters();

    this.messageService.add({
      severity: 'success',
      summary: 'Filtros limpiados',
      detail: 'Se han restaurado los filtros predeterminados'
    });
  }
}
```

### Page Component Template (HTML)

```html
<div class="p-6">
  <!-- Header (Required) -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">
        Lista de Compañías
      </h1>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Gestiona las compañías del sistema
      </p>
    </div>
    <div class="flex gap-2">
      <p-button
        icon="pi pi-plus"
        label="Nueva Compañía"
        (onClick)="openCreateDrawer()"
      />
      <p-button
        icon="pi pi-refresh"
        [text]="true"
        [rounded]="true"
        (onClick)="loadData()"
        label="Actualizar"
        [loading]="isLoading()"
      />
    </div>
  </div>

  <!-- Filters Panel (Always Visible - Required) -->
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
    <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="flex flex-col gap-2">
        <label class="font-medium text-sm">
          <i class="pi pi-search mr-1"></i>
          Búsqueda
        </label>
        <p-iconfield iconPosition="left">
          <p-inputicon styleClass="pi pi-search" />
          <input
            pInputText
            formControlName="searchText"
            class="w-full"
            placeholder="Buscar..."
            (input)="applyLocalFilters()"
          />
        </p-iconfield>
      </div>

      <div class="flex flex-col gap-2">
        <label class="font-medium text-sm">
          <i class="pi pi-calendar mr-1"></i>
          Rango de Fechas
        </label>
        <p-datepicker
          formControlName="dateRange"
          selectionMode="range"
          [showIcon]="true"
          dateFormat="dd/mm/yy"
          placeholder="Seleccione rango"
        />
      </div>

      <div class="md:col-span-3 flex gap-2 justify-end">
        <p-button
          label="Limpiar"
          icon="pi pi-times"
          [outlined]="true"
          severity="secondary"
          (onClick)="clearFilters()"
        />
        <p-button
          label="Aplicar"
          icon="pi pi-check"
          (onClick)="applyLocalFilters()"
        />
      </div>
    </form>
  </div>

  <!-- Content Area -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <!-- Loading State -->
    @if (isLoading()) {
      <div class="flex flex-col items-center justify-center py-20">
        <p-progressSpinner />
        <span class="mt-4 text-gray-600 dark:text-gray-400">Cargando datos...</span>
      </div>
    } @else if (!hasData()) {
      <!-- Empty State -->
      <div class="flex flex-col items-center justify-center py-20">
        <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No hay datos
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Los registros aparecerán aquí
        </p>
      </div>
    } @else {
      <!-- PrimeNG Table -->
      <p-table
        [value]="dataSource"
        [tableStyle]="{ 'min-width': '50rem' }"
        styleClass="p-datatable-sm"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-item>
          <tr>
            <td>{{ item.name }}</td>
            <td>{{ item.email }}</td>
            <td class="text-center">
              <p-tag
                [value]="item.active ? 'Activo' : 'Inactivo'"
                [severity]="item.active ? 'success' : 'danger'"
              />
            </td>
            <td class="text-center">
              <p-button
                icon="pi pi-pencil"
                [text]="true"
                [rounded]="true"
                (onClick)="editItem(item)"
              />
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="4">
              <div class="flex flex-col items-center py-12 px-6">
                <i class="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
                <p class="text-center font-medium text-gray-600">
                  No se encontraron resultados
                </p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    }
  </div>

  <!-- Paginator (Required - NEVER use custom pagination) -->
  @if (totalRecords > 0) {
    <p-paginator
      [rows]="pageSize()"
      [totalRecords]="totalRecords"
      [first]="pageIndex * pageSize()"
      [rowsPerPageOptions]="[5, 10, 20, 50]"
      (onPageChange)="onPaginateChange($event)"
      class="mt-3"
    />
  }
</div>
```

### Key Points for Page Components

1. **MessageService Provider**: Always add to `providers` array
2. **Filters Always Visible**: No toggle buttons, filters are always shown
3. **PrimeNG Paginator**: Use `<p-paginator>` component, never custom HTML
4. **DatePicker Returns Array**: `[Date, Date]` for range mode, not `{start, end}`
5. **Expose Math**: Add `readonly Math = Math` for template calculations
6. **Header Required**: Title + description for every page
7. **Three Data Signals**:
   - `originalData` (from API)
   - `filteredData` (after filters)
   - `dataSource` (current page slice)

### Pagination Event Handler

```typescript
onPaginateChange(event: any): void {
  // p-paginator event: { first, rows, page, pageCount }
  this.pageIndex = event.page;
  this.pageSize.set(event.rows);
  this.updateTableData();
}

updateTableData(): void {
  const startIndex = this.pageIndex * this.pageSize();
  const endIndex = startIndex + this.pageSize();
  this.dataSource = this.filteredData().slice(startIndex, endIndex);
  this.totalRecords = this.filteredData().length;
  this.cdr.markForCheck();
}
```

### DatePicker Handling

```typescript
// Initialize with array format
this.filterForm.patchValue({
  dateRange: [startDate, endDate] // Array, not object!
});

// Access dates
const range = this.filterForm.value.dateRange;
if (Array.isArray(range) && range.length >= 2) {
  const startDate = range[0]; // First date
  const endDate = range[1];   // Second date
}
    this.companyService.getCompanies({
      search: this.searchTerm()
    }).subscribe();
  }

  openDrawer(id?: number): void {
    this.selectedId.set(id ?? null);
    this.isDrawerOpen.set(true);
  }

  handleSave(): void {
    this.isDrawerOpen.set(false);
    this.loadCompanies();
  }
}
```

## Reusable Components

Reusable components are focused and configurable:

```typescript
@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DrawerModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './company-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);

  // Inputs
  readonly companyId = input<number | null>(null);
  readonly mode = input<'create' | 'edit' | 'view'>('create');

  // Outputs
  readonly onSave = output<void>();
  readonly onClose = output<void>();

  // State
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);

  // Computed
  readonly isEditMode = computed(() => this.companyId() !== null);
  readonly title = computed(() =>
    this.isEditMode() ? 'Editar Empresa' : 'Nueva Empresa'
  );

  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    if (this.isEditMode()) {
      this.loadCompany();
    }
  }

  save(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const action$ = this.isEditMode()
      ? this.companyService.updateCompany(this.companyId()!, this.form.value)
      : this.companyService.createCompany(this.form.value);

    action$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.onSave.emit();
      },
      error: () => this.isSaving.set(false)
    });
  }
}
```

## Common Mistakes

```typescript
// ❌ Forgetting to call signal as function
if (this.isLoading) { }  // Always truthy!

// ✅ Correct
if (this.isLoading()) { }

// ❌ Using mutate instead of update
this.items.mutate(current => current.push(newItem));

// ✅ Correct
this.items.update(current => [...current, newItem]);

// ❌ Missing track in @for
@for (item of items()) {
  <div>{{ item.name }}</div>
}

// ✅ Correct
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

// ❌ Missing OnPush
@Component({ /* no changeDetection */ })

// ✅ Correct
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })

// ❌ Using decorator
@Input() name!: string;

// ✅ Correct
readonly name = input<string>();
```

## Checklist

- [ ] Component is standalone
- [ ] ChangeDetectionStrategy.OnPush set
- [ ] All @Input → input()
- [ ] All @Output → output()
- [ ] All properties → signal()
- [ ] All getters → computed()
- [ ] Constructor injection → inject()
- [ ] All *ngIf → @if
- [ ] All *ngFor → @for with track
- [ ] All *ngSwitch → @switch
- [ ] All [ngClass] → class bindings
- [ ] All [ngStyle] → style bindings
- [ ] Signals called as functions
- [ ] PrimeNG components used

---

**Signals are the future!** Use them everywhere for reactive, performant state.
