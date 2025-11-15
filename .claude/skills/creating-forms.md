# Creating Forms

Provides patterns for creating forms and drawers using PrimeNG components, Reactive Forms, and global styling. Ensures all forms follow consistent patterns with proper validation, error handling, and accessibility.

## Table of Contents

- [Drawer Pattern](#drawer-pattern)
- [Form Component Structure](#form-component-structure)
- [PrimeNG Components](#primeng-components)
- [Global Colors](#global-colors)
- [Form Validation](#form-validation)
- [Dialog vs Drawer](#dialog-vs-drawer)
- [Checklist](#checklist)

## Drawer Pattern

Forms open in drawers (side panels) for better UX, not separate routes.

### Parent Component (List Page)

```typescript
@Component({
  selector: 'app-companies-list',
  template: `
    <p-button label="Nueva Empresa" (onClick)="openCreateDrawer()" />

    <p-table [value]="companies()">
      <ng-template #body let-company>
        <tr>
          <td>{{ company.name }}</td>
          <td>
            <p-button icon="pi pi-pencil" [text]="true"
              (onClick)="openEditDrawer(company.id)" />
          </td>
        </tr>
      </ng-template>
    </p-table>

    @if (isDrawerOpen()) {
      <app-company-form
        [companyId]="selectedId()"
        [mode]="drawerMode()"
        (onClose)="closeDrawer()"
        (onSave)="handleSave()"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompaniesListComponent {
  readonly isDrawerOpen = signal<boolean>(false);
  readonly selectedId = signal<number | null>(null);
  readonly drawerMode = signal<'create' | 'edit' | 'view'>('create');

  openCreateDrawer(): void {
    this.drawerMode.set('create');
    this.selectedId.set(null);
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(id: number): void {
    this.drawerMode.set('edit');
    this.selectedId.set(id);
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  handleSave(): void {
    this.closeDrawer();
    this.loadCompanies();
  }
}
```

## Form Component Structure

```typescript
@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DrawerModule,           // PrimeNG
    ButtonModule,           // PrimeNG
    InputTextModule,        // PrimeNG
    SelectModule,           // PrimeNG
    ToggleSwitchModule,     // PrimeNG
    FloatLabelModule        // PrimeNG
  ],
  templateUrl: './company-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly messageService = inject(MessageService);

  // Inputs
  readonly companyId = input<number | null>(null);
  readonly mode = input<'create' | 'edit' | 'view'>('create');

  // Outputs
  readonly onClose = output<void>();
  readonly onSave = output<void>();

  // State
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);

  // Computed
  readonly isEditMode = computed(() => this.mode() === 'edit');
  readonly isViewMode = computed(() => this.mode() === 'view');
  readonly title = computed(() => {
    if (this.mode() === 'create') return 'Nueva Empresa';
    if (this.mode() === 'edit') return 'Editar Empresa';
    return 'Ver Empresa';
  });

  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    if (this.companyId()) {
      this.loadCompany();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      taxId: ['', Validators.required],
      address: [''],
      phone: ['', Validators.pattern(/^\d{10}$/)],
      email: ['', Validators.email],
      isActive: [true]
    });

    if (this.isViewMode()) {
      this.form.disable();
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const action$ = this.isEditMode()
      ? this.companyService.updateCompany(this.companyId()!, this.form.value)
      : this.companyService.createCompany(this.form.value);

    action$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empresa guardada correctamente'
        });
        this.onSave.emit();
      },
      error: () => {
        this.isSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al guardar empresa'
        });
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return control?.invalid && (control?.dirty || control?.touched) || false;
  }
}
```

### Drawer Template

```html
<p-drawer
  [visible]="true"
  [position]="'right'"
  [style]="{ width: '450px' }"
  [modal]="true"
  (onHide)="onClose.emit()"
>
  <ng-template #header>
    <div class="flex items-center gap-3">
      <i class="pi pi-building text-2xl"></i>
      <span class="text-xl font-semibold">{{ title() }}</span>
    </div>
  </ng-template>

  <div class="flex flex-col gap-6">
    @if (isLoading()) {
      <div class="flex justify-center items-center h-64">
        <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
      </div>
    } @else {
      <form [formGroup]="form" class="flex flex-col gap-4">

        <!-- Name field -->
        <div class="flex flex-col gap-2">
          <label for="name" class="font-medium">
            Nombre <span class="text-danger-500">*</span>
          </label>
          <input pInputText id="name" formControlName="name" />
          @if (hasError('name')) {
            <small class="text-danger-500">Campo requerido</small>
          }
        </div>

        <!-- More fields... -->

        <!-- Active toggle -->
        <div class="flex items-center gap-3">
          <p-toggleswitch formControlName="isActive" inputId="isActive" />
          <label for="isActive" class="font-medium cursor-pointer">
            Empresa activa
          </label>
        </div>

      </form>
    }
  </div>

  <ng-template #footer>
    <div class="flex justify-end gap-2">
      @if (!isViewMode()) {
        <p-button label="Cancelar" [outlined]="true" (onClick)="onClose.emit()" />
        <p-button label="Guardar" icon="pi pi-check" (onClick)="save()"
          [loading]="isSaving()" [disabled]="form.invalid" />
      } @else {
        <p-button label="Cerrar" (onClick)="onClose.emit()" />
      }
    </div>
  </ng-template>
</p-drawer>
```

## PrimeNG Components

**ALWAYS use PrimeNG - NEVER create custom alternatives!**

### Essential Form Components

| Component | Usage | Import |
|-----------|-------|--------|
| `<p-inputtext>` | Text input | `InputTextModule` |
| `<p-inputnumber>` | Numeric input | `InputNumberModule` |
| `<p-textarea>` | Multi-line text | `InputTextareaModule` |
| `<p-select>` | Dropdown | `SelectModule` |
| `<p-checkbox>` | Checkbox | `CheckboxModule` |
| `<p-toggleswitch>` | Toggle | `ToggleSwitchModule` |
| `<p-datepicker>` | Date picker | `DatePickerModule` |
| `<p-floatlabel>` | Floating label | `FloatLabelModule` |

### Layout Components

| Component | Usage | Import |
|-----------|-------|--------|
| `<p-drawer>` | Side panel | `DrawerModule` |
| `<p-dialog>` | Modal dialog | `DialogModule` |
| `<p-card>` | Card container | `CardModule` |

### Examples

```html
<!-- Select Dropdown -->
<p-select
  formControlName="status"
  [options]="statusOptions"
  optionLabel="label"
  optionValue="value"
  placeholder="Seleccione estado"
/>

<!-- Date Picker -->
<p-datepicker
  formControlName="date"
  dateFormat="dd/mm/yy"
  [showIcon]="true"
/>

<!-- Input with Icon -->
<p-iconfield iconPosition="left">
  <p-inputicon styleClass="pi pi-search" />
  <input pInputText formControlName="search" />
</p-iconfield>
```

**Complete reference**: [reference/primeng-components](reference/primeng-components.md)

## Global Colors

**NO HARDCODED COLORS - Use CSS variables and Tailwind!**

### ✅ Correct

```html
<!-- Tailwind classes (preferred) -->
<div class="bg-primary-500 text-white">Primary</div>
<div class="text-success-600">Success</div>
<div class="border-danger-500">Danger</div>

<!-- CSS variables (inline styles) -->
<div [style.color]="'var(--p-primary-color)'">Primary</div>
<div [style.background-color]="'var(--p-success-color)'">Success</div>
```

### ❌ Wrong

```html
<!-- NEVER DO THIS! -->
<div style="background-color: #FB0021">Bad!</div>
<div [style.color]="'#01EB7B'">Bad!</div>
<div class="text-[#E7001E]">Bad!</div>
```

### Available Colors

| Color | Tailwind | CSS Variable |
|-------|----------|--------------|
| Primary (Red) | `text-primary-500` | `var(--p-primary-color)` |
| Success (Green) | `text-success-500` | `var(--p-success-color)` |
| Danger (Red) | `text-danger-500` | `var(--p-danger-color)` |
| Warning (Yellow) | `text-warning-500` | `var(--p-warning-color)` |

Each has shades 50-950: `primary-50`, `primary-100`, ..., `primary-950`

### Tailwind Utilities

```html
<!-- Layout -->
<div class="flex flex-col gap-4">
<div class="grid grid-cols-2 gap-4">

<!-- Spacing -->
<div class="p-4 m-2">
<div class="px-6 py-4">

<!-- Typography -->
<h1 class="text-2xl font-semibold">
<p class="text-sm text-gray-600 dark:text-gray-400">

<!-- Borders -->
<div class="border border-gray-300 rounded-lg">
```

## Form Validation

```typescript
// Helper method
hasError(field: string, error?: string): boolean {
  const control = this.form.get(field);
  if (!control) return false;

  if (error) {
    return control.hasError(error) && (control.dirty || control.touched);
  }
  return control.invalid && (control.dirty || control.touched);
}

// Error message helper
getErrorMessage(field: string): string {
  const control = this.form.get(field);
  if (!control?.errors) return '';

  if (control.hasError('required')) return 'Campo requerido';
  if (control.hasError('email')) return 'Email inválido';
  if (control.hasError('minlength')) {
    const min = control.errors['minlength'].requiredLength;
    return `Mínimo ${min} caracteres`;
  }
  if (control.hasError('pattern')) return 'Formato inválido';

  return 'Campo inválido';
}
```

**Complete validation patterns**: [reference/form-validation](reference/form-validation.md)

## Dialog vs Drawer

### Use Drawer For
- ✅ Create/edit forms
- ✅ Quick detail views
- ✅ Filters/search panels
- ✅ Single-entity operations

### Use Dialog For
- ✅ Confirmations
- ✅ Alerts/warnings
- ✅ Small data displays
- ✅ Quick actions

## Checklist

- [ ] Using `<p-drawer>` (not custom component)
- [ ] Reactive Forms with FormBuilder
- [ ] All form controls are PrimeNG
- [ ] Validation with `hasError()` helper
- [ ] No hardcoded colors
- [ ] Tailwind for layout
- [ ] Loading state with signal
- [ ] Saving state with signal
- [ ] Error handling with MessageService
- [ ] Form disabled in view mode
- [ ] Input/output signals for parent communication
- [ ] OnPush change detection

---

**PrimeNG + Tailwind + Global Colors = Consistent Beautiful UI!**
