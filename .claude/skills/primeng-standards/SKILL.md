---
description: Estándares y componentes de PrimeNG para UI. Usa esto al crear tablas, formularios, diálogos, botones, menús o cualquier elemento de interfaz. SIEMPRE usa componentes PrimeNG, nunca alternativas custom.
---

# PrimeNG Integration Standards 🎨

## Core Principle

**ALWAYS** use PrimeNG components for UI elements. Never create custom alternatives when a PrimeNG component exists.

## Tables 📊

**ALWAYS** use `p-table` component for any tabular data.

### Basic Table Structure

```html
<p-table 
  [value]="items()"
  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[10, 25, 50]"
  [totalRecords]="totalRecords()"
  [loading]="isLoading()"
  (onPage)="onPageChange($event)">
  
  <ng-template pTemplate="header">
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Actions</th>
    </tr>
  </ng-template>
  
  <ng-template pTemplate="body" let-item>
    <tr>
      <td>{{ item.name }}</td>
      <td>{{ item.email }}</td>
      <td>
        <!-- Action buttons here -->
      </td>
    </tr>
  </ng-template>
</p-table>
```

### Pagination ⚡

**CRITICAL**: The paginator must be displayed in a **single horizontal row** with all elements aligned inline.

#### Correct Layout Pattern

```
| Mostrando 1 a 10 de 100 registros  « < 1 > »  [10 ▼] |
```

All elements (text, navigation, dropdown) must be in **ONE LINE**, not stacked vertically.

#### Implementation

```html
<p-table
  [value]="items()"
  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[5, 10, 25, 50]"
  [showCurrentPageReport]="true"
  currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
  responsiveLayout="scroll"
  styleClass="p-datatable-striped">
  <!-- Table content -->
</p-table>
```

#### Key Configuration

- `[paginator]="true"` - Enable pagination
- `[rows]="10"` - Items per page (default)
- `[rowsPerPageOptions]="[5, 10, 25, 50]"` - Page size options dropdown
- `[showCurrentPageReport]="true"` - Show "Mostrando X a Y de Z"
- `currentPageReportTemplate` - Custom text template
- `responsiveLayout="scroll"` - Responsive behavior

#### Pagination Types

**Local Pagination** (small datasets):
```html
<p-table
  [value]="allItems()"
  [paginator]="true"
  [rows]="10">
  <!-- PrimeNG handles pagination automatically -->
</p-table>
```

**Server-Side Pagination** (large datasets):
```html
<p-table
  [value]="displayedItems()"
  [paginator]="true"
  [rows]="pageSize()"
  [totalRecords]="totalRecords()"
  [lazy]="true"
  (onPage)="onPageChange($event)">
  <!-- You handle pagination in onPageChange() -->
</p-table>
```

#### Common Mistakes to Avoid

❌ **WRONG**: Paginator elements stacked vertically
```
Mostrando 1 a 10 de 100
[Select dropdown below spanning full width]
« < 1 > »
```

✅ **CORRECT**: All elements in one horizontal line
```
| Mostrando 1 a 10 de 100  « < 1 > »  [10 ▼] |
```

- **ALWAYS** include pagination for tables with more than 10 items
- Use local pagination for small datasets
- Use API pagination (`[lazy]="true"`) for large datasets
- Show appropriate `rowsPerPageOptions` based on data volume (typically `[5, 10, 25, 50]`)

#### Paginator Styling (Optional)

If the paginator elements stack vertically, add this SCSS to force horizontal layout:

```scss
.your-component-container {
  ::ng-deep {
    .p-paginator {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.5rem 1rem;

      .p-paginator-current {
        margin-inline-end: auto;
      }

      .p-paginator-pages {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .p-dropdown {
        margin-inline-start: 0.5rem;
        width: 80px; // Fixed width for page size dropdown
        min-width: 80px;
      }
    }
  }
}
```

This ensures:
- All paginator elements stay in one line (`flex-wrap: nowrap`)
- Proper spacing between elements
- Dropdown has fixed width (80px) and doesn't expand unnecessarily
- Dropdown aligned to the right
- Current page report on the left

## Action Buttons in Tables 🎛️

**ALWAYS** use vertical three-dot menu (kebab menu) for row actions.

### Standard Pattern

```html
<p-button 
  icon="pi pi-ellipsis-v" 
  [rounded]="true" 
  [text]="true"
  severity="secondary"
  (onClick)="menu.toggle($event)" />
  
<p-menu 
  #menu 
  [model]="menuItems" 
  [popup]="true" />
```

### Menu Items Setup

```typescript
menuItems: MenuItem[] = [
  {
    label: 'View Details',
    icon: 'pi pi-eye',
    command: () => this.viewDetails()
  },
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    command: () => this.edit()
  },
  {
    separator: true
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    command: () => this.delete(),
    styleClass: 'text-red-500' // For destructive actions
  }
];
```

## Severity Variants 🎨

**ALWAYS** use PrimeNG severity variants for styling components.

### Available Severities

- `severity="success"` - Positive actions (create, confirm, approve)
- `severity="info"` - Informational actions (view, details)
- `severity="warn"` - Warning actions (caution, pending)
- `severity="danger"` - Destructive actions (delete, cancel, reject)
- `severity="secondary"` - Neutral actions (back, close)
- `severity="contrast"` - High contrast needs

### Apply To

Buttons, badges, messages, tags, chips, and other interactive elements.

```html
<p-button label="Create" severity="success" />
<p-button label="Delete" severity="danger" />
<p-badge value="New" severity="info" />
<p-tag value="Pending" severity="warn" />
```

## Buttons 🔘

Use `p-button` for all actions:

```html
<!-- Standard button -->
<p-button label="Save" icon="pi pi-check" severity="success" />

<!-- Loading state -->
<p-button 
  label="Save" 
  [loading]="isLoading()" 
  severity="success" />

<!-- Icon only -->
<p-button 
  icon="pi pi-search" 
  [rounded]="true" 
  [text]="true" />
```

### Icon Reference

Use icons from PrimeIcons: `icon="pi pi-{icon-name}"`

Common icons: `check`, `times`, `plus`, `trash`, `pencil`, `eye`, `search`, `filter`, `download`, `upload`

## Dialogs & Overlays 💬

### Dialogs

```html
<p-dialog 
  [(visible)]="showDialog()"
  [modal]="true"
  [header]="'Edit User'"
  [style]="{ width: '50vw' }">
  
  <!-- Dialog content -->
  
  <ng-template pTemplate="footer">
    <p-button label="Cancel" severity="secondary" (onClick)="closeDialog()" />
    <p-button label="Save" severity="success" (onClick)="save()" />
  </ng-template>
</p-dialog>
```

### Menus

```html
<p-menu [model]="items" [popup]="true" #menu />
```

### Overlay Panels

```html
<p-overlayPanel #op>
  <!-- Custom content -->
</p-overlayPanel>
```

### Confirmation Dialogs

```typescript
// Inject service
confirmationService = inject(ConfirmationService);

// Use for confirmations
confirmDelete() {
  this.confirmationService.confirm({
    message: 'Are you sure you want to delete this item?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptButtonStyleClass: 'p-button-danger',
    accept: () => {
      this.deleteItem();
    }
  });
}
```

## Forms 📝

### Input Components

```html
<!-- Text Input -->
<p-floatLabel>
  <input pInputText id="name" formControlName="name" />
  <label for="name">Name</label>
</p-floatLabel>

<!-- Dropdown -->
<p-floatLabel>
  <p-dropdown 
    id="category"
    [options]="categories()" 
    formControlName="category"
    optionLabel="name"
    optionValue="id" />
  <label for="category">Category</label>
</p-floatLabel>

<!-- Calendar -->
<p-floatLabel>
  <p-calendar 
    id="date"
    formControlName="date"
    dateFormat="dd/mm/yy" />
  <label for="date">Date</label>
</p-floatLabel>

<!-- Input with Icon -->
<p-iconfield>
  <p-inputicon class="pi pi-search" />
  <input type="text" pInputText placeholder="Search" />
</p-iconfield>
```

### Form Guidelines

- Always bind to Reactive Forms
- Use `p-floatLabel` for better UX
- Show validation errors with `p-message` or inline messages
- Use appropriate input types from PrimeNG

## Loading States ⏳

### Progress Spinner

```html
<p-progressSpinner *ngIf="isLoading()" />
```

### Skeleton Loaders

```html
<p-skeleton width="100%" height="4rem" />
```

### Button Loading

```html
<p-button 
  label="Save" 
  [loading]="isSaving()" />
```

## Messages & Notifications 📢

### Toast Messages

```typescript
// Inject service
messageService = inject(MessageService);

// Show toast
this.messageService.add({
  severity: 'success',
  summary: 'Success',
  detail: 'Item saved successfully'
});
```

### Inline Messages

```html
<p-message severity="error" text="Invalid email format" />
```

## Best Practices

- ✅ Import only the components you need (tree-shakeable)
- ✅ Configure PrimeNG theme in `angular.json`
- ✅ Use PrimeNG services (ConfirmationService, MessageService, DialogService)
- ✅ Leverage PrimeNG's built-in animations and transitions
- ✅ Always check PrimeNG docs before creating custom components
- ❌ Never create custom alternatives when PrimeNG component exists
