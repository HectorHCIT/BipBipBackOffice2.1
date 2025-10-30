import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services & Utils
import { DeliveriesReportsService } from '../../../../services/deliveries-reports.service';
import { exportExcel } from '../../../../utils/report-export.utils';

/**
 * ReportActivacionComponent - Reporte de Activaciones de Drivers
 *
 * Reporte SIMPLE con:
 * - Rango de fechas (inicio/fin)
 * - Solo Excel
 * - Formato de fecha ISO (YYYY-MM-DD)
 *
 * Nota: Este reporte tiene campos de ciudad y formato comentados en el old
 * porque solo genera Excel y no los usa.
 *
 * Patrón: Standalone component + Signals + OnPush + PrimeNG
 */
@Component({
  selector: 'app-report-activacion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    CardModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  templateUrl: './report-activacion.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportActivacionComponent implements OnInit {
  private readonly service = inject(DeliveriesReportsService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal<boolean>(false);

  readonly form = this.fb.group({
    dateInit: [new Date(), Validators.required],
    dateEnd: [new Date(), Validators.required]
  });

  ngOnInit(): void {
    // No requiere cargar datos de referencia (cities, etc.)
  }

  /**
   * Genera y descarga el reporte de activaciones
   * Solo Excel, formato de fecha ISO (YYYY-MM-DD)
   */
  generateReport(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Complete ambas fechas para generar el reporte'
      });
      return;
    }

    const { dateInit, dateEnd } = this.form.value;

    // Formatear fechas a ISO (YYYY-MM-DD)
    const startDate = this.formatDateISO(dateInit!);
    const endDate = this.formatDateISO(dateEnd!);

    this.isLoading.set(true);

    this.service.getReportActivations(startDate, endDate).subscribe({
      next: (base64) => {
        // Descargar Excel
        const filename = `reporte-activaciones_${startDate}_${endDate}`;
        exportExcel(base64, filename);

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Reporte generado',
          detail: `Se descargó ${filename}.xls correctamente`,
          life: 3000
        });

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al generar el reporte. Intente nuevamente.'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Formatea fecha a YYYY-MM-DD (ISO format)
   * Requerido por el API de activaciones
   */
  private formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Limpia el formulario con valores por defecto
   */
  resetForm(): void {
    this.form.reset({
      dateInit: new Date(),
      dateEnd: new Date()
    });
  }
}
