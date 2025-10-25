---
description: Patrones y mejores prácticas para crear componentes Angular con signals, forms, y lifecycle. Usa esto al crear o modificar componentes, especialmente formularios y componentes con estado.
---

# Angular Components Best Practices 🎯

## General Component Guidelines

- Always use **standalone components** (no NgModules)
- Must **NOT** set `standalone: true` inside decorators - it's the default
- Keep components small and focused on a single responsibility
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components

## Modern Angular APIs

### Inputs and Outputs

**ALWAYS** use the new function-based APIs:

```typescript
// ✅ Correct
export class MyComponent {
  name = input<string>(); // input signal
  nameChange = output<string>(); // output emitter
}

// ❌ Avoid
@Input() name: string;
@Output() nameChange = new EventEmitter<string>();
```

### Host Bindings

**DO NOT** use `@HostBinding` and `@HostListener` decorators:

```typescript
// ✅ Correct
@Component({
  host: {
    '(click)': 'onClick()',
    '[class.active]': 'isActive()'
  }
})

// ❌ Avoid
@HostListener('click') onClick() {}
@HostBinding('class.active') isActive: boolean;
```

## Form Component Lifecycle Pattern 🔄

**ALWAYS** implement this pattern for form components that can create OR edit entities:

### 1. Use `effect()` to Watch Input Changes

```typescript
constructor() {
  // Watch for changes in initial input to reset/populate form
  effect(() => {
    const initialData = this.initial();

    if (initialData === null) {
      // Drawer closed or creating new record - reset form completely
      this.resetForm();
    } else if (initialData) {
      // Editing existing record - populate form
      this.patchInitial(initialData);
    }
  });
}
```

### 2. Implement Comprehensive `resetForm()` Method

```typescript
private resetForm() {
  // Reset form to default values
  this.form.reset({ 
    name: '',
    email: '',
    // ... other fields with default values
  });

  // Clear any uploaded documents, files, or additional state
  this.uploadedDocuments.set([]);

  // Clear computed/derived data (calculations, etc.)
  this.calculatedData.set(null);

  // Mark form as pristine and untouched
  this.form.markAsPristine();
  this.form.markAsUntouched();
}
```

### 3. Parent Component Pattern

```typescript
// In list/parent component
closeDrawer() {
  this.openDrawer.set(false);
  this.editingData.set(null);  // This triggers form reset via effect()
}
```

### Why This Pattern?

- ✅ Form always starts fresh when creating new records
- ✅ No stale data from previous edits
- ✅ Automatic cleanup when drawer/dialog closes
- ✅ Single source of truth for form state (the `initial` input)
- ✅ Works seamlessly with OnPush change detection

## Forms

- Prefer **Reactive forms** instead of Template-driven ones
- Always validate forms properly
- Use typed forms with proper interfaces

## Template Best Practices

- Do **NOT** use `ngClass`, use `class` bindings instead
- Do **NOT** use `ngStyle`, use `style` bindings instead
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`

```typescript
// ✅ Correct
@if (isVisible()) {
  <div>Content</div>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

// ❌ Avoid
<div *ngIf="isVisible">Content</div>
<div *ngFor="let item of items">{{ item.name }}</div>
```

## Images

- Use `NgOptimizedImage` for all static images
- Note: `NgOptimizedImage` does NOT work for inline base64 images

## Input Formatting Pattern 🎨

**ALWAYS** implement auto-formatting for inputs that require specific formats (MAC address, phone, credit card, etc.)

### Pattern: Auto-Format While Typing

```typescript
/**
 * Example: MAC Address Formatter
 * Auto-formats to XX:XX:XX:XX:XX:XX while user types
 */
formatMacAddress(event: Event): void {
  const input = event.target as HTMLInputElement;
  const cursorPosition = input.selectionStart || 0;
  let value = input.value.toUpperCase();

  // Step 1: Clean input - remove invalid characters
  const cleanValue = value.replace(/[^0-9A-F]/g, '');

  // Step 2: Limit length (12 hex chars = 6 pairs)
  const limitedValue = cleanValue.substring(0, 12);

  // Step 3: Format - add separator every 2 characters
  const formatted = limitedValue.match(/.{1,2}/g)?.join(':') || limitedValue;

  // Step 4: Calculate new cursor position
  const oldLength = value.length;
  const newLength = formatted.length;
  const lengthDiff = newLength - oldLength;
  const newCursorPosition = cursorPosition + lengthDiff;

  // Step 5: Update form control WITHOUT emitting event (prevents loops)
  this.form.get('macAddress')?.setValue(formatted, { emitEvent: false });

  // Step 6: Restore cursor position (setTimeout needed for DOM update)
  setTimeout(() => {
    if (input) {
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }
  }, 0);
}
```

### HTML Template

```html
<input
  id="macAddress"
  type="text"
  pInputText
  formControlName="macAddress"
  placeholder="Ingrese los caracteres hexadecimales"
  (input)="formatMacAddress($event)"
  maxlength="17"
  class="w-full">

<small class="text-gray-500 text-xs mt-1 block">
  Se formatea automáticamente (ej: "001122334455" → "00:11:22:33:44:55")
</small>
```

### Key Features

1. **Preserves Cursor Position**: User can edit anywhere in the input
2. **Uppercase Conversion**: Automatically converts to uppercase
3. **Character Filtering**: Only allows valid characters
4. **Length Limiting**: Prevents over-typing
5. **Auto-Separation**: Adds separators automatically
6. **No Event Emission**: Uses `{ emitEvent: false }` to prevent validation loops

### Other Common Formatters

#### Phone Number (XXX-XXXX-XXXX)

```typescript
formatPhoneNumber(event: Event): void {
  const input = event.target as HTMLInputElement;
  const cursorPosition = input.selectionStart || 0;
  let value = input.value;

  // Remove all non-digits
  const cleanValue = value.replace(/\D/g, '');
  const limitedValue = cleanValue.substring(0, 11); // Honduras: 8 digits

  // Format: XXXX-XXXX or XXXX-XXXX-XXXX for landlines
  let formatted = limitedValue;
  if (limitedValue.length > 4 && limitedValue.length <= 8) {
    formatted = `${limitedValue.slice(0, 4)}-${limitedValue.slice(4)}`;
  } else if (limitedValue.length > 8) {
    formatted = `${limitedValue.slice(0, 4)}-${limitedValue.slice(4, 8)}-${limitedValue.slice(8)}`;
  }

  const newCursorPosition = cursorPosition + (formatted.length - value.length);
  this.form.get('phone')?.setValue(formatted, { emitEvent: false });

  setTimeout(() => {
    input.setSelectionRange(newCursorPosition, newCursorPosition);
  }, 0);
}
```

#### Credit Card (XXXX XXXX XXXX XXXX)

```typescript
formatCreditCard(event: Event): void {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\s/g, ''); // Remove spaces

  const cleanValue = value.replace(/\D/g, ''); // Only digits
  const limitedValue = cleanValue.substring(0, 16); // Max 16 digits

  // Add space every 4 digits
  const formatted = limitedValue.match(/.{1,4}/g)?.join(' ') || limitedValue;

  this.form.get('cardNumber')?.setValue(formatted, { emitEvent: false });
}
```

#### Currency (Format as typing)

```typescript
formatCurrency(event: Event): void {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/[^0-9.]/g, ''); // Only numbers and dot

  // Ensure only one decimal point
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit decimals to 2 places
  if (parts[1]?.length > 2) {
    value = parts[0] + '.' + parts[1].substring(0, 2);
  }

  this.form.get('amount')?.setValue(value, { emitEvent: false });
}
```

### Best Practices

#### ✅ Do's

- Always preserve cursor position for good UX
- Use `{ emitEvent: false }` to prevent validation loops
- Add helpful placeholder and hint text
- Set appropriate `maxlength` attribute
- Use `setTimeout()` for cursor position (DOM update timing)
- Test with copy-paste scenarios
- Handle edge cases (empty input, partial input)

#### ❌ Don'ts

- Don't format on `blur` only - format while typing for better UX
- Don't move cursor to end - preserve user's editing position
- Don't forget to clean invalid characters first
- Don't allow unlimited length
- Don't emit form events during formatting (causes loops)
- Don't forget visual feedback (placeholder, helper text)

### Validation Pattern

Always combine formatting with proper validation:

```typescript
// In constructor or form initialization
this.form = this.fb.group({
  macAddress: ['', [
    Validators.required,
    Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
  ]]
});
```

### Real Example

See complete implementation in:

- `src/app/features/biometrics/components/biometric-form/biometric-form.component.ts` (lines 252-287)
- `src/app/features/biometrics/components/biometric-form/biometric-form.component.html` (lines 86-103)
