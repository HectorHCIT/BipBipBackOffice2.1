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
import { CompanyService } from '../../services/company.service';
import { Country } from '../../models/company.model';

/**
 * CompanyFormComponent - Formulario para crear/editar empresas
 *
 * Se muestra en un Drawer lateral.
 * Incluye validaciones y carga de países.
 */
@Component({
  selector: 'app-company-form',
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
  templateUrl: './company-form.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyFormComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  // Inputs y Outputs
  readonly companyId = input<number | null>(null);
  readonly onClose = output<void>();
  readonly onSave = output<void>();

  // Estado local
  readonly isLoading = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly countries = signal<Country[]>([]);

  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadCountries();

    // Si hay un ID, cargar los datos de la empresa
    const id = this.companyId();
    if (id) {
      this.isEditMode.set(true);
      this.loadCompanyData(id);
    }
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    this.form = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(3)]],
      socialReasonName: ['', [Validators.required, Validators.minLength(3)]],
      countryId: [null, [Validators.required]],
      companyRTN: ['', [Validators.required]],
      companyEmail: ['', [Validators.required, Validators.email]],
      companyPhone: ['', [Validators.required]],
      companyAddress: ['', [Validators.required]],
      companyActive: [true]
    });
  }

  /**
   * Carga la lista de países para el select
   */
  private loadCountries(): void {
    this.companyService.getCountries().subscribe({
      next: (countries) => {
        this.countries.set(countries.filter(c => c.isActive));
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la lista de países'
        });
      }
    });
  }

  /**
   * Carga los datos de la empresa para editar
   */
  private loadCompanyData(id: number): void {
    this.isLoading.set(true);

    this.companyService.getCompanyById(id).subscribe({
      next: (company) => {
        this.form.patchValue({
          companyName: company.companyName,
          socialReasonName: company.socialReasonName,
          countryId: company.countryId,
          companyRTN: company.companyRTN,
          companyEmail: company.companyEmail,
          companyPhone: company.companyPhone,
          companyAddress: company.companyAddress,
          companyActive: company.companyActive
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading company data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos de la empresa'
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
      nombreNegocio: formValue.companyName,
      razonSocial: formValue.socialReasonName,
      codPais: formValue.countryId,
      rtn: formValue.companyRTN,
      email: formValue.companyEmail,
      telefono: formValue.companyPhone,
      direccion: formValue.companyAddress
    };

    const id = this.companyId();

    if (id) {
      // Actualizar empresa existente
      this.companyService.updateCompany(id, request).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.onSave.emit();
        },
        error: (error) => {
          console.error('Error updating company:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar la empresa'
          });
          this.isLoading.set(false);
        }
      });
    } else {
      // Crear nueva empresa
      this.companyService.createCompany(request).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.onSave.emit();
        },
        error: (error) => {
          console.error('Error creating company:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la empresa'
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
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    return '';
  }
}
