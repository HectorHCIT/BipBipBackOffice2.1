import { Component, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { InactiveDeliveriesService } from './inactive-deliveries.service';
import { ReportDownloadService } from '../../shared/services/report-download.service';
import { ReportFormat } from '../../models/report-common.types';

@Component({
  selector: 'app-inactive-deliveries',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    ToastModule,
    BreadcrumbModule
  ],
  providers: [InactiveDeliveriesService, MessageService],
  templateUrl: './inactive-deliveries.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InactiveDeliveriesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InactiveDeliveriesService);
  private readonly downloadService = inject(ReportDownloadService);
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isLoading = signal<boolean>(false);

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Contabilidad', routerLink: '/accounting' },
    { label: 'Reportes', routerLink: '/accounting/reports' },
    { label: 'Repartidores Inactivos' }
  ];

  readonly form = this.fb.group({
    fechaInicio: [new Date(), Validators.required],
    fechaFinal: [new Date(), Validators.required]
  });

  setToday(): void {
    const today = new Date();
    this.form.patchValue({ fechaInicio: today, fechaFinal: today });
  }

  setLastWeek(): void {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    this.form.patchValue({ fechaInicio: lastWeek, fechaFinal: today });
  }

  setLastMonth(): void {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    this.form.patchValue({ fechaInicio: lastMonth, fechaFinal: today });
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

    const fechaInicio = this.form.value.fechaInicio as Date;
    const fechaFinal = this.form.value.fechaFinal as Date;

    if (fechaInicio > fechaFinal) {
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
      fechaInicio: fechaInicio.toISOString(),
      fechaFinal: fechaFinal.toISOString()
    };

    const fechaInicioStr = this.formatDateForFileName(fechaInicio);
    const fechaFinalStr = this.formatDateForFileName(fechaFinal);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:\-T]/g, '');
    const filename = `deliveries-inactivos-${fechaInicioStr}-${fechaFinalStr}-${timestamp}.xlsx`;

    this.service.generateReport(request).subscribe({
      next: (base64) => {
        this.downloadService.download(base64, ReportFormat.Excel, filename);
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
      fechaInicio: new Date(),
      fechaFinal: new Date()
    });
  }

  private formatDateForFileName(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/\-/g, '');
  }
}
