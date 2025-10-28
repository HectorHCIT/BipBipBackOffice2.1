import { Component, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { ManualSettlementsService } from './manual-settlements.service';
import { ReportDownloadService } from '../../shared/services/report-download.service';
import { ReportFormat } from '../../models/report-common.types';

@Component({
  selector: 'app-manual-settlements',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    ToastModule,
    BreadcrumbModule
  ],
  providers: [ManualSettlementsService, MessageService],
  templateUrl: './manual-settlements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManualSettlementsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ManualSettlementsService);
  private readonly downloadService = inject(ReportDownloadService);
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isLoading = signal<boolean>(false);

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Contabilidad', routerLink: '/accounting' },
    { label: 'Reportes', routerLink: '/accounting/reports' },
    { label: 'Liquidaciones Manuales' }
  ];

  readonly form = this.fb.group({
    dateFrom: [new Date(), Validators.required],
    dateTo: [new Date(), Validators.required]
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
      dateFrom: this.formatDate(dateFrom),
      dateTo: this.formatDate(dateTo)
    };

    const filename = `liquidaciones-manuales-${request.dateFrom}-${request.dateTo}.pdf`;

    this.service.generateReport(request).subscribe({
      next: (base64) => {
        this.downloadService.download(base64, ReportFormat.PDF, filename);
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
      dateTo: new Date()
    });
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
