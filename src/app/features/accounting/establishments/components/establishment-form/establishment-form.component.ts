import {
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

// PrimeNG
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';

// Models & Services
import { EstablishmentService } from '../../services/establishment.service';
import { EmissionPointSummary } from '../../models/establishment.model';

/**
 * EstablishmentFormComponent - Formulario para crear/editar establecimientos
 *
 * Se muestra en un Drawer lateral.
 * Incluye validaciones y carga de puntos de emisión.
 */
@Component({
  selector: 'app-establishment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DrawerModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToggleSwitchModule,
    ToastModule
  ],
  templateUrl: './establishment-form.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstablishmentFormComponent implements OnInit {
  private readonly establishmentService = inject(EstablishmentService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  // Inputs y Outputs
  readonly establishmentId = input<number | null>(null);
  readonly onClose = output<void>();
  readonly onSave = output<void>();

  // Estado local
  readonly isLoading = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly emissionPoints = signal<EmissionPointSummary[]>([]);

  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadEmissionPoints();

    // Si hay un ID, cargar los datos del establecimiento
    const id = this.establishmentId();
    if (id) {
      this.isEditMode.set(true);
      this.loadEstablishmentData(id);
    }
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    this.form = this.fb.group({
      establishmentsName: ['', [Validators.required, Validators.minLength(3)]],
      establishmentsNumb: ['', [Validators.required]],
      codEmissionPoint: [null, [Validators.required]],
      establishmentsAddress: ['', [Validators.required]],
      establishmentsActive: [true]
    });
  }

  /**
   * Carga la lista de puntos de emisión para el select
   */
  private loadEmissionPoints(): void {
    this.establishmentService.getEmissionPointsSummary().subscribe({
      next: (emissionPoints) => {
        this.emissionPoints.set(emissionPoints);
      },
      error: (error) => {
        console.error('Error loading emission points:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la lista de puntos de emisión'
        });
      }
    });
  }

  /**
   * Carga los datos del establecimiento para editar
   */
  private loadEstablishmentData(id: number): void {
    this.isLoading.set(true);

    this.establishmentService.getEstablishmentById(id).subscribe({
      next: (establishment) => {
        this.form.patchValue({
          establishmentsName: establishment.establishmentsName,
          establishmentsNumb: establishment.establishmentsNumb,
          codEmissionPoint: establishment.codEmissionPoint,
          establishmentsAddress: establishment.establishmentsAddress,
          establishmentsActive: establishment.establishmentsActive
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading establishment data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos del establecimiento'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Inválido',
        detail: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    this.isLoading.set(true);

    const formValue = this.form.value;
    const request = {
      nameEstablishments: formValue.establishmentsName,
      codCountry: 0, // Hardcoded
      numbEstablishments: formValue.establishmentsNumb,
      codEmissionPoint: formValue.codEmissionPoint,
      addressEstablishments: formValue.establishmentsAddress,
      active: formValue.establishmentsActive
    };

    const id = this.establishmentId();

    if (id) {
      // Actualizar establecimiento existente
      this.establishmentService.updateEstablishment(id, request).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.onSave.emit();
        },
        error: (error) => {
          console.error('Error updating establishment:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el establecimiento'
          });
          this.isLoading.set(false);
        }
      });
    } else {
      // Crear nuevo establecimiento
      this.establishmentService.createEstablishment(request).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.onSave.emit();
        },
        error: (error) => {
          console.error('Error creating establishment:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el establecimiento'
          });
          this.isLoading.set(false);
        }
      });
    }
  }

  /**
   * Cierra el drawer
   */
  handleClose(): void {
    this.onClose.emit();
  }

  /**
   * Verifica si un campo tiene errores y ha sido tocado
   */
  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
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
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }
}
