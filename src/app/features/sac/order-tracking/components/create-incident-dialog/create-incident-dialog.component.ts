import { Component, input, output, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CreateIncidentRequest } from '../../models';

interface IncidentType {
  label: string;
  value: number;
}

@Component({
  selector: 'app-create-incident-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    FloatLabelModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-incident-dialog.component.html',
  styleUrl: './create-incident-dialog.component.scss'
})
export class CreateIncidentDialogComponent {
  // Inputs
  readonly visible = input.required<boolean>();
  readonly orderNumber = input.required<number>();
  readonly loading = input<boolean>(false);

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly confirm = output<CreateIncidentRequest>();

  // Form
  readonly incidentForm: FormGroup;

  // Incident types - IDs basados en el catálogo del backend
  readonly incidentTypes: IncidentType[] = [
    { label: 'Producto incorrecto', value: 1 },
    { label: 'Producto faltante', value: 2 },
    { label: 'Producto dañado', value: 3 },
    { label: 'Entrega tardía', value: 4 },
    { label: 'Dirección incorrecta', value: 5 },
    { label: 'Cliente no disponible', value: 6 },
    { label: 'Problema con el pago', value: 7 },
    { label: 'Otro', value: 8 }
  ];

  constructor(private fb: FormBuilder) {
    this.incidentForm = this.fb.group({
      reason: [null, Validators.required],
      comment: ['', [Validators.required, Validators.minLength(10)]],
      solution: ['', [Validators.required, Validators.minLength(5)]],
      attendant: ['', Validators.required]
    });

    // Reset form when dialog closes
    effect(() => {
      if (!this.visible()) {
        this.incidentForm.reset();
      }
    });
  }

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  onCancel(): void {
    this.incidentForm.reset();
    this.visibleChange.emit(false);
  }

  onSubmit(): void {
    if (this.incidentForm.valid) {
      const formValue = this.incidentForm.value;
      const incidentData: CreateIncidentRequest = {
        orderId: this.orderNumber(),
        reason: formValue.reason.toString(), // Convertir a string como en la versión OLD
        comment: formValue.comment,
        solution: formValue.solution,
        attendant: formValue.attendant
      };
      this.confirm.emit(incidentData);
    }
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.incidentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.incidentForm.get(fieldName);
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
