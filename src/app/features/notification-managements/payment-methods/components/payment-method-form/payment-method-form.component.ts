import { Component, ChangeDetectionStrategy, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';

import { PaymentMethod } from '../../models';

@Component({
  selector: 'app-payment-method-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DrawerModule,
    InputTextModule,
    ToggleSwitchModule,
    ButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-method-form.component.html',
  styleUrl: './payment-method-form.component.scss'
})
export class PaymentMethodFormComponent {
  visible = input.required<boolean>();
  method = input<PaymentMethod | null>(null);

  visibleChange = output<boolean>();
  save = output<Partial<PaymentMethod>>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      isActive: [true]
    });

    // Update form when method changes
    effect(() => {
      const currentMethod = this.method();
      if (currentMethod) {
        this.form.patchValue({
          name: currentMethod.name,
          isActive: currentMethod.isActive
        });
      } else {
        this.form.reset({ isActive: true });
      }
    });
  }

  get isEditMode(): boolean {
    return !!this.method();
  }

  get drawerTitle(): string {
    return this.isEditMode ? 'Editar Método de Pago' : 'Nuevo Método de Pago';
  }

  onHide(): void {
    this.visibleChange.emit(false);
    this.form.reset({ isActive: true });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      this.save.emit(formValue);
      this.onHide();
    } else {
      this.form.markAllAsTouched();
    }
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return 'Mínimo 3 caracteres';
    }
    return '';
  }
}
