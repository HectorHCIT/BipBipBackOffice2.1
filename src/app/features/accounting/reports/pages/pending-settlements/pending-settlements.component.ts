import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { PendingSettlementsService } from './pending-settlements.service';
import { ReportDownloadService } from '../../shared/services/report-download.service';
import { ReportFormat, Brand } from '../../models/report-common.types';

@Component({
  selector: 'app-pending-settlements',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    ToastModule,
    BreadcrumbModule
  ],
  providers: [PendingSettlementsService, MessageService],
  templateUrl: './pending-settlements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingSettlementsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PendingSettlementsService);
  private readonly downloadService = inject(ReportDownloadService);
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly brands = signal<Brand[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isLoadingBrands = signal<boolean>(false);

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Contabilidad', routerLink: '/accounting' },
    { label: 'Reportes', routerLink: '/accounting/reports' },
    { label: 'Liquidaciones Pendientes' }
  ];

  readonly form = this.fb.group({
    date: [new Date(), Validators.required],
    brandId: [null as number | null, Validators.required]
  });

  ngOnInit(): void {
    this.loadBrands();
  }

  setToday(): void {
    this.form.patchValue({ date: new Date() });
  }

  setYesterday(): void {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.form.patchValue({ date: yesterday });
  }

  setLastWeek(): void {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    this.form.patchValue({ date: lastWeek });
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

    const date = this.form.value.date as Date;
    const brandId = this.form.value.brandId as number;

    this.isLoading.set(true);
    this.cdr.markForCheck();

    const request = {
      date: this.formatDateDDMMYYYY(date),
      brandId
    };

    const filename = `liquidaciones-pendientes-${request.date}-marca-${brandId}.pdf`;

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
      date: new Date(),
      brandId: null
    });
  }

  private loadBrands(): void {
    this.isLoadingBrands.set(true);
    this.cdr.markForCheck();

    this.service.getBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.isLoadingBrands.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading brands:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar marcas',
          detail: 'No se pudieron cargar las marcas disponibles',
          life: 3000
        });
        this.isLoadingBrands.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Formats date to DD-MM-YYYY (with padding)
   * Example: 05-01-2024
   */
  private formatDateDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
