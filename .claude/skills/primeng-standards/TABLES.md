# PrimeNG Table Patterns 📊

## Table Structure

**ALWAYS** use `p-table` component for tabular data with this standard structure:

```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200">
  <p-table
    [value]="items()"
    [loading]="loading()"
    [paginator]="true"
    [rows]="10"
    [rowsPerPageOptions]="[5, 10, 25, 50]"
    [showCurrentPageReport]="true"
    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} {entityName}"
    responsiveLayout="scroll"
    styleClass="p-datatable-striped p-datatable-gridlines">

    <!-- Column headers -->
    <ng-template pTemplate="header">
      <tr>
        <th class="w-16">ID</th>
        <th class="w-32">Name</th>
        <th class="w-24 text-center">Status</th>
        <th class="w-12 text-center">Actions</th>
      </tr>
    </ng-template>

    <!-- Table rows -->
    <ng-template pTemplate="body" let-item>
      <tr>
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td class="text-center">
          <p-tag
            [value]="item.status ? 'Active' : 'Inactive'"
            [severity]="item.status ? 'success' : 'danger'">
          </p-tag>
        </td>
        <td class="text-center">
          <!-- Action menu here -->
        </td>
      </tr>
    </ng-template>

    <!-- Empty state -->
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="4" class="text-center py-8">
          <i class="pi pi-info-circle text-4xl text-gray-400 mb-4 block"></i>
          <span class="text-gray-500">No records found</span>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>
```

## Pagination Design Pattern ⚡

### Critical Layout Rule

**The paginator MUST be displayed in a single horizontal row** with all elements aligned inline.

```
| Mostrando 1 a 10 de 100 registros  « < 1 > »  [10▼] |
```

❌ **WRONG**: Elements stacked vertically
✅ **CORRECT**: All elements in one horizontal line

### Required Configuration

```html
<p-table
  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[5, 10, 25, 50]"
  [showCurrentPageReport]="true"
  currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros">
```

### Paginator SCSS (Required)

Add this to your component's SCSS to ensure correct layout:

```scss
.your-container {
  ::ng-deep {
    .p-paginator {
      display: flex;
      flex-wrap: nowrap;           // Keep everything in one line
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.5rem 1rem;

      .p-paginator-current {
        margin-inline-end: auto;   // Push to left
      }

      .p-paginator-pages {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .p-dropdown {
        margin-inline-start: 0.5rem;
        width: 80px;                // Fixed width (don't expand)
        min-width: 80px;
      }
    }
  }
}
```

### Layout Breakdown

```
|-------------------------------------------------------------|
| [Mostrando 1 a 10 de 100]  [« < 1 2 3 > »]  [10 ▼]        |
|-------------------------------------------------------------|
  ↑ Left aligned              ↑ Center        ↑ Right (80px)
  (auto margin-right)                           (fixed width)
```

## Action Menu Pattern

**ALWAYS** use vertical three-dot menu for row actions:

```html
<td class="text-center">
  <p-button
    icon="pi pi-ellipsis-v"
    [rounded]="true"
    [text]="true"
    severity="secondary"
    (onClick)="menu.toggle($event)"
    size="small">
  </p-button>
  <p-menu #menu [model]="getMenuItems(item)" [popup]="true" />
</td>
```

```typescript
getMenuItems(item: YourEntity): MenuItem[] {
  return [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.edit(item)
    },
    {
      label: item.status ? 'Deactivate' : 'Activate',
      icon: item.status ? 'pi pi-ban' : 'pi pi-check',
      command: () => this.toggleStatus(item)
    },
    {
      separator: true
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => this.delete(item),
      styleClass: 'text-red-500'
    }
  ];
}
```

## Column Width Classes

Use Tailwind width utilities for consistent column sizing:

- `w-12` - Extra small (actions, icons)
- `w-16` - Small (ID, short codes)
- `w-20` - Medium (dates, numbers)
- `w-24` - Regular (status, short text)
- `w-32` - Large (names, titles)
- `w-full` or no class - Flexible width

## Empty State Pattern

Always provide a meaningful empty state:

```html
<ng-template pTemplate="emptymessage">
  <tr>
    <td [attr.colspan]="totalColumns" class="text-center py-8">
      <i class="pi pi-info-circle text-4xl text-gray-400 mb-4 block"></i>
      <span class="text-gray-500">
        No {entityName} found for this company
      </span>
    </td>
  </tr>
</ng-template>
```

## Pagination Types

### Local Pagination (Small Datasets < 1000 items)

```typescript
biometrics = signal<Biometric[]>([]);

// Load all data at once
loadData() {
  this.service.getAll().subscribe(data => {
    this.biometrics.set(data);
  });
}
```

```html
<p-table
  [value]="biometrics()"
  [paginator]="true"
  [rows]="10">
  <!-- PrimeNG handles pagination automatically -->
</p-table>
```

### Server-Side Pagination (Large Datasets > 1000 items)

```typescript
displayedItems = signal<Item[]>([]);
totalRecords = signal(0);
currentPage = signal(1);
pageSize = signal(10);

loadData() {
  this.service.getPaginated(
    this.currentPage(),
    this.pageSize()
  ).subscribe(response => {
    this.displayedItems.set(response.items);
    this.totalRecords.set(response.totalCount);
  });
}

onPageChange(event: any) {
  this.currentPage.set(event.page + 1); // PrimeNG is 0-based
  this.pageSize.set(event.rows);
  this.loadData();
}
```

```html
<p-table
  [value]="displayedItems()"
  [paginator]="true"
  [rows]="pageSize()"
  [totalRecords]="totalRecords()"
  [lazy]="true"
  (onPage)="onPageChange($event)">
  <!-- You handle pagination manually -->
</p-table>
```

## Loading State

```typescript
loading = signal(false);
```

```html
<p-table
  [value]="items()"
  [loading]="loading()">
  <!-- Table shows spinner automatically -->
</p-table>
```

## Complete Example

See `biometric-list.component` for a complete working example with:
- Proper pagination layout
- Action menu with three dots
- Loading states
- Empty state messaging
- Fixed-width dropdown (80px)
