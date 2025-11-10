import { Component, input, output, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { OrderTrackingService } from '../../services';
import { CancelRequest } from '../../models';

@Component({
  selector: 'app-deny-cancellation-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    TextareaModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deny-cancellation-dialog.component.html',
  styleUrl: './deny-cancellation-dialog.component.scss'
})
export class DenyCancellationDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly orderTrackingService = inject(OrderTrackingService);

  // Inputs
  readonly visible = input.required<boolean>();
  readonly request = input.required<CancelRequest>();
  readonly loading = input<boolean>(false);

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly confirm = output<void>();

  // Form
  readonly denyForm: FormGroup;

  constructor() {
    this.denyForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(15)]]
    });

    // Reset form when dialog closes
    effect(() => {
      if (!this.visible()) {
        this.denyForm.reset();
      }
    });
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  onSubmit(): void {
    if (this.denyForm.valid) {
      const denyData = {
        codOrderCancelRequest: this.request().codCancelRequest,
        comment: this.denyForm.value.comment
      };

      this.orderTrackingService.denyRequest(denyData).subscribe({
        next: () => {
          this.confirm.emit();
          this.visibleChange.emit(false);
        },
        error: (error) => {
          console.error('Error denying request:', error);
        }
      });
    }
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.denyForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.denyForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }
}
