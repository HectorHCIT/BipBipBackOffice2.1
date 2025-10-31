import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  output,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';

import { RestaurantService } from '../../../../services/restaurant.service';
import type { Scale, CreateScaleRequest, UpdateScaleRequest } from '../../../../models/scale.model';

@Component({
  selector: 'app-scale-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule
  ],
  templateUrl: './scale-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScaleDialogComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly restaurantService = inject(RestaurantService);
  private readonly messageService = inject(MessageService);

  // Inputs
  readonly visible = input.required<boolean>();
  readonly mode = input.required<'create' | 'edit'>();
  readonly scale = input<Scale | null>(null);
  readonly restaurantId = input.required<number>();

  // Outputs
  readonly onClose = output<void>();
  readonly onSave = output<void>();

  // State
  readonly isSaving = signal<boolean>(false);
  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadScaleData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['scale'] || changes['mode']) && this.form) {
      this.loadScaleData();
    }
  }

  /**
   * Load scale data into form
   */
  private loadScaleData(): void {
    if (!this.form) return;

    const currentScale = this.scale();
    if (currentScale && this.mode() === 'edit') {
      this.form.patchValue({
        minimum: this.formatNumber(currentScale.minimum),
        maximum: this.formatNumber(currentScale.maximum),
        customerCharge: this.formatNumber(currentScale.customerCharge),
        deliveryPayment: this.formatNumber(currentScale.deliveryPayment),
        active: currentScale.active
      });
    } else if (this.mode() === 'create') {
      this.form.reset({
        minimum: '',
        maximum: '',
        customerCharge: 0,
        deliveryPayment: 0,
        active: true
      });
    }
  }

  /**
   * Format number to remove unnecessary decimal zeros
   * Examples: 1.0000 -> 1, 1.5000 -> 1.5, 1.2500 -> 1.25
   */
  private formatNumber(value: number | string): number {
    // Parse to float to remove trailing zeros
    return parseFloat(value.toString());
  }

  /**
   * Format number to string without unnecessary decimal zeros
   * Examples: 1.0000 -> "1", 1.5000 -> "1.5", 1.2500 -> "1.25"
   */
  private formatNumberToString(value: number | string): string {
    const num = parseFloat(value.toString());
    // Convert to string, which automatically removes trailing zeros
    return num.toString();
  }

  /**
   * Initialize form with validators
   */
  private initForm(): void {
    this.form = this.fb.group({
      minimum: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      maximum: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      customerCharge: [0, [Validators.required, Validators.min(0)]],
      deliveryPayment: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    }, { validators: this.rangeValidator });
  }

  /**
   * Custom validator to ensure maximum > minimum
   */
  private rangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const minimum = parseFloat(group.get('minimum')?.value);
    const maximum = parseFloat(group.get('maximum')?.value);

    if (minimum && maximum && minimum >= maximum) {
      return { invalidRange: true };
    }

    return null;
  }

  /**
   * Get dialog title based on mode
   */
  getDialogTitle(): string {
    return this.mode() === 'create' ? 'Nueva Escala' : 'Editar Escala';
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.form.value;

    if (this.mode() === 'create') {
      this.createScale(formValue);
    } else {
      this.updateScale(formValue);
    }
  }

  /**
   * Create new scale
   */
  private createScale(formValue: any): void {
    const request: CreateScaleRequest = {
      minimum: this.formatNumberToString(formValue.minimum),
      maximum: this.formatNumberToString(formValue.maximum),
      customerCharge: parseFloat(formValue.customerCharge),
      deliveryPayment: parseFloat(formValue.deliveryPayment),
      active: formValue.active,
      restaurantId: this.restaurantId()
    };

    this.restaurantService.createScale(this.restaurantId(), request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Escala creada correctamente'
        });
        this.isSaving.set(false);
        this.onSave.emit();
      },
      error: (error) => {
        console.error('Error creating scale:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo crear la escala'
        });
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Update existing scale
   */
  private updateScale(formValue: any): void {
    const currentScale = this.scale();
    if (!currentScale) return;

    const request: UpdateScaleRequest = {
      id: currentScale.id,
      minimum: this.formatNumberToString(formValue.minimum),
      maximum: this.formatNumberToString(formValue.maximum),
      customerCharge: parseFloat(formValue.customerCharge),
      deliveryPayment: parseFloat(formValue.deliveryPayment),
      active: formValue.active
    };

    this.restaurantService.updateScale(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Escala actualizada correctamente'
        });
        this.isSaving.set(false);
        this.onSave.emit();
      },
      error: (error) => {
        console.error('Error updating scale:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo actualizar la escala'
        });
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Handle dialog close
   */
  handleClose(): void {
    if (!this.isSaving()) {
      this.form.reset();
      this.onClose.emit();
    }
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get error message for field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field.hasError('pattern')) {
      return 'Ingrese un número válido (ej: 5.00)';
    }
    if (field.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }

    return '';
  }

  /**
   * Check if form has range validation error
   */
  hasRangeError(): boolean {
    return !!(this.form.errors?.['invalidRange'] &&
             this.form.get('minimum')?.touched &&
             this.form.get('maximum')?.touched);
  }
}
