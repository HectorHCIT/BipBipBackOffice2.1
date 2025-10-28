import { Component, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { NotDeliveryService } from './not-delivery.service';
import { ReportDownloadService } from '../../shared/services/report-download.service';
import { ReportFormat } from '../../models/report-common.types';

@Component({
  selector: 'app-not-delivery',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    ToastModule,
    BreadcrumbModule
  ],
  providers: [NotDeliveryService, MessageService],
  templateUrl: './not-delivery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotDeliveryComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(NotDeliveryService);
  private readonly downloadService = inject(ReportDownloadService);
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isLoading = signal<boolean>(false);
  readonly ReportFormat = ReportFormat;

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Contabilidad', routerLink: '/accounting' },
    { label: 'Reportes', routerLink: '/accounting/reports' },
    { label: 'Facturas No Entregadas' }
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

  setToday(): void {
    const today = new Date();
    this.form.patchValue({ dateFrom: today, dateTo: today });
  }

  setLastWeek(): void {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    this.form.patchValue({ dateFrom: lastWeek, dateTo: today });
  }

  setLastMonth(): void {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    this.form.patchValue({ dateFrom: lastMonth, dateTo: today });
  }

  generateReport(): void {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor completa todos los campos requeridos',
        life: 3000
      });
      return;
    }

    const dateFrom = this.form.value.dateFrom as Date;
    const dateTo = this.form.value.dateTo as Date;
    const format = this.form.value.format as ReportFormat;

    if (dateFrom > dateTo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Rango de fechas inválido',
        detail: 'La fecha inicial debe ser anterior a la fecha final',
        life: 3000
      });
      return;
    }

    this.isLoading.set(true);
    this.cdr.markForCheck();

    const request = {
      dateFrom: this.formatDateDMY(dateFrom),
      dateTo: this.formatDateDMY(dateTo),
      format
    };

    const extension = format === ReportFormat.PDF ? 'pdf' : 'xlsx';
    const filename = `no-entregadas-${request.dateFrom}-${request.dateTo}.${extension}`;

    this.service.generateReport(request).subscribe({
      next: (base64) => {
        this.downloadService.download(base64, format, filename);
        this.messageService.add({
          severity: 'success',
          summary: 'Reporte generado',
          detail: `Se descargó ${filename} correctamente`,
          life: 3000
        });
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al generar reporte',
          detail: 'Ocurrió un error al intentar generar el reporte',
          life: 3000
        });
        this.isLoading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  resetForm(): void {
    this.form.reset({
      dateFrom: new Date(),
      dateTo: new Date(),
      format: ReportFormat.PDF
    });
  }

  /**
   * Formats date to D-M-YYYY (no padding)
   * Example: 5-1-2024
   */
  private formatDateDMY(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
