import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  effect,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { TargetAudienceService } from '../../services';
import { TargetAudience, GeneralTargetObjective } from '../../models';

@Component({
  selector: 'app-target-audience-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DrawerModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    MultiSelectModule,
    DividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './target-audience-form.component.html',
  styleUrl: './target-audience-form.component.scss'
})
export class TargetAudienceFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly targetAudienceService = inject(TargetAudienceService);
  private readonly messageService = inject(MessageService);

  // Inputs
  readonly visible = input.required<boolean>();
  readonly targetAudience = input<TargetAudience | null>(null);

  // Outputs
  readonly onClose = output<void>();
  readonly onSave = output<void>();

  // Expose service signals
  readonly countries = this.targetAudienceService.countries;

  // Form state
  readonly estimatedScope = signal<number | null>(null);
  readonly isCalculating = signal(false);
  readonly isSaving = signal(false);

  private _selectedCities: number[] = [];
  get selectedCities(): number[] {
    return this._selectedCities;
  }
  set selectedCities(value: number[]) {
    this._selectedCities = value;
    // Trigger scope calculation when cities change
    if (this.canCalculateScope()) {
      this.calculateScope();
    } else {
      // Clear scope if conditions are no longer met
      this.estimatedScope.set(null);
    }
  }

  // Computed drawer title
  readonly drawerTitle = computed(() =>
    this.targetAudience() ? 'Editar Público Objetivo' : 'Crear Público Objetivo'
  );

  // Get cities from selected country
  readonly availableCities = computed(() => {
    const countryId = this.form.get('countryId')?.value;
    if (!countryId) return [];

    const country = this.countries().find(c => c.countryId === countryId);
    return country?.citiesSimples || [];
  });

  // Form
  readonly form = this.fb.nonNullable.group({
    idPublic: [0],
    countryId: [0, Validators.required],
    objectivePublicName: ['', [Validators.required, Validators.minLength(3)]],

    // Cities
    specifyPlace: [false],

    // Gender
    genderFlag: [false],
    genderMan: [false],
    genderWoman: [false],

    // Age
    ageLimitFlag: [false],
    startingAge: [null as number | null],
    ageLimit: [null as number | null],

    // Entry date
    creationDateFlag: [false],
    creationDate: [null as Date | null],
    limitSpecificDateFlag: [false],
    limitSpecificDate: [null as Date | null]
  });

  constructor() {
    // Effect to populate form when editing
    effect(() => {
      const audience = this.targetAudience();
      if (audience) {
        // Load detailed data
        this.targetAudienceService.getTargetAudienceById(audience.audienciaId).subscribe({
          next: (detail) => {
            this.form.patchValue({
              idPublic: detail.audienciaId,
              countryId: detail.idCountryTP || 0,
              objectivePublicName: detail.nameCriteria
            });

            // Set selected cities
            if (detail.idCitiesTP && detail.idCitiesTP.length > 0) {
              this.selectedCities = detail.idCitiesTP;
            }

            // Set gender criteria
            if (detail.sexCriteriaObj) {
              this.form.patchValue({
                genderFlag: detail.sexCriteriaObj.isActive,
                genderMan: detail.sexCriteriaObj.valueSex.includes(1),
                genderWoman: detail.sexCriteriaObj.valueSex.includes(2)
              });
            }

            // Set age criteria
            if (detail.ageCriteriaObj) {
              this.form.patchValue({
                ageLimitFlag: detail.ageCriteriaObj.isActive,
                startingAge: detail.ageCriteriaObj.valueAge[0] || null,
                ageLimit: detail.ageCriteriaObj.valueAge[1] || null
              });
            }

            // Set entry date criteria
            if (detail.entryDateObj) {
              this.form.patchValue({
                creationDateFlag: detail.entryDateObj.isActive,
                creationDate: detail.entryDateObj.initValue,
                limitSpecificDateFlag: detail.entryDateObj.isLimit,
                limitSpecificDate: detail.entryDateObj.limitValue
              });
            }
          },
          error: (error: unknown) => {
            console.error('Error loading target audience detail:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo cargar el detalle del público objetivo'
            });
          }
        });
      } else {
        this.resetForm();
      }
    });

    // Subscribe to form changes for real-time scope calculation (300ms debounce)
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(() => {
        if (this.canCalculateScope()) {
          this.calculateScope();
        } else {
          // Clear scope if conditions are no longer met
          this.estimatedScope.set(null);
        }
      });
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.form.reset({
      idPublic: 0,
      countryId: 0,
      objectivePublicName: '',
      specifyPlace: false,
      genderFlag: false,
      genderMan: false,
      genderWoman: false,
      ageLimitFlag: false,
      startingAge: null,
      ageLimit: null,
      creationDateFlag: false,
      creationDate: null,
      limitSpecificDateFlag: false,
      limitSpecificDate: null
    });
    this.selectedCities = [];
    this.estimatedScope.set(null);
  }

  /**
   * Check if we can calculate scope
   */
  private canCalculateScope(): boolean {
    const value = this.form.getRawValue();

    // Check basic required fields
    if (value.countryId === 0 || value.objectivePublicName === '' || this.selectedCities.length === 0) {
      return false;
    }

    // At least one filter must be active
    const hasGenderFilter = value.genderFlag && (value.genderMan || value.genderWoman);
    const hasAgeFilter = value.ageLimitFlag && value.startingAge !== null;
    const hasDateFilter = value.creationDateFlag && value.creationDate !== null;

    return hasGenderFilter || hasAgeFilter || hasDateFilter;
  }

  /**
   * Calculate estimated scope
   */
  private calculateScope(): void {
    if (!this.canCalculateScope()) {
      this.estimatedScope.set(null);
      return;
    }

    this.isCalculating.set(true);
    const dto = this.prepareDTO();

    this.targetAudienceService.calculateEstimatedScope(dto).subscribe({
      next: (response) => {
        this.estimatedScope.set(response.scope);
        this.isCalculating.set(false);
      },
      error: (error: unknown) => {
        console.error('Error calculating scope:', error);
        this.estimatedScope.set(null);
        this.isCalculating.set(false);
      }
    });
  }

  /**
   * Prepare DTO from form values
   */
  private prepareDTO(): GeneralTargetObjective {
    const value = this.form.getRawValue();

    return {
      nameTP: value.objectivePublicName,
      idCountryTP: value.countryId,
      idCitiesTP: this.selectedCities,

      sexCriteria: value.genderFlag ? {
        isActive: true,
        valueSex: [
          ...(value.genderMan ? [1] : []),
          ...(value.genderWoman ? [2] : [])
        ]
      } : null,

      ageCriteria: value.ageLimitFlag && value.startingAge !== null ? {
        isActive: true,
        valueAge: value.ageLimit !== null
          ? [value.startingAge, value.ageLimit]
          : [value.startingAge]
      } : null,

      entryDate: value.creationDateFlag && value.creationDate ? {
        isActive: true,
        initValue: value.creationDate,
        isLimit: value.limitSpecificDateFlag,
        limitValue: value.limitSpecificDate
      } : null
    };
  }

  /**
   * Validate form before submission
   */
  private validateForm(): boolean {
    // Check required fields
    if (this.form.get('objectivePublicName')?.invalid) {
      return false;
    }

    if (this.form.get('countryId')?.value === 0) {
      return false;
    }

    if (this.selectedCities.length === 0) {
      return false;
    }

    // At least one filter must be active
    const value = this.form.getRawValue();
    const hasGenderFilter = value.genderFlag && (value.genderMan || value.genderWoman);
    const hasAgeFilter = value.ageLimitFlag && value.startingAge !== null;
    const hasDateFilter = value.creationDateFlag && value.creationDate !== null;

    return hasGenderFilter || hasAgeFilter || hasDateFilter;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (!this.validateForm()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Complete todos los campos requeridos y active al menos un filtro'
      });
      return;
    }

    this.isSaving.set(true);
    const dto = this.prepareDTO();
    const audience = this.targetAudience();

    const request = audience
      ? this.targetAudienceService.updateTargetAudience(
          audience.audienciaId,
          audience.statusCriteria,
          dto
        )
      : this.targetAudienceService.createTargetAudience(dto);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Público objetivo ${audience ? 'actualizado' : 'creado'} correctamente`
        });
        this.isSaving.set(false);
        this.onSave.emit();
      },
      error: (error: unknown) => {
        console.error('Error saving target audience:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo ${audience ? 'actualizar' : 'crear'} el público objetivo`
        });
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Handle drawer close
   */
  onHide(): void {
    this.resetForm();
    this.onClose.emit();
  }
}
