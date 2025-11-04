import { Component, ChangeDetectionStrategy, signal, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { type CredentialFilterCriteria } from '../../../models';

/**
 * Filter option interface
 */
interface FilterOption {
  label: string;
  value: any;
}

/**
 * Active filter tag
 */
interface ActiveFilterTag {
  key: string;
  label: string;
  value: any;
}

/**
 * CredentialsFilterComponent
 *
 * Reusable filter component for credentials table
 * Features:
 * - Search with debounce (1000ms)
 * - Country and city filters
 * - Role filter
 * - Date range filter
 * - Active filter tags display
 * - Clear all filters
 */
@Component({
  selector: 'app-credentials-filter',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    TagModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="credentials-filter p-4 bg-gray-50 rounded-lg border">
      <!-- Search Input -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Buscar usuario
        </label>
        <p-iconfield iconPosition="left" class="w-full">
          <p-inputicon styleClass="pi pi-search" />
          <input
            pInputText
            type="text"
            [formControl]="searchControl"
            placeholder="Buscar por nombre o email..."
            class="w-full"
          />
        </p-iconfield>
      </div>

      <!-- Advanced Filters Toggle -->
      <div class="mb-4">
        <p-button
          [label]="showAdvancedFilters() ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'"
          [icon]="showAdvancedFilters() ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
          [text]="true"
          size="small"
          (onClick)="toggleAdvancedFilters()"
        />
      </div>

      <!-- Advanced Filters -->
      @if (showAdvancedFilters()) {
        <div class="space-y-4">
          <!-- Country Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              País
            </label>
            <p-select
              [formControl]="countryControl"
              [options]="countries()"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar país"
              [showClear]="true"
              class="w-full"
            />
          </div>

          <!-- City Filter (enabled when country selected) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ciudad
            </label>
            <p-select
              [formControl]="cityControl"
              [options]="cities()"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar ciudad"
              [disabled]="!countryControl.value"
              [showClear]="true"
              class="w-full"
            />
          </div>

          <!-- Role Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <p-select
              [formControl]="roleControl"
              [options]="roles()"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccionar rol"
              [showClear]="true"
              class="w-full"
            />
          </div>

          <!-- Date Range Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rango de fechas
            </label>
            <p-datepicker
              [formControl]="dateRangeControl"
              selectionMode="range"
              placeholder="Seleccionar rango"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              [showClear]="true"
              class="w-full"
            />
          </div>
        </div>
      }

      <!-- Active Filters Tags -->
      @if (activeFilters().length > 0) {
        <div class="mt-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-medium text-gray-700">Filtros activos:</span>
          </div>
          <div class="flex flex-wrap gap-2">
            @for (filter of activeFilters(); track filter.key) {
              <p-tag
                [value]="filter.label"
                severity="info"
              >
                <div class="flex items-center gap-2">
                  <span>{{ filter.label }}</span>
                  <button
                    type="button"
                    class="pi pi-times text-xs cursor-pointer hover:text-red-500"
                    (click)="removeFilter(filter.key)"
                  ></button>
                </div>
              </p-tag>
            }
          </div>
        </div>
      }

      <!-- Action Buttons -->
      <div class="mt-4 flex gap-2">
        <p-button
          label="Aplicar filtros"
          icon="pi pi-filter"
          size="small"
          (onClick)="applyFilters()"
        />
        <p-button
          label="Limpiar filtros"
          icon="pi pi-filter-slash"
          [outlined]="true"
          severity="secondary"
          size="small"
          (onClick)="clearFilters()"
          [disabled]="!hasActiveFilters()"
        />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CredentialsFilterComponent {
  // Output events
  readonly filterChange = output<Partial<CredentialFilterCriteria>>();

  // Form controls
  readonly searchControl = new FormControl<string>('');
  readonly countryControl = new FormControl<number | null>(null);
  readonly cityControl = new FormControl<number | null>(null);
  readonly roleControl = new FormControl<string | null>(null);
  readonly dateRangeControl = new FormControl<Date[] | null>(null);

  // UI state
  readonly showAdvancedFilters = signal(false);
  readonly activeFilters = signal<ActiveFilterTag[]>([]);

  // Filter options (will be loaded from services)
  readonly countries = signal<FilterOption[]>([
    { label: 'Honduras', value: 1 },
    { label: 'Guatemala', value: 2 },
    { label: 'El Salvador', value: 3 }
  ]);

  readonly cities = signal<FilterOption[]>([
    { label: 'Tegucigalpa', value: 1 },
    { label: 'San Pedro Sula', value: 2 }
  ]);

  readonly roles = signal<FilterOption[]>([
    { label: 'Administrador', value: 1 },
    { label: 'Gerente', value: 2 },
    { label: 'Operador', value: 3 }
  ]);

  constructor() {
    // Setup search debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.applyFilters();
      });

    // Watch for country changes to update cities
    effect(() => {
      const countryId = this.countryControl.value;
      if (!countryId) {
        this.cityControl.setValue(null);
        // TODO: Load all cities
      } else {
        // TODO: Load cities for selected country
      }
    });
  }

  /**
   * Toggle advanced filters visibility
   */
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update(show => !show);
  }

  /**
   * Apply current filters
   */
  applyFilters(): void {
    const filters: Partial<CredentialFilterCriteria> = {};

    // Search
    if (this.searchControl.value) {
      filters.search = this.searchControl.value;
    }

    // Country
    if (this.countryControl.value) {
      filters.countryId = this.countryControl.value;
    }

    // City
    if (this.cityControl.value) {
      filters.cityId = this.cityControl.value;
    }

    // Role
    if (this.roleControl.value) {
      filters.roleId = this.roleControl.value;
    }

    // Date range
    if (this.dateRangeControl.value && this.dateRangeControl.value.length === 2) {
      const [start, end] = this.dateRangeControl.value;
      filters.dateFrom = start?.toISOString().split('T')[0];
      filters.dateTo = end?.toISOString().split('T')[0];
    }

    // Update active filters display
    this.updateActiveFilters();

    // Emit filter change
    this.filterChange.emit(filters);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchControl.setValue('');
    this.countryControl.setValue(null);
    this.cityControl.setValue(null);
    this.roleControl.setValue(null);
    this.dateRangeControl.setValue(null);
    this.activeFilters.set([]);
    this.filterChange.emit({});
  }

  /**
   * Remove specific filter
   */
  removeFilter(key: string): void {
    switch (key) {
      case 'search':
        this.searchControl.setValue('');
        break;
      case 'country':
        this.countryControl.setValue(null);
        break;
      case 'city':
        this.cityControl.setValue(null);
        break;
      case 'role':
        this.roleControl.setValue(null);
        break;
      case 'dateRange':
        this.dateRangeControl.setValue(null);
        break;
    }
    this.applyFilters();
  }

  /**
   * Check if has active filters
   */
  hasActiveFilters(): boolean {
    return !!(
      this.searchControl.value ||
      this.countryControl.value ||
      this.cityControl.value ||
      this.roleControl.value ||
      this.dateRangeControl.value
    );
  }

  /**
   * Update active filters display
   */
  private updateActiveFilters(): void {
    const tags: ActiveFilterTag[] = [];

    if (this.searchControl.value) {
      tags.push({
        key: 'search',
        label: `Búsqueda: ${this.searchControl.value}`,
        value: this.searchControl.value
      });
    }

    if (this.countryControl.value) {
      const country = this.countries().find(c => c.value === this.countryControl.value);
      if (country) {
        tags.push({
          key: 'country',
          label: `País: ${country.label}`,
          value: country.value
        });
      }
    }

    if (this.cityControl.value) {
      const city = this.cities().find(c => c.value === this.cityControl.value);
      if (city) {
        tags.push({
          key: 'city',
          label: `Ciudad: ${city.label}`,
          value: city.value
        });
      }
    }

    if (this.roleControl.value) {
      const role = this.roles().find(r => r.value === this.roleControl.value);
      if (role) {
        tags.push({
          key: 'role',
          label: `Rol: ${role.label}`,
          value: role.value
        });
      }
    }

    if (this.dateRangeControl.value && this.dateRangeControl.value.length === 2) {
      const [start, end] = this.dateRangeControl.value;
      tags.push({
        key: 'dateRange',
        label: `Rango: ${start?.toLocaleDateString()} - ${end?.toLocaleDateString()}`,
        value: this.dateRangeControl.value
      });
    }

    this.activeFilters.set(tags);
  }
}
