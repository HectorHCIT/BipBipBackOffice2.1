import { Component, OnInit, input, output, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

// PrimeNG
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FloatLabelModule } from 'primeng/floatlabel';

// Models & Services
import {
  FiscalCorrelativeDetail,
  CreateFiscalCorrelativeRequest,
  UpdateFiscalCorrelativeRequest,
  CompanySummary,
  CountrySummary,
  EstablishmentSummary,
  EmissionPointSummary,
  DocumentTypeSummary
} from '../../models/fiscal-correlative.model';
import { FiscalCorrelativeService } from '../../services/fiscal-correlative.service';

/**
 * FiscalCorrelativeFormComponent - Formulario para crear/editar correlativos fiscales
 *
 * Features:
 * - 11 campos (5 selects, 2 datepickers, 3 inputs, 1 toggle)
 * - Validaciones de fechas (inicio < límite)
 * - Validaciones de números (inicial < final)
 * - Drawer lateral
 * - Modo crear/editar
 */
@Component({
  selector: 'app-fiscal-correlative-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DrawerModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    ToggleSwitchModule,
    FloatLabelModule
  ],
  templateUrl: './fiscal-correlative-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiscalCorrelativeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly fiscalCorrelativeService = inject(FiscalCorrelativeService);
  private readonly messageService = inject(MessageService);

  // Inputs y Outputs
  readonly correlativeId = input<number | null>(null);
  readonly onClose = output<void>();
  readonly onSave = output<void>();

  // Form
  form!: FormGroup;

  // Signals para listas de selects
  readonly companies = signal<CompanySummary[]>([]);
  readonly countries = signal<CountrySummary[]>([]);
  readonly establishments = signal<EstablishmentSummary[]>([]);
  readonly emissionPoints = signal<EmissionPointSummary[]>([]);
  readonly documentTypes = signal<DocumentTypeSummary[]>([]);

  // Estado
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();

    const id = this.correlativeId();
    if (id) {
      this.isEditMode.set(true);
      this.loadCorrelativeData(id);
    }
  }

  /**
   * Inicializa el formulario con sus validaciones
   */
  private initForm(): void {
    this.form = this.fb.group({
      codCompany: [null, [Validators.required]],
      codCountry: [null, [Validators.required]],
      codEstablishment: [null, [Validators.required]],
      emissionPoint: [null, [Validators.required]],
      documentType: [null, [Validators.required]],
      cai: ['', [Validators.required, Validators.minLength(3)]],
      dateFrom: [null, [Validators.required]],
      dateUntil: [null, [Validators.required]],
      initialNumber: [null, [Validators.required, Validators.min(0)]],
      finalNumber: [null, [Validators.required, Validators.min(1)]],
      active: [true]
    });
  }

  /**
   * Carga datos de todos los dropdowns
   */
  private loadDropdownData(): void {
    // Cargar empresas
    this.fiscalCorrelativeService.getCompaniesSummary().subscribe({
      next: (companies) => {
        this.companies.set(companies);
      },
      error: (error) => {
        console.error('Error loading companies:', error);
      }
    });

    // Cargar países
    this.fiscalCorrelativeService.getCountriesSummary().subscribe({
      next: (countries) => {
        this.countries.set(countries);
      },
      error: (error) => {
        console.error('Error loading countries:', error);
      }
    });

    // Cargar establecimientos
    this.fiscalCorrelativeService.getEstablishmentsSummary().subscribe({
      next: (establishments) => {
        this.establishments.set(establishments);
      },
      error: (error) => {
        console.error('Error loading establishments:', error);
      }
    });

    // Cargar puntos de emisión
    this.fiscalCorrelativeService.getEmissionPointsSummary().subscribe({
      next: (emissionPoints) => {
        this.emissionPoints.set(emissionPoints);
      },
      error: (error) => {
        console.error('Error loading emission points:', error);
      }
    });

    // Cargar tipos de documento
    this.fiscalCorrelativeService.getDocumentTypesSummary().subscribe({
      next: (documentTypes) => {
        this.documentTypes.set(documentTypes);
      },
      error: (error) => {
        console.error('Error loading document types:', error);
      }
    });
  }

  /**
   * Carga los datos del correlativo para edición
   */
  private loadCorrelativeData(id: number): void {
    this.isLoading.set(true);

    this.fiscalCorrelativeService.getFiscalCorrelativeById(id).subscribe({
      next: (correlative: FiscalCorrelativeDetail) => {
        this.form.patchValue({
          codCompany: correlative.companyCod,
          codCountry: correlative.corrBillCountryId,
          codEstablishment: correlative.establishmentId,
          emissionPoint: correlative.pointEmissionId,
          documentType: correlative.documentTypeId,
          cai: correlative.corrBillCAI,
          dateFrom: new Date(correlative.corrBillDateFrom),
          dateUntil: new Date(correlative.corrBillDateUntil),
          initialNumber: correlative.corrBillInitNum,
          finalNumber: correlative.corrBillEndNum,
          active: correlative.corrBillActive
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading correlative:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el correlativo fiscal'
        });
        this.isLoading.set(false);
        this.handleClose();
      }
    });
  }

  /**
   * Valida las fechas
   */
  private validateDates(): boolean {
    const dateFrom = this.form.get('dateFrom')?.value;
    const dateUntil = this.form.get('dateUntil')?.value;

    if (dateFrom && dateUntil) {
      if (dateFrom >= dateUntil) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de validación',
          detail: 'La fecha de inicio debe ser menor a la fecha límite'
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Valida los números
   */
  private validateNumbers(): boolean {
    const initialNumber = this.form.get('initialNumber')?.value;
    const finalNumber = this.form.get('finalNumber')?.value;

    if (initialNumber !== null && finalNumber !== null) {
      if (initialNumber >= finalNumber) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de validación',
          detail: 'El número inicial debe ser menor al número final'
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Guarda el formulario (crear o editar)
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor complete todos los campos requeridos'
      });
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    // Validar fechas
    if (!this.validateDates()) {
      return;
    }

    // Validar números
    if (!this.validateNumbers()) {
      return;
    }

    this.isSaving.set(true);

    const formValue = this.form.value;

    // Preparar request (API usa PascalCase)
    const request: CreateFiscalCorrelativeRequest | UpdateFiscalCorrelativeRequest = {
      CodEmpresa: formValue.codCompany,
      CodPais: formValue.codCountry,
      CodEstablecimiento: formValue.codEstablishment,
      PuntoEmision: formValue.emissionPoint,
      TipoDocumento: formValue.documentType,
      CAI: formValue.cai,
      FechaInicio: formValue.dateFrom.toISOString(),
      FechaFinal: formValue.dateUntil.toISOString(),
      NumeroInicial: formValue.initialNumber,
      NumeroFinal: formValue.finalNumber
    };

    const operation = this.isEditMode()
      ? this.fiscalCorrelativeService.updateFiscalCorrelative(this.correlativeId()!, request)
      : this.fiscalCorrelativeService.createFiscalCorrelative(request);

    operation.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.onSave.emit();
      },
      error: (error) => {
        console.error('Error saving fiscal correlative:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al guardar el correlativo fiscal'
        });
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Cierra el drawer
   */
  handleClose(): void {
    this.onClose.emit();
  }

  /**
   * Verifica si un campo tiene error
   */
  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtiene el mensaje de error de un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('min')) {
      return `Valor mínimo: ${field.errors?.['min'].min}`;
    }
    return '';
  }
}
