import { Component, input, output, effect, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { OrderTrackingService } from '../../services';
import { CancelRequest, ReasonCancelList } from '../../models';

@Component({
  selector: 'app-approve-cancellation-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
    CheckboxModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './approve-cancellation-dialog.component.html',
  styleUrl: './approve-cancellation-dialog.component.scss'
})
export class ApproveCancellationDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly orderTrackingService = inject(OrderTrackingService);

  // Inputs
  readonly visible = input.required<boolean>();
  readonly request = input.required<CancelRequest>();
  readonly loading = input<boolean>(false);

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly confirm = output<void>();

  // State
  readonly cancelReasons = signal<ReasonCancelList[]>([]);
  readonly loadingReasons = signal(true);

  // Form
  readonly approveForm: FormGroup;

  constructor() {
    this.approveForm = this.fb.group({
      reason: [null, Validators.required],
      comment: ['', [Validators.required, Validators.minLength(10)]],
      productProcessed: [false, Validators.required]
    });

    // Load cancel reasons
    effect(() => {
      if (this.visible()) {
        this.loadCancelReasons();
      }
    });

    // Reset form when dialog closes
    effect(() => {
      if (!this.visible()) {
        this.approveForm.reset({
          reason: null,
          comment: '',
          productProcessed: false
        });
      }
    });
  }

  private loadCancelReasons(): void {
    this.loadingReasons.set(true);
    this.orderTrackingService.getReasonsCancels().subscribe({
      next: (reasons) => {
        this.cancelReasons.set(reasons);
        this.loadingReasons.set(false);
      },
      error: (error) => {
        console.error('Error loading cancel reasons:', error);
        this.loadingReasons.set(false);
      }
    });
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  onSubmit(): void {
    if (this.approveForm.valid) {
      const formValue = this.approveForm.value;
      const approveData = {
        codOrderCancelRequest: this.request().codCancelRequest,
        comment: formValue.comment,
        codCancelReason: formValue.reason,
        productProcessed: formValue.productProcessed
      };

      this.orderTrackingService.approveRequest(approveData).subscribe({
        next: () => {
          this.confirm.emit();
          this.visibleChange.emit(false);
        },
        error: (error) => {
          console.error('Error approving request:', error);
        }
      });
    }
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.approveForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.approveForm.get(fieldName);
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
