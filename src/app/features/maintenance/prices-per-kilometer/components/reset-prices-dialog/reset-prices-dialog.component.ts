import { Component, inject, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';

import { PriceService } from '../../services/price.service';
import type { CityList } from '../../models/price.model';

/**
 * ResetPricesDialogComponent
 *
 * Diálogo para resetear precios a valores estándar
 * Permite seleccionar ciudades específicas o todas
 */
@Component({
  selector: 'app-reset-prices-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    MultiSelectModule
  ],
  providers: [MessageService],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Descripción -->
      <div class="mb-4">
        <p class="text-gray-600 dark:text-gray-400">
          Selecciona las ciudades que deseas resetear a los precios estándar.
        </p>
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

      <!-- Mensaje de advertencia -->
      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div class="flex gap-3">
          <i class="pi pi-exclamation-triangle text-yellow-600 dark:text-yellow-500 mt-0.5"></i>
          <div class="flex-1">
            <h4 class="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
              Advertencia
            </h4>
            <p class="text-sm text-yellow-700 dark:text-yellow-500">
              Esta acción reemplazará los precios actuales con los valores estándar para las ciudades seleccionadas.
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
          label="Resetear Precios"
          severity="danger"
          icon="pi pi-refresh"
          [loading]="isSubmitting()"
          [disabled]="form.invalid"
        />
      </div>
    </form>
  `,
  styles: [`
    :host ::ng-deep {
      .p-multiselect {
        width: 100%;
      }
    }
  `]
})
export class ResetPricesDialogComponent implements OnInit {
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
      cities: this.form.value.cities
    };

    this.priceService.createStandardPayment(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Precios reseteados correctamente',
          life: 3000
        });
        this.isSubmitting.set(false);
        this.onSuccess.emit();
      },
      error: (error) => {
        console.error('Error reseteando precios:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron resetear los precios',
          life: 3000
        });
        this.isSubmitting.set(false);
      }
    });
  }
}
