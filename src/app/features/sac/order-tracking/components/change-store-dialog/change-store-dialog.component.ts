import { Component, input, output, effect, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { DataService } from '@core/services/data.service';
import { OrderTrackingService } from '../../services';
import { ChangeStoreRequest } from '../../models';

interface Store {
  restId: number;
  shortName: string;
}

@Component({
  selector: 'app-change-store-dialog',
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
  templateUrl: './change-store-dialog.component.html',
  styleUrl: './change-store-dialog.component.scss'
})
export class ChangeStoreDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly orderTrackingService = inject(OrderTrackingService);
  private readonly dataService = inject(DataService);

  // Inputs
  readonly visible = input.required<boolean>();
  readonly orderId = input.required<number>();
  readonly currentStoreId = input.required<number>();
  readonly currentStoreName = input.required<string>();
  readonly loading = input<boolean>(false);

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly confirm = output<void>();

  // State
  readonly stores = signal<Store[]>([]);
  readonly loadingStores = signal(true);
  readonly isSubmitting = signal(false);

  // Form
  readonly changeStoreForm: FormGroup;

  constructor() {
    this.changeStoreForm = this.fb.group({
      newStoreId: [null, Validators.required],
      comments: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Load stores when dialog opens
    effect(() => {
      if (this.visible()) {
        this.loadStores();
      }
    });

    // Reset form when dialog closes
    effect(() => {
      if (!this.visible()) {
        this.changeStoreForm.reset({
          newStoreId: null,
          comments: ''
        });
      }
    });
  }

  private loadStores(): void {
    this.loadingStores.set(true);

    // Assuming brandId is 1 (Pollo Campero) - this might need to be dynamic based on context
    // You may need to get this from the order data or a global service
    const brandId = 1;

    this.dataService.get$<Store[]>(`Restaurant/shortNames?brandId=${brandId}`).subscribe({
      next: (stores) => {
        // Filter out the current store from the list
        const filteredStores = stores.filter(store => store.restId !== this.currentStoreId());
        this.stores.set(filteredStores);
        this.loadingStores.set(false);
      },
      error: (error) => {
        console.error('Error loading stores:', error);
        this.loadingStores.set(false);
      }
    });
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  onSubmit(): void {
    if (this.changeStoreForm.valid) {
      const formValue = this.changeStoreForm.value;

      // Validate that new store is different from current
      if (formValue.newStoreId === this.currentStoreId()) {
        return;
      }

      this.isSubmitting.set(true);

      const changeStoreData: ChangeStoreRequest = {
        orderId: this.orderId(),
        newStoreId: formValue.newStoreId,
        comments: formValue.comments
      };

      this.orderTrackingService.changeStore(changeStoreData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.confirm.emit();
          this.visibleChange.emit(false);
        },
        error: (error) => {
          console.error('Error al cambiar restaurante:', error);
          this.isSubmitting.set(false);
        }
      });
    }
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.changeStoreForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.changeStoreForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }

  // Get selected store name for display
  getSelectedStoreName(): string {
    const selectedId = this.changeStoreForm.get('newStoreId')?.value;
    if (!selectedId) return '';
    const store = this.stores().find(s => s.restId === selectedId);
    return store?.shortName || '';
  }
}
