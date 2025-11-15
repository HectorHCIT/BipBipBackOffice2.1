# Migrating Modules

Guides the migration of legacy NgModule-based Angular modules from `old/src/app/modules/` to the modern standalone component architecture with signals in `src/app/features/`. Provides step-by-step workflow, key transformations, and references to detailed patterns for architecture, components, forms, and services.

## Table of Contents

- [Overview](#overview)
- [Migration Workflow](#migration-workflow)
- [Key Transformations](#key-transformations)
- [Critical Rules](#critical-rules)
- [Testing Checklist](#testing-checklist)
- [Common Pitfalls](#common-pitfalls)
- [Related Skills](#related-skills)

## Overview

This is the **main skill** for Angular module migration. Use it to:
- Understand the complete migration process
- Follow a systematic workflow
- Access detailed patterns via related skills
- Ensure quality with checklists

**Migration Flow**: Old NgModule → Analyze → Plan → Migrate Models → Services → Components → Pages → Routes → Test

## Migration Workflow

### Step 1: Analyze Old Module

Locate the module in `old/src/app/modules/{module-name}/` and document:

- [ ] List all components (pages, forms, dialogs)
- [ ] Identify services and their dependencies
- [ ] Map routing structure and route names
- [ ] List external dependencies and PrimeNG needs
- [ ] Identify custom UI components to replace

**Output**: Create a migration plan document with component mapping.

### Step 2: Plan New Structure

Determine the new architecture:

- [ ] Choose feature area: `accounting/`, `maintenance/`, `sac/`, etc.
- [ ] Decide pages vs drawers for forms/details
- [ ] Preserve original route names (critical!)
- [ ] List required PrimeNG components

**Reference**: See [organizing-architecture](organizing-architecture.md) for folder structure patterns.

### Step 3: Create Feature Skeleton

```bash
src/app/features/{feature-area}/{feature-name}/
├── components/      # Reusable components (forms, filters)
├── models/          # TypeScript interfaces
├── pages/           # Page components (routes)
├── services/        # Business logic with signals
└── {name}.routes.ts # Route configuration
```

### Step 4: Migrate in Order

Follow this sequence to avoid dependency issues:

**1. Models First**
- Create TypeScript interfaces
- Define request/response types
- **Reference**: [organizing-architecture](organizing-architecture.md#models-organization)

**2. Services Second**
- Migrate with signal pattern
- Integrate with DataService
- **Reference**: [building-services](building-services.md)

**3. Components Third**
- Start with simple reusable components
- Use PrimeNG only (no custom UI)
- **Reference**: [implementing-components](implementing-components.md)

**4. Forms Fourth**
- Create drawer-based forms
- Reactive Forms with validation
- **Reference**: [creating-forms](creating-forms.md)

**5. Pages Fifth**
- Migrate page components
- Wire up components and services
- **Reference**: [implementing-components](implementing-components.md#page-component-pattern)

**6. Routes Last**
- Configure lazy loading
- Preserve original route names
- **Reference**: [organizing-architecture](organizing-architecture.md#routing-architecture)

## Key Transformations

### NgModule → Standalone Component

```typescript
// OLD
@NgModule({
  declarations: [CompanyComponent],
  imports: [CommonModule, FormsModule],
  providers: [CompanyService]
})
export class CompanyModule { }

// NEW
@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyComponent { }
```

### Decorators → Functions

```typescript
// OLD
@Input() companyId!: number;
@Output() onSave = new EventEmitter<void>();

// NEW
readonly companyId = input<number>();
readonly onSave = output<void>();
```

### Template Directives → Control Flow

```typescript
// OLD
<div *ngIf="isVisible">Content</div>
<div *ngFor="let item of items">{{ item }}</div>

// NEW
@if (isVisible()) {
  <div>Content</div>
}
@for (item of items(); track item.id) {
  <div>{{ item }}</div>
}
```

**Full transformation patterns**: See [implementing-components](implementing-components.md#migration-patterns)

## Critical Rules

### 1. Always Use PrimeNG

**Never create custom UI components!**

| Need | Use | Import |
|------|-----|--------|
| Table | `<p-table>` | `TableModule` |
| Modal | `<p-dialog>` or `<p-drawer>` | `DialogModule`, `DrawerModule` |
| Dropdown | `<p-select>` | `SelectModule` |
| Button | `<p-button>` | `ButtonModule` |
| Input | `<p-inputtext>` | `InputTextModule` |

**Full component reference**: [reference/primeng-components](reference/primeng-components.md)

### 2. No Hardcoded Colors

```html
<!-- ✅ CORRECT -->
<div class="bg-primary-500 text-white">Primary</div>
<div [style.color]="'var(--p-primary-color)'">Text</div>

<!-- ❌ WRONG -->
<div style="background: #FB0021">Bad!</div>
```

### 3. Preserve Route Names

```typescript
// OLD route: 'company-management/list'
// NEW route: 'company-management/list'  ← Keep exactly the same!
```

### 4. Use Drawers for Forms

Forms should open in drawers (side panels), not separate routes.

**Pattern**: [creating-forms](creating-forms.md#drawer-pattern-for-forms)

### 5. Signals for State

```typescript
// Use signals for all component state
readonly isLoading = signal<boolean>(false);
readonly items = signal<Item[]>([]);

// Use computed for derived state
readonly hasItems = computed(() => this.items().length > 0);
```

**Full signal patterns**: [reference/signal-patterns](reference/signal-patterns.md)

## Testing Checklist

After migration, verify:

- [ ] All routes work with lazy loading
- [ ] Data loads correctly from API
- [ ] Forms validate and submit properly
- [ ] Drawers/dialogs open and close
- [ ] Filters and search work
- [ ] Pagination works (server-side)
- [ ] Dark mode works correctly
- [ ] No hardcoded colors anywhere
- [ ] Only PrimeNG components used
- [ ] Change detection is OnPush on all components
- [ ] All signals called as functions `signal()`
- [ ] No console errors or warnings

## Common Pitfalls

1. ❌ Creating custom UI components → Use PrimeNG
2. ❌ Using hardcoded colors → Use CSS variables or Tailwind
3. ❌ Changing route names → Keep original names
4. ❌ Using NgModules → Always standalone
5. ❌ Using `*ngIf/*ngFor` → Use `@if/@for`
6. ❌ Using `@Input/@Output` → Use `input()/output()`
7. ❌ Missing OnPush → Always set `ChangeDetectionStrategy.OnPush`
8. ❌ Not using signals → Use signals for all state
9. ❌ Separate routes for forms → Use drawers
10. ❌ Writing custom CSS → Use Tailwind + PrimeNG

## Related Skills

- **[organizing-architecture](organizing-architecture.md)** - Folder structure, naming conventions, routing patterns
- **[implementing-components](implementing-components.md)** - Component patterns, signals, lifecycle
- **[creating-forms](creating-forms.md)** - Drawer forms, PrimeNG components, validation
- **[building-services](building-services.md)** - Services with signals, API integration, state management

## Example Migration

```
OLD: old/src/app/modules/companies/
├── companies.module.ts           → DELETE
├── companies-routing.module.ts   → companies.routes.ts
├── companies.component.ts        → pages/companies-list/
├── company-form.component.ts     → components/company-form/ (drawer)
├── company.service.ts            → services/company.service.ts (with signals)
└── company.model.ts              → models/company.model.ts

NEW: src/app/features/accounting/companies/
├── components/
│   └── company-form/             # Drawer component
├── models/
│   └── company.model.ts
├── pages/
│   └── companies-list/           # Main list page
├── services/
│   └── company.service.ts        # With signals
└── companies.routes.ts
```

---

**Remember**: Quality over speed. Follow all patterns systematically for consistent, maintainable code.
