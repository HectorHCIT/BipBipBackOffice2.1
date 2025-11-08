import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { MotivePenalized } from '../../models';
import { OrderTrackingService } from '../../services';

interface PenaltyReason {
  codDriverPenalty: number;
  reason: string;
}

@Component({
  selector: 'app-penalize-driver-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
    DatePickerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './penalize-driver-dialog.component.html',
  styleUrl: './penalize-driver-dialog.component.scss'
})
export class PenalizeDriverDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  readonly orderTrackingService = inject(OrderTrackingService);
  private readonly messageService = inject(MessageService);

  readonly driverId: number = this.config.data.id;
  readonly driverName: string = this.config.data.name;

  // Form
  readonly penaltyForm: FormGroup;

  // Penalty reasons
  readonly penaltyReasons = signal<PenaltyReason[]>([]);
  readonly loadingReasons = signal(true);
  readonly isSubmitting = signal(false);

  // Min date (today)
  readonly minDate = new Date();

  constructor() {
    this.penaltyForm = this.fb.group({
      reasonId: [null, Validators.required],
      descripcion: ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPenaltyReasons();
  }

  loadPenaltyReasons(): void {
    this.loadingReasons.set(true);
    this.orderTrackingService.getPenaltyReasons().subscribe({
      next: (reasons) => {
        this.penaltyReasons.set(reasons);
        this.loadingReasons.set(false);
      },
      error: (error) => {
        console.error('Error loading penalty reasons:', error);
        this.loadingReasons.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los motivos de penalización'
        });
      }
    });
  }

  onSubmit(): void {
    if (this.penaltyForm.valid) {
      const formValue = this.penaltyForm.value;

      // Validate dates
      const startDate = new Date(formValue.startDate);
      const endDate = new Date(formValue.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Fecha inválida',
          detail: 'La fecha inicial no puede ser menor al día actual'
        });
        return;
      }

      if (endDate < today) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Fecha inválida',
          detail: 'La fecha final no puede ser menor al día actual'
        });
        return;
      }

      if (endDate < startDate) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Fecha inválida',
          detail: 'La fecha final no puede ser menor a la fecha inicial'
        });
        return;
      }

      this.isSubmitting.set(true);

      const penaltyData: MotivePenalized = {
        driverId: this.driverId,
        descripcion: formValue.descripcion,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        reasonId: formValue.reasonId
      };

      this.orderTrackingService.penalizeDriver(penaltyData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Driver penalizado',
            detail: 'El driver ha sido penalizado exitosamente'
          });
          this.dialogRef.close({ success: true });
        },
        error: (error) => {
          console.error('Error al penalizar driver:', error);
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo penalizar al driver'
          });
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  // Helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.penaltyForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.penaltyForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    return '';
  }
}
