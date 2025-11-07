import { Component, ChangeDetectionStrategy, signal, input, output, inject, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
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
    MultiSelectModule,
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
    return this.cities().filter(city => selected.includes(city.codCountry));
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

  onCountryChange(selectedCountryIds: number[] | null): void {
    // Handle null/undefined case (when clearing selection)
    const newSelection = selectedCountryIds ?? [];
    const previous = this.selectedCountries();

    const added = newSelection.filter(id => !previous.includes(id));
    const removed = previous.filter(id => !newSelection.includes(id));

    // Load cities for newly added countries
    added.forEach(countryId => {
      this.loadCitiesForCountry(countryId);
    });

    // Remove cities from deselected countries
    if (removed.length > 0) {
      const citiesToRemove = this.cities()
        .filter(city => removed.includes(city.codCountry))
        .map(city => city.cityId);

      const updatedCities = this.selectedCities().filter(
        cityId => !citiesToRemove.includes(cityId)
      );
      this.selectedCities.set(updatedCities);
    }

    this.selectedCountries.set(newSelection);
  }

  private loadCitiesForCountry(countryId: number): void {
    this.isLoadingCities.set(true);
    this.registeredUsersService.getCitiesByCountry(countryId).subscribe({
      next: (cities) => {
        const existingCities = this.cities();
        const newCities = cities.filter(
          city => !existingCities.some(ec => ec.cityId === city.cityId)
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
