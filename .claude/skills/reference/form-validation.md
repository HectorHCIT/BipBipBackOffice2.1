# Form Validation Reference

Patterns and helpers for form validation in Angular with PrimeNG.

## Validation Helper Methods

### hasError Method

```typescript
hasError(field: string, error?: string): boolean {
  const control = this.form.get(field);
  if (!control) return false;

  if (error) {
    return control.hasError(error) && (control.dirty || control.touched);
  }
  return control.invalid && (control.dirty || control.touched);
}
```

### getErrorMessage Method

```typescript
getErrorMessage(field: string): string {
  const control = this.form.get(field);
  if (!control?.errors) return '';

  if (control.hasError('required')) {
    return 'Campo requerido';
  }

  if (control.hasError('email')) {
    return 'Email inválido';
  }

  if (control.hasError('minlength')) {
    const min = control.errors['minlength'].requiredLength;
    return `Mínimo ${min} caracteres`;
  }

  if (control.hasError('maxlength')) {
    const max = control.errors['maxlength'].requiredLength;
    return `Máximo ${max} caracteres`;
  }

  if (control.hasError('min')) {
    const min = control.errors['min'].min;
    return `Valor mínimo: ${min}`;
  }

  if (control.hasError('max')) {
    const max = control.errors['max'].max;
    return `Valor máximo: ${max}`;
  }

  if (control.hasError('pattern')) {
    return 'Formato inválido';
  }

  return 'Campo inválido';
}
```

## Template Validation Display

### Basic Error Display

```html
<div class="flex flex-col gap-2">
  <label for="name" class="font-medium">
    Nombre <span class="text-danger-500">*</span>
  </label>
  <input
    pInputText
    id="name"
    formControlName="name"
    [class.ng-invalid]="hasError('name')"
    [class.ng-dirty]="form.get('name')?.dirty"
  />
  @if (hasError('name')) {
    <small class="text-danger-500">{{ getErrorMessage('name') }}</small>
  }
</div>
```

### Conditional Error Messages

```html
<input pInputText formControlName="email" />
@if (hasError('email', 'required')) {
  <small class="text-danger-500">Email requerido</small>
}
@else if (hasError('email', 'email')) {
  <small class="text-danger-500">Email inválido</small>
}
```

## Common Validators

### Built-in Validators

```typescript
import { Validators } from '@angular/forms';

this.form = this.fb.group({
  // Required
  name: ['', Validators.required],

  // Email
  email: ['', [Validators.required, Validators.email]],

  // Length
  password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)]],

  // Number range
  age: [null, [Validators.min(18), Validators.max(100)]],

  // Pattern (phone)
  phone: ['', Validators.pattern(/^\d{10}$/)],

  // Multiple validators
  username: ['', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(20),
    Validators.pattern(/^[a-zA-Z0-9_]+$/)
  ]]
});
```

### Custom Validators

```typescript
// Custom validator function
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) return null;

  return password.value === confirmPassword.value
    ? null
    : { passwordMismatch: true };
}

// Usage
this.form = this.fb.group({
  password: ['', Validators.required],
  confirmPassword: ['', Validators.required]
}, { validators: passwordMatchValidator });

// Error message
if (this.form.hasError('passwordMismatch')) {
  return 'Las contraseñas no coinciden';
}
```

## Validation Patterns

### Pattern: Email

```typescript
Validators.email
Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
```

### Pattern: Phone (10 digits)

```typescript
Validators.pattern(/^\d{10}$/)
```

### Pattern: Phone (formatted)

```typescript
Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)  // (123) 456-7890
```

### Pattern: Alphanumeric

```typescript
Validators.pattern(/^[a-zA-Z0-9]+$/)
```

### Pattern: Username

```typescript
Validators.pattern(/^[a-zA-Z0-9_]{3,20}$/)
```

### Pattern: URL

```typescript
Validators.pattern(/^https?:\/\/.+/)
```

## Form State Helpers

### Check Form Validity

```typescript
isFormValid(): boolean {
  return this.form.valid;
}

isFormInvalid(): boolean {
  return this.form.invalid;
}

isFormDirty(): boolean {
  return this.form.dirty;
}

isFormTouched(): boolean {
  return this.form.touched;
}
```

### Mark All as Touched

```typescript
markAllAsTouched(): void {
  this.form.markAllAsTouched();
}

// Use before submit to show all errors
save(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  // Save logic
}
```

### Reset Form

```typescript
resetForm(): void {
  this.form.reset();
}

resetWithDefaults(): void {
  this.form.reset({
    name: '',
    isActive: true,
    status: 'pending'
  });
}
```

## Validation Styles

### CSS Classes

```css
/* PrimeNG automatically adds these classes */
.ng-valid { }       /* Control is valid */
.ng-invalid { }     /* Control is invalid */
.ng-dirty { }       /* Control has been changed */
.ng-touched { }     /* Control has been blurred */
.ng-pristine { }    /* Control hasn't been changed */
.ng-untouched { }   /* Control hasn't been blurred */
```

### Custom Input Styling

```html
<input
  pInputText
  formControlName="name"
  [class.p-invalid]="hasError('name')"
/>
```

## Complete Form Example

```typescript
@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      age: [null, [Validators.required, Validators.min(18), Validators.max(100)]],
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      isActive: [true]
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = this.form.value;
    // Save logic
  }

  hasError(field: string, error?: string): boolean {
    const control = this.form.get(field);
    if (!control) return false;

    if (error) {
      return control.hasError(error) && (control.dirty || control.touched);
    }
    return control.invalid && (control.dirty || control.touched);
  }

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
    if (control.hasError('min')) {
      return `Valor mínimo: ${control.errors['min'].min}`;
    }
    if (control.hasError('max')) {
      return `Valor máximo: ${control.errors['max'].max}`;
    }

    return 'Campo inválido';
  }
}
```

---

**Always validate on both client and server side for security!**
