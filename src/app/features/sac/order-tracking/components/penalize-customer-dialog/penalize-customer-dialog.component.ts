import { Component, input, output, effect, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { OrderTrackingService } from '../../services';
import { CustomerPenalty } from '../../models';

interface PenaltyReason {
  penaltyReasonId: number;
  description: string;
}

@Component({
  selector: 'app-penalize-customer-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
    MessageModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './penalize-customer-dialog.component.html',
  styleUrl: './penalize-customer-dialog.component.scss'
})
export class PenalizeCustomerDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly orderTrackingService = inject(OrderTrackingService);

  // Inputs
  readonly visible = input.required<boolean>();
  readonly customerId = input.required<number>();
  readonly customerName = input.required<string>();
  readonly loading = input<boolean>(false);

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly confirm = output<void>();

  // State
  readonly penaltyReasons = signal<PenaltyReason[]>([]);
  readonly loadingReasons = signal(true);
  readonly isSubmitting = signal(false);

  // Form
  readonly penaltyForm: FormGroup;

  constructor() {
    this.penaltyForm = this.fb.group({
      reasonId: [null, Validators.required],
      comments: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Load penalty reasons when dialog opens
    effect(() => {
      if (this.visible()) {
        this.loadPenaltyReasons();
      }
    });

    // Reset form when dialog closes
    effect(() => {
      if (!this.visible()) {
        this.penaltyForm.reset({
          reasonId: null,
          comments: ''
        });
      }
    });
  }

  private loadPenaltyReasons(): void {
    this.loadingReasons.set(true);
    this.orderTrackingService.getCustomerPenaltyReasons().subscribe({
      next: (reasons) => {
        this.penaltyReasons.set(reasons);
        this.loadingReasons.set(false);
      },
      error: (error) => {
        console.error('Error loading penalty reasons:', error);
        this.loadingReasons.set(false);
      }
    });
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  onSubmit(): void {
    if (this.penaltyForm.valid) {
      const formValue = this.penaltyForm.value;

      this.isSubmitting.set(true);

      const penaltyData: CustomerPenalty = {
        customerId: this.customerId(),
        penaltyReasonId: formValue.reasonId,
        comments: formValue.comments,
        status: true
      };

      this.orderTrackingService.penalizeCustomer(penaltyData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.confirm.emit();
          this.visibleChange.emit(false);
        },
        error: (error) => {
          console.error('Error al penalizar cliente:', error);
          this.isSubmitting.set(false);
        }
      });
    }
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.penaltyForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.penaltyForm.get(fieldName);
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
