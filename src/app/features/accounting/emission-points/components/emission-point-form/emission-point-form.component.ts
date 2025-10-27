import {
  Component,
  OnInit,
  input,
  output,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

// PrimeNG
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';

// Models & Services
import {
  EmissionPointDetail,
  CreateEmissionPointRequest,
  UpdateEmissionPointRequest
} from '../../models/emission-point.model';
import { EmissionPointService } from '../../services/emission-point.service';

/**
 * EmissionPointFormComponent - Formulario de Punto de Emisión en Drawer
 *
 * Features:
 * - Crear nuevo punto de emisión
 * - Editar punto de emisión existente
 * - Toggle de estado activo/inactivo
 * - Validación de campos requeridos
 */
@Component({
  selector: 'app-emission-point-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DrawerModule,
    ButtonModule,
    InputTextModule,
    ToggleSwitchModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './emission-point-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmissionPointFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly emissionPointService = inject(EmissionPointService);
  private readonly messageService = inject(MessageService);

  // Inputs & Outputs
  readonly emissionPointId = input<number | null>(null);
  readonly onClose = output<void>();
  readonly onSave = output<void>();

  // Estado local
  readonly isLoading = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);

  // Formulario
  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();

    // Si hay ID, cargar datos para edición
    const id = this.emissionPointId();
    if (id) {
      this.isEditMode.set(true);
      this.loadEmissionPoint(id);
    }
  }

  /**
   * Inicializa el formulario
   */
  private initForm(): void {
    this.form = this.fb.group({
      emissionPointName: ['', [Validators.required, Validators.minLength(3)]],
      emissionPointNumb: ['', [Validators.required]],
      emissionPointAddress: ['', [Validators.required]],
      emissionPointEnabled: [true]
    });
  }

  /**
   * Carga los datos del punto de emisión para edición
   */
  private loadEmissionPoint(id: number): void {
    this.isLoading.set(true);

    this.emissionPointService.getEmissionPointById(id).subscribe({
      next: (emissionPoint: EmissionPointDetail) => {
        this.form.patchValue({
          emissionPointName: emissionPoint.emissionPointName,
          emissionPointNumb: emissionPoint.emissionPointNumb,
          emissionPointAddress: emissionPoint.emissionPointAddress,
          emissionPointEnabled: emissionPoint.emissionPointEnabled
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos del punto de emisión',
          life: 3000
        });
        this.isLoading.set(false);
        this.handleClose();
      }
    });
  }

  /**
   * Guarda el punto de emisión (crear o actualizar)
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor, completa todos los campos requeridos',
        life: 3000
      });
      return;
    }

    this.isLoading.set(true);

    const isEdit = this.isEditMode();
    const formValues = this.form.value;

    if (isEdit) {
      this.updateEmissionPoint(formValues);
    } else {
      this.createEmissionPoint(formValues);
    }
  }

  /**
   * Crea un nuevo punto de emisión
   */
  private createEmissionPoint(formValues: any): void {
    const request: CreateEmissionPointRequest = {
      nombrePuntoEmision: formValues.emissionPointName,
      codPais: 0, // TODO: Obtener del contexto global de compañía si es necesario
      numeroPuntoEmision: formValues.emissionPointNumb,
      direccion: formValues.emissionPointAddress
    };

    this.emissionPointService.createEmissionPoint(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.onSave.emit();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al crear el punto de emisión',
          life: 3000
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Actualiza un punto de emisión existente
   */
  private updateEmissionPoint(formValues: any): void {
    const id = this.emissionPointId();
    if (!id) return;

    const request: UpdateEmissionPointRequest = {
      nombrePuntoEmision: formValues.emissionPointName,
      codPais: 0, // TODO: Obtener del contexto global de compañía si es necesario
      numeroPuntoEmision: formValues.emissionPointNumb,
      direccion: formValues.emissionPointAddress
    };

    this.emissionPointService.updateEmissionPoint(id, request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.onSave.emit();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar el punto de emisión',
          life: 3000
        });
        this.isLoading.set(false);
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
   * Verifica si un campo es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }

    return '';
  }
}
