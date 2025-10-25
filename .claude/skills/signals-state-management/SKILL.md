---
description: Manejo de estado con signals y el patrón de contexto global de compañía. Usa esto cuando trabajes con estado local, estado derivado, o necesites acceder a la compañía seleccionada globalmente.
---

# Angular State Management with Signals 📊

## Signal-Based State

Use signals for all local component state:

```typescript
export class MyComponent {
  // Local state
  count = signal(0);
  name = signal('');
  items = signal<Item[]>([]);
}
```

## Derived State with computed()

Use `computed()` for derived state - it's reactive and memoized:

```typescript
export class MyComponent {
  items = signal<Item[]>([]);
  searchTerm = signal('');
  
  // Automatically recalculates when items or searchTerm change
  filteredItems = computed(() => {
    return this.items().filter(item => 
      item.name.includes(this.searchTerm())
    );
  });
  
  itemCount = computed(() => this.items().length);
}
```

## State Transformations

- Keep state transformations pure and predictable
- **DO NOT** use `mutate` on signals
- Use `update` or `set` instead:

```typescript
// ✅ Correct
this.items.update(items => [...items, newItem]);
this.count.set(10);

// ❌ Avoid
this.items.mutate(items => items.push(newItem));
```

## API Data Handling

**DO NOT** transform data received from endpoints:

- Always use the data structure provided by the API
- Let the backend define the data shape
- If transformation is needed, do it in the service layer, not in components

## Global Company Context Pattern 🏢

**ALWAYS** use the `CompanyContextService` for accessing the selected company across the application.

### Service Location

`src/app/core/services/company-context.service.ts`

### Key Features

- Signal-based global state for selected company
- Automatic localStorage persistence
- Auto-recovery on page refresh
- Type-safe company context

### Usage in Feature Modules

```typescript
import { CompanyContextService } from '@core/services';

export class MyFeatureListComponent {
  private companyContext = inject(CompanyContextService);
  selectedCompany = this.companyContext.selectedCompany;

  constructor() {
    // React to company changes automatically
    effect(() => {
      const company = this.selectedCompany();
      if (company) {
        console.log('🏢 Company changed:', company);
        this.currentPage.set(1);
        this.loadData();
      }
    });
  }

  loadData() {
    const company = this.selectedCompany();
    if (!company) {
      console.warn('⚠️ No company selected');
      return;
    }

    // Use company.companyId for API calls
    this.myService.getData(company.companyId, this.currentPage(), this.pageSize())
      .subscribe({...});
  }
}
```

### CompanyContext Interface

```typescript
interface CompanyContext {
  companyId: number;
  companyName: string;
}
```

### Best Practices

- ✅ **ALWAYS** check if company exists before making API calls
- ✅ Use `effect()` to automatically reload data when company changes
- ✅ Reset pagination when company changes (set currentPage to 1)
- ✅ Access via `selectedCompany()` signal - it's readonly
- ❌ **NEVER** store company ID in local component state
- ❌ **NEVER** pass company ID through route params for this purpose

## State Management Principles

1. **Single Source of Truth**: Don't duplicate state
2. **Reactive by Default**: Use signals and computed for reactivity
3. **Immutable Updates**: Always create new references when updating
4. **Predictable**: State changes should be easy to trace
5. **Type-Safe**: Always type your signals properly
