---
description: Estándares de calidad de código, accesibilidad, manejo de errores y estados de carga. Usa esto para revisar código, implementar mejores prácticas, mejorar performance y asegurar accesibilidad.
---

# Code Quality & Performance Standards 🚀

## Proactive Code Review

**ALWAYS** suggest improvements when you see opportunities to enhance:
- Code quality
- Performance
- Accessibility
- User experience
- Type safety
- Error handling

## Areas to Watch For

### 1. Code Simplification

Look for:
- Redundant code that can be simplified
- Repeated logic that should be extracted
- Overly complex conditionals
- Duplicate code across components

### 2. Performance Optimization

Identify:
- Unnecessary re-renders
- Heavy computations in templates
- Missing `trackBy` functions in `@for` loops
- Unsubscribed observables
- Large bundle sizes

```typescript
// ✅ Good - use trackBy for performance
@for (item of items(); track item.id) {
  <app-item [data]="item" />
}

// ❌ Bad - missing trackBy causes unnecessary re-renders
@for (item of items(); track $index) {
  <app-item [data]="item" />
}
```

### 3. Type Safety

Ensure:
- No `any` types
- Proper interface definitions
- Type guards where needed
- Correct generic usage

### 4. Signal Usage Patterns

Verify:
- Appropriate use of `signal()`, `computed()`, and `effect()`
- No unnecessary signal updates
- Proper read-only signals
- Correct signal composition

## Accessibility Standards ♿

### ARIA Labels

Always add proper ARIA labels to interactive elements:

```html
<!-- ✅ Good - has aria-label -->
<button 
  pButton 
  icon="pi pi-trash"
  aria-label="Delete user"
  (onClick)="delete()">
</button>

<!-- ❌ Bad - missing aria-label -->
<button 
  pButton 
  icon="pi pi-trash"
  (onClick)="delete()">
</button>
```

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```typescript
@Component({
  host: {
    '(keydown.enter)': 'onEnter()',
    '(keydown.space)': 'onSpace()',
    '[attr.tabindex]': '0',
    '[attr.role]': '"button"'
  }
})
```

### Semantic HTML

Use proper semantic elements:

```html
<!-- ✅ Good - semantic structure -->
<nav>
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Page Title</h1>
    <section>Content</section>
  </article>
</main>

<!-- ❌ Bad - div soup -->
<div class="nav">
  <div class="menu">
    <div><a href="/home">Home</a></div>
  </div>
</div>
```

### Alternative Text

Provide alt text for all images:

```html
<!-- ✅ Good -->
<img 
  ngSrc="logo.png"
  alt="Company logo"
  width="200"
  height="50">

<!-- ❌ Bad - missing alt -->
<img ngSrc="logo.png" width="200" height="50">
```

### Color Contrast

Ensure sufficient color contrast for text:
- Normal text: 4.5:1 minimum ratio
- Large text: 3:1 minimum ratio
- Use browser DevTools to check contrast

### Screen Reader Testing

Test with screen readers in mind:
- Logical reading order
- Descriptive labels
- Proper heading hierarchy
- Form field associations

## Error Handling 🛡️

### HTTP Errors

Always handle errors in services:

```typescript
getUsers(): Observable<User[]> {
  return this.http.get<User[]>(this.apiUrl).pipe(
    catchError(error => {
      console.error('Error fetching users:', error);
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load users'
      });
      
      return throwError(() => error);
    })
  );
}
```

### User-Friendly Messages

Show clear, actionable error messages:

```typescript
// ✅ Good - helpful message
this.messageService.add({
  severity: 'error',
  summary: 'Save Failed',
  detail: 'Unable to save changes. Please check your connection and try again.'
});

// ❌ Bad - cryptic message
this.messageService.add({
  severity: 'error',
  summary: 'Error',
  detail: error.message
});
```

### Form Validation Errors

Display validation errors clearly:

```html
<p-floatLabel>
  <input 
    pInputText 
    id="email" 
    formControlName="email" />
  <label for="email">Email</label>
</p-floatLabel>

@if (form.controls.email.invalid && form.controls.email.touched) {
  <small class="text-red-500">
    @if (form.controls.email.errors?.['required']) {
      Email is required
    }
    @if (form.controls.email.errors?.['email']) {
      Please enter a valid email
    }
  </small>
}
```

## Loading States ⏳

### Show Loading Indicators

Always indicate when operations are in progress:

```typescript
export class MyComponent {
  isLoading = signal(false);
  
  loadData() {
    this.isLoading.set(true);
    
    this.service.getData().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.isLoading.set(false);
      }
    });
  }
}
```

### Loading UI Components

Use appropriate loading indicators:

```html
<!-- Spinner for full page loading -->
@if (isLoading()) {
  <p-progressSpinner />
}

<!-- Skeleton for better UX -->
@if (isLoading()) {
  <p-skeleton width="100%" height="4rem" />
  <p-skeleton width="100%" height="4rem" />
} @else {
  <app-content [data]="data()" />
}

<!-- Button loading state -->
<p-button 
  label="Save" 
  [loading]="isSaving()" 
  (onClick)="save()" />

<!-- Table loading state -->
<p-table 
  [value]="items()"
  [loading]="isLoading()">
</p-table>
```

## Empty States

Always handle empty data states:

```html
@if (items().length === 0 && !isLoading()) {
  <div class="empty-state">
    <i class="pi pi-inbox text-4xl text-gray-400"></i>
    <p class="text-gray-500 mt-3">No items found</p>
    <p-button 
      label="Create New" 
      icon="pi pi-plus"
      (onClick)="create()" />
  </div>
} @else {
  <p-table [value]="items()">
    <!-- table content -->
  </p-table>
}
```

## Performance Best Practices

### OnPush Change Detection

Always use OnPush strategy:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Lazy Loading

Implement lazy loading for routes:

```typescript
const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/user-list.page').then(m => m.UserListPage)
  }
];
```

### Unsubscribe from Observables

Use `takeUntilDestroyed()` to prevent memory leaks:

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class MyComponent {
  private destroyRef = inject(DestroyRef);
  
  ngOnInit() {
    this.service.getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        // handle data
      });
  }
}
```

## Code Review Checklist ✅

When reviewing or writing code, check:

- [ ] No `any` types used
- [ ] Proper error handling implemented
- [ ] Loading states shown
- [ ] Empty states handled
- [ ] ARIA labels added
- [ ] Keyboard navigation works
- [ ] Alt text for images
- [ ] Color contrast is sufficient
- [ ] OnPush change detection used
- [ ] Observables properly unsubscribed
- [ ] Forms have validation messages
- [ ] Code is DRY (Don't Repeat Yourself)
- [ ] Performance optimizations applied
- [ ] User-friendly error messages

## Summary

Always strive for:
- 🎯 Clean, maintainable code
- ⚡ Optimal performance
- ♿ Full accessibility
- 🛡️ Robust error handling
- ⏳ Clear loading states
- 💡 Proactive improvements
