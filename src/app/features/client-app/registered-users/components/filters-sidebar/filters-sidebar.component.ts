import { Component, ChangeDetectionStrategy, signal, input, output, inject, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { RegisteredUsersService } from '../../services';
import { Country, City } from '../../models';

@Component({
  selector: 'app-filters-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DrawerModule,
    ButtonModule,
    DatePickerModule,
    CheckboxModule,
    TagModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filters-sidebar.component.html'
})
export class FiltersSidebarComponent implements OnInit {
  readonly visible = input.required<boolean>();
  readonly visibleChange = output<boolean>();
  readonly onApplyFilters = output<{
    from: string | null;
    to: string | null;
    countries: number[];
    cities: number[];
  }>();

  private readonly fb = inject(FormBuilder);
  private readonly registeredUsersService = inject(RegisteredUsersService);
  private readonly messageService = inject(MessageService);

  readonly countries = signal<Country[]>([]);
  readonly cities = signal<City[]>([]);
  readonly selectedCountries = signal<number[]>([]);
  readonly selectedCities = signal<number[]>([]);
  readonly isLoadingCountries = signal(false);
  readonly isLoadingCities = signal(false);

  visibleModel = false;
  filterForm!: FormGroup;

  readonly filteredCities = computed(() => {
    const selected = this.selectedCountries();
    if (selected.length === 0) {
      return [];
    }
    return this.cities().filter(city => selected.includes(city.idCountry));
  });

  readonly maxDate = new Date();

  constructor() {
    // Sync visible input with internal model
    effect(() => {
      this.visibleModel = this.visible();
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCountries();
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      from: [null],
      to: [null]
    });
  }

  private loadCountries(): void {
    this.isLoadingCountries.set(true);
    this.registeredUsersService.getCountries().subscribe({
      next: (countries) => {
        this.countries.set(countries);
        this.isLoadingCountries.set(false);
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los países'
        });
        this.isLoadingCountries.set(false);
      }
    });
  }

  onCountryChange(countryId: number, event: any): void {
    const selected = [...this.selectedCountries()];

    if (event.checked) {
      selected.push(countryId);
      this.loadCitiesForCountry(countryId);
    } else {
      const index = selected.indexOf(countryId);
      if (index > -1) {
        selected.splice(index, 1);
      }
      // Remove cities from this country
      const citiesToRemove = this.cities()
        .filter(city => city.idCountry === countryId)
        .map(city => city.idCity);

      const updatedCities = this.selectedCities().filter(
        cityId => !citiesToRemove.includes(cityId)
      );
      this.selectedCities.set(updatedCities);
    }

    this.selectedCountries.set(selected);
  }

  private loadCitiesForCountry(countryId: number): void {
    this.isLoadingCities.set(true);
    this.registeredUsersService.getCitiesByCountry(countryId).subscribe({
      next: (cities) => {
        const existingCities = this.cities();
        const newCities = cities.filter(
          city => !existingCities.some(ec => ec.idCity === city.idCity)
        );
        this.cities.set([...existingCities, ...newCities]);
        this.isLoadingCities.set(false);
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las ciudades'
        });
        this.isLoadingCities.set(false);
      }
    });
  }

  onCityChange(cityId: number, event: any): void {
    const selected = [...this.selectedCities()];

    if (event.checked) {
      selected.push(cityId);
    } else {
      const index = selected.indexOf(cityId);
      if (index > -1) {
        selected.splice(index, 1);
      }
    }

    this.selectedCities.set(selected);
  }

  selectAllCountries(): void {
    const allCountryIds = this.countries().map(c => c.idCountry);
    this.selectedCountries.set(allCountryIds);

    // Load cities for all countries
    allCountryIds.forEach(id => {
      this.loadCitiesForCountry(id);
    });
  }

  selectAllCities(): void {
    const allCityIds = this.filteredCities().map(c => c.idCity);
    this.selectedCities.set(allCityIds);
  }

  isCountrySelected(countryId: number): boolean {
    return this.selectedCountries().includes(countryId);
  }

  isCitySelected(cityId: number): boolean {
    return this.selectedCities().includes(cityId);
  }

  removeCountry(countryId: number): void {
    const selected = this.selectedCountries().filter(id => id !== countryId);
    this.selectedCountries.set(selected);

    // Remove cities from this country
    const citiesToRemove = this.cities()
      .filter(city => city.idCountry === countryId)
      .map(city => city.idCity);

    const updatedCities = this.selectedCities().filter(
      cityId => !citiesToRemove.includes(cityId)
    );
    this.selectedCities.set(updatedCities);
  }

  removeCity(cityId: number): void {
    const selected = this.selectedCities().filter(id => id !== cityId);
    this.selectedCities.set(selected);
  }

  getCountryName(countryId: number): string {
    return this.countries().find(c => c.idCountry === countryId)?.countryName ?? '';
  }

  getCityName(cityId: number): string {
    return this.cities().find(c => c.idCity === cityId)?.cityName ?? '';
  }

  applyFilters(): void {
    const formValue = this.filterForm.value;
    const from = formValue.from;
    const to = formValue.to;

    // Validate dates
    if (from && to && from > to) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Fechas inválidas',
        detail: 'La fecha inicial no puede ser mayor a la fecha final'
      });
      return;
    }

    if (to && to > this.maxDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Fecha inválida',
        detail: 'La fecha final no puede ser mayor a hoy'
      });
      return;
    }

    this.onApplyFilters.emit({
      from: from ? from.toISOString() : null,
      to: to ? to.toISOString() : null,
      countries: this.selectedCountries(),
      cities: this.selectedCities()
    });

    this.closeDrawer();
  }

  clearFilters(): void {
    this.filterForm.reset({
      from: null,
      to: null
    });
    this.selectedCountries.set([]);
    this.selectedCities.set([]);
    this.cities.set([]);

    this.onApplyFilters.emit({
      from: null,
      to: null,
      countries: [],
      cities: []
    });

    this.closeDrawer();
  }

  closeDrawer(): void {
    this.visibleModel = false;
    this.visibleChange.emit(false);
  }

  onVisibleChange(visible: boolean): void {
    this.visibleModel = visible;
    this.visibleChange.emit(visible);
  }
}
