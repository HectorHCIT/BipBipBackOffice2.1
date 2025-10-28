import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { ProductsRankedService } from './products-ranked.service';
import { ReportDownloadService } from '../../shared/services/report-download.service';
import { ReportFormat, Brand } from '../../models/report-common.types';

@Component({
  selector: 'app-products-ranked',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    MultiSelectModule,
    InputNumberModule,
    ToastModule,
    BreadcrumbModule
  ],
  providers: [ProductsRankedService, MessageService],
  templateUrl: './products-ranked.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsRankedComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductsRankedService);
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
    { label: 'Productos Clasificados' }
  ];

  readonly form = this.fb.group({
    fechaInicio: [new Date(), Validators.required],
    fechaFin: [new Date(), Validators.required],
    marcas: [[] as number[], Validators.required],
    top: [null as number | null] // Optional
  });

  ngOnInit(): void {
    this.loadBrands();
  }

  setToday(): void {
    const today = new Date();
    this.form.patchValue({ fechaInicio: today, fechaFin: today });
  }

  setLastWeek(): void {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    this.form.patchValue({ fechaInicio: lastWeek, fechaFin: today });
  }

  setLastMonth(): void {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    this.form.patchValue({ fechaInicio: lastMonth, fechaFin: today });
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
    const fechaFin = this.form.value.fechaFin as Date;
    const marcas = this.form.value.marcas as number[];
    const top = this.form.value.top as number | null;

    if (fechaInicio > fechaFin) {
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
      fechaFinal: fechaFin.toISOString(),
      marcas,
      ...(top && { top })
    };

    const fechaInicioStr = this.formatDateForFileName(fechaInicio);
    const fechaFinStr = this.formatDateForFileName(fechaFin);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:\-T]/g, '');
    const filename = `productos-clasificados-${fechaInicioStr}-${fechaFinStr}-${timestamp}.xlsx`;

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
      fechaFin: new Date(),
      marcas: [],
      top: null
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

  private formatDateForFileName(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/\-/g, '');
  }
}
