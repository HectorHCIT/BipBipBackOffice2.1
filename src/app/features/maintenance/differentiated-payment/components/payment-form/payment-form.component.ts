import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';
import { PaymentService } from '../../services/payment.service';
import { GlobalDataService } from '@core/services/global-data.service';
import { type CreatePaymentDto } from '../../models/payment.model';

/**
 * PaymentFormComponent
 *
 * Form for creating scheduled payments
 * Opened as a dialog from parent component
 */
@Component({
  selector: 'app-payment-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    MultiSelectModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <!-- Schedule Date (Display Only) -->
      <div class="flex flex-col gap-2">
        <label class="font-medium text-sm">
          Fecha seleccionada
        </label>
        <div class="p-3 bg-surface-50 border border-surface-200 rounded-md">
          <i class="pi pi-calendar mr-2 text-primary"></i>
          <span class="font-semibold">{{ selectedDateDisplay() }}</span>
        </div>
      </div>

      <!-- Schedule Time -->
      <div class="flex flex-col gap-2">
        <label for="scheduleTime" class="font-medium text-sm">
          Hora <span class="text-red-500">*</span>
        </label>
        <input
          pInputText
          type="time"
          id="scheduleTime"
          formControlName="scheduleTime"
          class="w-full"
        />
        @if (form.controls['scheduleTime'].invalid && form.controls['scheduleTime'].touched) {
          <small class="text-red-500">
            La hora es obligatoria
          </small>
        }
      </div>

      <!-- Amount Customer -->
      <div class="flex flex-col gap-2">
        <label for="ammountCustomer" class="font-medium text-sm">
          Monto Cliente (L.) <span class="text-red-500">*</span>
        </label>
        <p-inputNumber
          inputId="ammountCustomer"
          formControlName="ammountCustomer"
          mode="decimal"
          [minFractionDigits]="2"
          [maxFractionDigits]="2"
          [min]="0"
          placeholder="0.00"
          styleClass="w-full"
        />
        @if (form.controls['ammountCustomer'].invalid && form.controls['ammountCustomer'].touched) {
          <small class="text-red-500">
            El monto del cliente es obligatorio
          </small>
        }
      </div>

      <!-- Amount Driver -->
      <div class="flex flex-col gap-2">
        <label for="ammountDriver" class="font-medium text-sm">
          Monto Driver (L.) <span class="text-red-500">*</span>
        </label>
        <p-inputNumber
          inputId="ammountDriver"
          formControlName="ammountDriver"
          mode="decimal"
          [minFractionDigits]="2"
          [maxFractionDigits]="2"
          [min]="0"
          placeholder="0.00"
          styleClass="w-full"
        />
        @if (form.controls['ammountDriver'].invalid && form.controls['ammountDriver'].touched) {
          <small class="text-red-500">
            El monto del driver es obligatorio
          </small>
        }
      </div>

      <!-- Cities Multi-Select -->
      <div class="flex flex-col gap-2">
        <label for="cities" class="font-medium text-sm">
          Ciudades <span class="text-red-500">*</span>
        </label>
        <p-multiSelect
          inputId="cities"
          formControlName="cities"
          [options]="cityOptions()"
          optionLabel="name"
          optionValue="id"
          placeholder="Selecciona ciudades"
          [filter]="true"
          filterPlaceholder="Buscar ciudad"
          display="chip"
          [showClear]="true"
          appendTo="body"
          styleClass="w-full"
        />
        @if (form.controls['cities'].invalid && form.controls['cities'].touched) {
          <small class="text-red-500">
            Debes seleccionar al menos una ciudad
          </small>
        }
      </div>

      <!-- Summary Section -->
      @if (form.value.cities && form.value.cities.length > 0) {
        <div class="p-4 rounded-lg border" style="background-color: var(--primary-50); border-color: var(--primary-200);">
          <h4 class="font-semibold text-sm mb-2" style="color: var(--primary-800);">
            <i class="pi pi-info-circle mr-2"></i>
            Resumen
          </h4>
          <div class="text-sm space-y-1" style="color: var(--primary-700);">
            <p><strong>Fecha:</strong> {{ selectedDateDisplay() }}</p>
            <p><strong>Hora:</strong> {{ form.value.scheduleTime }}</p>
            <p><strong>Ciudades:</strong> {{ form.value.cities.length }}</p>
            <p><strong>Monto Cliente:</strong> L. {{ form.value.ammountCustomer || 0 | number:'1.2-2' }}</p>
            <p><strong>Monto Driver:</strong> L. {{ form.value.ammountDriver || 0 | number:'1.2-2' }}</p>
          </div>
        </div>
      }

      <!-- Buttons -->
      <div class="flex justify-end gap-2 pt-4 border-t">
        <p-button
          label="Cancelar"
          severity="secondary"
          [outlined]="true"
          (onClick)="onCancel()"
        />
        <p-button
          label="Guardar"
          type="submit"
          [loading]="isSubmitting()"
          [disabled]="form.invalid"
        />
      </div>
    </form>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PaymentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly globalData = inject(GlobalDataService);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly messageService = inject(MessageService);

  // Form
  form!: FormGroup;

  // State
  readonly isSubmitting = signal(false);
  private readonly selectedDate = signal<Date>(new Date());

  // Cities from global data
  readonly cityOptions = computed(() => {
    const cities = this.globalData.cities();
    console.log('🏙️ Cities from GlobalData:', cities);
    return cities.map(city => ({
      id: city.id,
      name: city.name
    }));
  });

  // Display selected date
  readonly selectedDateDisplay = computed(() => {
    const date = this.selectedDate();
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  });

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialize form with validators
   */
  private initForm(): void {
    const data = this.config.data || {};
    const preselectedDate = data.date ? new Date(data.date) : new Date();

    // Store the selected date
    this.selectedDate.set(preselectedDate);

    // Extract time from preselected date (default to 12:00)
    const hours = String(preselectedDate.getHours()).padStart(2, '0');
    const minutes = String(preselectedDate.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    this.form = this.fb.group({
      scheduleTime: [timeString, Validators.required],
      ammountCustomer: [0, [Validators.required, Validators.min(0)]],
      ammountDriver: [0, [Validators.required, Validators.min(0)]],
      cities: [[], Validators.required]
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Por favor completa todos los campos requeridos',
        life: 3000
      });
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;

    // Combine selected date with time from form
    // Construct date in UTC to avoid timezone conversion issues
    const [hours, minutes] = formValue.scheduleTime.split(':').map(Number);
    const baseDate = this.selectedDate();

    // Create ISO string manually to avoid timezone conversion
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');

    const isoDateString = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:00.000Z`;

    // Convert date to ISO string
    const dto: CreatePaymentDto = {
      ammountCustomer: formValue.ammountCustomer,
      ammountDriver: formValue.ammountDriver,
      cities: formValue.cities,
      scheduleDate: isoDateString
    };

    this.paymentService.create(dto).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pago programado correctamente',
          life: 3000
        });
        this.isSubmitting.set(false);
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error creating payment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo programar el pago',
          life: 3000
        });
        this.isSubmitting.set(false);
      }
    });
  }

  /**
   * Handle cancel button
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
