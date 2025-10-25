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
  DocumentTypeDetail,
  CreateDocumentTypeRequest,
  UpdateDocumentTypeRequest
} from '../../models/document-type.model';
import { DocumentTypeService } from '../../services/document-type.service';

/**
 * DocumentTypeFormComponent - Formulario de Tipo de Documento en Drawer
 *
 * Features:
 * - Crear nuevo tipo de documento
 * - Editar tipo de documento existente
 * - Toggle de estado activo/inactivo
 * - Validación de campos requeridos
 */
@Component({
  selector: 'app-document-type-form',
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
  templateUrl: './document-type-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentTypeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly documentTypeService = inject(DocumentTypeService);
  private readonly messageService = inject(MessageService);

  // Inputs & Outputs
  readonly documentTypeId = input<number | null>(null);
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
    const id = this.documentTypeId();
    if (id) {
      this.isEditMode.set(true);
      this.loadDocumentType(id);
    }
  }

  /**
   * Inicializa el formulario
   */
  private initForm(): void {
    this.form = this.fb.group({
      docTypeName: ['', [Validators.required, Validators.minLength(3)]],
      docTypeNumb: ['', [Validators.required]],
      isActive: [true]
    });
  }

  /**
   * Carga los datos del tipo de documento para edición
   */
  private loadDocumentType(id: number): void {
    this.isLoading.set(true);

    this.documentTypeService.getDocumentTypeById(id).subscribe({
      next: (documentType: DocumentTypeDetail) => {
        this.form.patchValue({
          docTypeName: documentType.docTypeName,
          docTypeNumb: documentType.docTypeNumb,
          isActive: documentType.isActive
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos del tipo de documento',
          life: 3000
        });
        this.isLoading.set(false);
        this.handleClose();
      }
    });
  }

  /**
   * Guarda el tipo de documento (crear o actualizar)
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
      this.updateDocumentType(formValues);
    } else {
      this.createDocumentType(formValues);
    }
  }

  /**
   * Crea un nuevo tipo de documento
   */
  private createDocumentType(formValues: any): void {
    const request: CreateDocumentTypeRequest = {
      nombreTipoDocumento: formValues.docTypeName,
      codPais: 0, // TODO: Obtener del contexto global de compañía si es necesario
      numeroTipoDocumento: formValues.docTypeNumb,
      activo: formValues.isActive
    };

    this.documentTypeService.createDocumentType(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.onSave.emit();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al crear el tipo de documento',
          life: 3000
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Actualiza un tipo de documento existente
   */
  private updateDocumentType(formValues: any): void {
    const id = this.documentTypeId();
    if (!id) return;

    const request: UpdateDocumentTypeRequest = {
      nombreTipoDocumento: formValues.docTypeName,
      codPais: 0, // TODO: Obtener del contexto global de compañía si es necesario
      numeroTipoDocumento: formValues.docTypeNumb,
      activo: formValues.isActive
    };

    this.documentTypeService.updateDocumentType(id, request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.onSave.emit();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar el tipo de documento',
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
