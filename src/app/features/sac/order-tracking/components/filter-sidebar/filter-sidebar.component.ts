import { Component, input, output, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';

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
    CheckboxModule
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
  readonly allCountriesSelected = signal(false);
  readonly allCitiesSelected = signal(false);
  readonly allBrandsSelected = signal(false);

  // Computed
  readonly countries = computed(() => this.globalDataService.countries());
  readonly cities = computed(() => this.globalDataService.cities());
  readonly brands = computed(() => this.globalDataService.brands());
  readonly isLoadingData = computed(() =>
    this.globalDataService.isLoadingCountries() ||
    this.globalDataService.isLoadingCities() ||
    this.globalDataService.isLoadingBrands()
  );

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  /**
   * Inicializa el formulario
   */
  private initForm(): void {
    this.form = this.fb.group({
      selectedCountries: [[]],
      selectedCities: [[]],
      dateRange: [null],
      selectedBrands: [[]]
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
    if (this.brands().length === 0) {
      this.globalDataService.forceRefresh('brands');
    }
  }

  /**
   * Cierra el sidebar
   */
  close(): void {
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
    this.form.reset({
      selectedCountries: [],
      selectedCities: [],
      dateRange: null,
      selectedBrands: []
    });
    this.allCountriesSelected.set(false);
    this.allCitiesSelected.set(false);
    this.allBrandsSelected.set(false);
  }

  /**
   * Selecciona/deselecciona todos los países
   */
  toggleAllCountries(): void {
    const allSelected = !this.allCountriesSelected();
    this.allCountriesSelected.set(allSelected);

    if (allSelected) {
      const allCountryIds = this.countries().map(c => c.id);
      this.form.patchValue({ selectedCountries: allCountryIds });
    } else {
      this.form.patchValue({ selectedCountries: [] });
    }
  }

  /**
   * Selecciona/deselecciona todas las ciudades
   */
  toggleAllCities(): void {
    const allSelected = !this.allCitiesSelected();
    this.allCitiesSelected.set(allSelected);

    if (allSelected) {
      const allCityIds = this.cities().map(c => c.id);
      this.form.patchValue({ selectedCities: allCityIds });
    } else {
      this.form.patchValue({ selectedCities: [] });
    }
  }

  /**
   * Selecciona/deselecciona todas las marcas
   */
  toggleAllBrands(): void {
    const allSelected = !this.allBrandsSelected();
    this.allBrandsSelected.set(allSelected);

    if (allSelected) {
      const allBrandIds = this.brands().map(b => b.id);
      this.form.patchValue({ selectedBrands: allBrandIds });
    } else {
      this.form.patchValue({ selectedBrands: [] });
    }
  }
}
