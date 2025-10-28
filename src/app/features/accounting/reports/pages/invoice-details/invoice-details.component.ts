import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';

// Services & Models
import { InvoiceDetailsService } from './invoice-details.service';
import { ReportDownloadService } from '../../shared/services/report-download.service';
import { ReportFormat } from '../../models/report-common.types';

/**
 * InvoiceDetailsComponent - Reporte de Detalles de Facturas
 *
 * Reporte SIMPLE con:
 * - Fecha desde / hasta
 * - Selector de formato (PDF/Excel)
 * - Validación de rango de fechas
 *
 * Patrón: Standalone component + Signals + OnPush + PrimeNG
 */
@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    ToastModule,
    BreadcrumbModule
  ],
  templateUrl: './invoice-details.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceDetailsComponent implements OnInit {
  private readonly service = inject(InvoiceDetailsService);
  private readonly downloadService = inject(ReportDownloadService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = this.service.isLoading;

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Contabilidad', routerLink: '/accounting' },
    { label: 'Reportes', routerLink: '/accounting/reports' },
    { label: 'Detalles de Facturas' }
  ];

  readonly formatOptions = [
    { label: 'PDF', value: ReportFormat.PDF },
    { label: 'Excel', value: ReportFormat.Excel }
  ];

  readonly form = this.fb.group({
    dateFrom: [new Date(), Validators.required],
    dateTo: [new Date(), Validators.required],
    format: [ReportFormat.PDF, Validators.required]
  });

  ngOnInit(): void {
    // Validación reactiva: dateFrom debe ser <= dateTo
    this.form.get('dateFrom')?.valueChanges.subscribe(() => this.validateDateRange());
    this.form.get('dateTo')?.valueChanges.subscribe(() => this.validateDateRange());
  }

  /**
   * Valida que la fecha inicial sea menor o igual a la fecha final
   */
  private validateDateRange(): void {
    const dateFrom = this.form.get('dateFrom')?.value;
    const dateTo = this.form.get('dateTo')?.value;

    if (dateFrom && dateTo && dateFrom > dateTo) {
      this.form.get('dateTo')?.setErrors({ dateRange: true });
    } else {
      // Limpiar error específico de dateRange
      const errors = this.form.get('dateTo')?.errors;
      if (errors?.['dateRange']) {
        delete errors['dateRange'];
        const hasOtherErrors = Object.keys(errors).length > 0;
        this.form.get('dateTo')?.setErrors(hasOtherErrors ? errors : null);
      }
    }
  }

  /**
   * Genera y descarga el reporte
   */
  generateReport(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Complete todos los campos requeridos'
      });
      return;
    }

    const { dateFrom, dateTo, format } = this.form.value;

    this.service.generateReport(dateFrom!, dateTo!, format!).subscribe({
      next: (base64) => {
        // Construir nombre del archivo con fechas
        const dateFromStr = this.formatDateForFilename(dateFrom!);
        const dateToStr = this.formatDateForFilename(dateTo!);
        const filename = `detalle-facturas_${dateFromStr}_${dateToStr}`;

        // Descargar usando el servicio centralizado
        this.downloadService.download(base64, format!, filename);

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Reporte generado',
          detail: `Se descargó ${filename} correctamente`,
          life: 3000
        });
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al generar el reporte. Intente nuevamente.'
        });
      }
    });
  }

  /**
   * Formatea fecha para nombre de archivo: YYYY-MM-DD
   */
  private formatDateForFilename(date: Date): string {
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
      dateFrom: new Date(),
      dateTo: new Date(),
      format: ReportFormat.PDF
    });
  }
}
