import { Component, input, output, OnInit, signal, computed, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';

// Services
import { GlobalDataService } from '@core/services/global-data.service';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DrawerModule,
    ButtonModule,
    MultiSelectModule,
    DatePickerModule,
    CheckboxModule,
    DividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss'
})
export class FilterSidebarComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly globalDataService = inject(GlobalDataService);

  // Inputs
  readonly visible = input.required<boolean>();

  // Outputs
  readonly onClose = output<void>();
  readonly onApply = output<any>();

  // Form
  form!: FormGroup;

  // Local signals
  readonly today = signal(new Date());
  readonly maxDate = signal(new Date());

  // Computed
  readonly countries = computed(() => this.globalDataService.countries());
  readonly cities = computed(() => this.globalDataService.cities());
  readonly isLoadingData = computed(() =>
    this.globalDataService.isLoadingCountries() ||
    this.globalDataService.isLoadingCities()
  );

  constructor() {
    // Effect para detectar cambios en visible
    effect(() => {
      const isVisible = this.visible();
      console.log('🎯 [FILTER-SIDEBAR] visible cambió a:', isVisible);
    });
  }

  ngOnInit(): void {
    console.log('🎯 [FILTER-SIDEBAR] ngOnInit - visible inicial:', this.visible());
    this.initForm();
    this.loadData();
  }

  /**
   * Inicializa el formulario
   */
  private initForm(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.form = this.fb.group({
      selectedCountries: [[]],
      selectedCities: [[]],
      dateRange: [[today, today]]
    });
  }

  /**
   * Carga los datos necesarios
   */
  private loadData(): void {
    if (this.countries().length === 0) {
      this.globalDataService.forceRefresh('countries');
    }
    if (this.cities().length === 0) {
      this.globalDataService.forceRefresh('cities');
    }
  }

  /**
   * Maneja cambios en la visibilidad del drawer
   */
  onVisibleChange(isVisible: boolean): void {
    console.log('🎯 [FILTER-SIDEBAR] onVisibleChange llamado con:', isVisible);
    if (!isVisible) {
      this.close();
    }
  }

  /**
   * Cierra el sidebar
   */
  close(): void {
    console.log('🎯 [FILTER-SIDEBAR] close() llamado');
    this.onClose.emit();
  }

  /**
   * Aplica los filtros
   */
  applyFilters(): void {
    if (this.form.valid) {
      this.onApply.emit(this.form.value);
    }
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.form.reset({
      selectedCountries: [],
      selectedCities: [],
      dateRange: [today, today]
    });
  }

  /**
   * Valida que la fecha de inicio no sea mayor a la fecha fin
   */
  onDateRangeChange(): void {
    const dateRange = this.form.get('dateRange')?.value;
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      if (startDate && endDate && startDate > endDate) {
        // Si la fecha de inicio es mayor, ajustamos la fecha fin
        this.form.patchValue({
          dateRange: [startDate, startDate]
        });
      }
    }
  }
}
