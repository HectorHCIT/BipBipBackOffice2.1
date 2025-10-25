import { Component, inject, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';

import { PriceService } from '../../services/price.service';
import type { CityList } from '../../models/price.model';

/**
 * DifferentiatedPaymentDialogComponent
 *
 * Diálogo para configurar pago diferenciado a drivers
 * Solo admin puede acceder
 */
@Component({
  selector: 'app-differentiated-payment-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    MultiSelectModule
  ],
  providers: [MessageService],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Pago al Driver -->
      <div>
        <label for="ammountDriver" class="block text-sm font-medium mb-2">
          Pago al Driver <span class="text-red-500">*</span>
        </label>
        <div class="relative">

          <p-inputNumber
            inputId="ammountDriver"
            formControlName="ammountDriver"
            mode="decimal"
            [minFractionDigits]="2"
            [maxFractionDigits]="2"
            [min]="0"
            placeholder="0.00"
            styleClass="w-full"
            inputStyleClass="pl-10"
          />
        </div>
        @if (form.get('ammountDriver')?.invalid && form.get('ammountDriver')?.touched) {
          <small class="text-red-500">El pago al driver es requerido</small>
        }
      </div>

      <!-- Selector de ciudades -->
      <div>
        <label for="cities" class="block text-sm font-medium mb-2">
          Seleccionar ciudad/es <span class="text-red-500">*</span>
        </label>
        <p-multiSelect
          inputId="cities"
          formControlName="cities"
          [options]="cities()"
          optionLabel="cityName"
          optionValue="cityId"
          placeholder="Selecciona ciudades"
          [showToggleAll]="true"
          [filter]="true"
          filterPlaceholder="Buscar ciudad"
          display="chip"
          styleClass="w-full"
        >
          <ng-template let-city #item>
            <div class="flex items-center gap-2">
              @if (city.countryUrlFlag) {
                <img
                  [src]="city.countryUrlFlag"
                  [alt]="city.cityName"
                  class="w-5 h-5 object-contain rounded-sm"
                />
              }
              <span>{{ city.cityName }}</span>
            </div>
          </ng-template>
        </p-multiSelect>
        @if (form.get('cities')?.invalid && form.get('cities')?.touched) {
          <small class="text-red-500">Debes seleccionar al menos una ciudad</small>
        }
      </div>

      <!-- Información -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex gap-3">
          <i class="pi pi-info-circle text-blue-600 dark:text-blue-500 mt-0.5"></i>
          <div class="flex-1">
            <h4 class="font-semibold text-blue-800 dark:text-blue-400 mb-1">
              Información
            </h4>
            <p class="text-sm text-blue-700 dark:text-blue-500">
              El pago diferenciado permite establecer una tarifa especial para drivers en ciudades específicas.
            </p>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-2 pt-4">
        <p-button
          label="Cancelar"
          severity="secondary"
          [outlined]="true"
          (onClick)="onCancel.emit()"
          [disabled]="isSubmitting()"
        />
        <p-button
          type="submit"
          label="Guardar Configuración"
          severity="success"
          icon="pi pi-check"
          [loading]="isSubmitting()"
          [disabled]="form.invalid"
        />
      </div>
    </form>
  `,
  styles: [`
    :host ::ng-deep {
      .p-inputnumber,
      .p-multiselect {
        width: 100%;
      }

      .p-inputnumber-input {
        width: 100%;
      }
    }
  `]
})
export class DifferentiatedPaymentDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly priceService = inject(PriceService);
  private readonly messageService = inject(MessageService);

  // Outputs
  readonly onCancel = output<void>();
  readonly onSuccess = output<void>();

  // Signals
  readonly cities = this.priceService.cities;
  readonly isSubmitting = signal<boolean>(false);

  // Form
  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadCities();
  }

  private initForm(): void {
    this.form = this.fb.group({
      ammountDriver: [null, [Validators.required, Validators.min(0)]],
      cities: [[], Validators.required]
    });
  }

  private loadCities(): void {
    this.priceService.getCities().subscribe({
      error: (error) => {
        console.error('Error cargando ciudades:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las ciudades',
          life: 3000
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);

    const request = {
      ammountDriver: this.form.value.ammountDriver,
      cities: this.form.value.cities
    };

    this.priceService.createStandardPayment(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pago diferenciado configurado correctamente',
          life: 3000
        });
        this.isSubmitting.set(false);
        this.onSuccess.emit();
      },
      error: (error) => {
        console.error('Error configurando pago diferenciado:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo configurar el pago diferenciado',
          life: 3000
        });
        this.isSubmitting.set(false);
      }
    });
  }
}
