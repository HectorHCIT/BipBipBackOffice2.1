import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';

// Services & Models
import { AssignmentsReportService } from '../../services';
import { AssignmentsReportParams } from '../../../shared/models';
import {
  downloadExcelFromBase64,
  generateReportFilename,
  formatDateISO
} from '../../../shared/utils';

@Component({
  selector: 'app-assignments-report-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    BreadcrumbModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './assignments-report-page.component.html',
  styleUrl: './assignments-report-page.component.scss'
})
export class AssignmentsReportPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(AssignmentsReportService);
  private readonly messageService = inject(MessageService);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'SAC', routerLink: '/sac' },
    { label: 'Reportes', routerLink: '/sac/reportes' },
    { label: 'Asignaciones y Re-Asignaciones' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Signals
  readonly isLoading = signal(false);
  readonly maxDate = new Date();

  // Form
  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.form = this.fb.group({
      dateRange: [[thirtyDaysAgo, today], [Validators.required]]
    });
  }

  /**
   * Genera y descarga el reporte
   */
  generateReport(): void {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor selecciona un rango de fechas válido'
      });
      return;
    }

    const dateRange: Date[] = this.form.value.dateRange;
    if (!dateRange || dateRange.length !== 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debes seleccionar fecha de inicio y fin'
      });
      return;
    }

    const [startDate, endDate] = dateRange;

    const params: AssignmentsReportParams = {
      fechaInicio: formatDateISO(startDate),
      fechaFinal: formatDateISO(endDate)
    };

    this.isLoading.set(true);

    this.reportService.generateReport(params).subscribe({
      next: (response) => {

        try {
          // El backend puede retornar el base64 directamente o en una propiedad
          const base64 = response.data || response;

          if (!base64) {
            throw new Error('No se recibió el archivo del servidor');
          }

          const filename = generateReportFilename(
            'ReporteAsignaciones',
            startDate,
            endDate
          );

          downloadExcelFromBase64(base64, filename);

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Reporte descargado correctamente'
          });
        } catch (error) {
          console.error('Error al procesar el reporte:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo procesar el archivo descargado'
          });
        } finally {
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('❌ [ASSIGNMENTS-REPORT] Error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo generar el reporte'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Limpia el formulario
   */
  clearForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.form.patchValue({
      dateRange: [thirtyDaysAgo, today]
    });
  }
}
