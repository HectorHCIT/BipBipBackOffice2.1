# Signal Patterns Reference

Advanced patterns for Angular signals including effects, computed signals, and reactive state management.

## Signal Types

### Writable Signals

```typescript
// Basic signal
readonly count = signal<number>(0);
readonly items = signal<Item[]>([]);

// Update methods
this.count.set(10);                              // Replace value
this.count.update(current => current + 1);       // Update based on current
this.items.update(items => [...items, newItem]); // Immutable update
```

### Computed Signals

```typescript
// Derive state from other signals
readonly count = signal<number>(0);
readonly doubleCount = computed(() => this.count() * 2);

// Multi-signal computed
readonly items = signal<Item[]>([]);
readonly filter = signal<string>('');
readonly filteredItems = computed(() =>
  this.items().filter(item => item.name.includes(this.filter()))
);

// Conditional computed
readonly isLoading = signal<boolean>(false);
readonly hasData = signal<boolean>(false);
readonly showContent = computed(() => !this.isLoading() && this.hasData());
```

### Readonly Signals

```typescript
// Expose read-only version
private readonly _data = signal<Data | null>(null);
readonly data = this._data.asReadonly();

// Use for encapsulation
private readonly _count = signal<number>(0);
readonly count = this._count.asReadonly();

increment(): void {
  this._count.update(c => c + 1);
}
```

## Common Patterns

### Loading State Pattern

```typescript
readonly isLoading = signal<boolean>(false);
readonly data = signal<Data[]>([]);
readonly error = signal<string | null>(null);

loadData(): void {
  this.isLoading.set(true);
  this.error.set(null);

  this.dataService.getData().subscribe({
    next: (data) => {
      this.data.set(data);
      this.isLoading.set(false);
    },
    error: (err) => {
      this.error.set(err.message);
      this.isLoading.set(false);
    }
  });
}
```

### Pagination Pattern

```typescript
readonly items = signal<Item[]>([]);
readonly currentPage = signal<number>(0);
readonly pageSize = signal<number>(10);
readonly totalRecords = signal<number>(0);

// Computed pagination info
readonly totalPages = computed(() =>
  Math.ceil(this.totalRecords() / this.pageSize())
);
readonly hasNextPage = computed(() =>
  this.currentPage() < this.totalPages() - 1
);
readonly hasPrevPage = computed(() => this.currentPage() > 0);

nextPage(): void {
  if (this.hasNextPage()) {
    this.currentPage.update(page => page + 1);
    this.loadData();
  }
}
```

### Filter Pattern

```typescript
readonly items = signal<Item[]>([]);
readonly searchTerm = signal<string>('');
readonly statusFilter = signal<string | null>(null);
readonly categoryFilter = signal<string | null>(null);

// Multi-filter computed
readonly filteredItems = computed(() => {
  let result = this.items();

  const search = this.searchTerm();
  if (search) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  const status = this.statusFilter();
  if (status) {
    result = result.filter(item => item.status === status);
  }

  const category = this.categoryFilter();
  if (category) {
    result = result.filter(item => item.category === category);
  }

  return result;
});

// Clear all filters
clearFilters(): void {
  this.searchTerm.set('');
  this.statusFilter.set(null);
  this.categoryFilter.set(null);
}
```

### Selection Pattern

```typescript
readonly items = signal<Item[]>([]);
readonly selectedIds = signal<Set<number>>(new Set());

// Computed selection state
readonly selectedItems = computed(() =>
  this.items().filter(item => this.selectedIds().has(item.id))
);
readonly hasSelection = computed(() => this.selectedIds().size > 0);
readonly isAllSelected = computed(() =>
  this.items().length > 0 &&
  this.items().every(item => this.selectedIds().has(item.id))
);

toggleSelection(id: number): void {
  this.selectedIds.update(ids => {
    const newIds = new Set(ids);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    return newIds;
  });
}

toggleAll(): void {
  if (this.isAllSelected()) {
    this.selectedIds.set(new Set());
  } else {
    this.selectedIds.set(new Set(this.items().map(item => item.id)));
  }
}
```

### Sorting Pattern

```typescript
readonly items = signal<Item[]>([]);
readonly sortField = signal<keyof Item>('name');
readonly sortDirection = signal<'asc' | 'desc'>('asc');

readonly sortedItems = computed(() => {
  const items = [...this.items()];
  const field = this.sortField();
  const direction = this.sortDirection();

  return items.sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
});

sort(field: keyof Item): void {
  if (this.sortField() === field) {
    this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
  } else {
    this.sortField.set(field);
    this.sortDirection.set('asc');
  }
}
```

## Effects (Use Sparingly!)

Effects run side effects when signals change. Use only for:
- Logging/analytics
- Local storage sync
- External API calls (non-HTTP)

```typescript
import { effect } from '@angular/core';

constructor() {
  // Log signal changes
  effect(() => {
    console.log('Search term:', this.searchTerm());
  });

  // Sync to localStorage
  effect(() => {
    localStorage.setItem('theme', this.theme());
  });

  // Multiple signal dependencies
  effect(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    console.log(`Loading page ${page} with size ${size}`);
  });
}
```

**Warning**: Don't use effects for state derivation - use `computed()` instead!

## Best Practices

1. **Always call signals as functions** in templates and methods
2. **Use `computed()` for derived state**, not effects
3. **Use `update()` for immutable updates**, not `mutate()`
4. **Make signals `readonly`** when possible
5. **Avoid nested signal calls** in computed - flatten dependencies
6. **Use readonly wrappers** for encapsulation

---

**Signals provide reactive, performant state management - use them everywhere!**
