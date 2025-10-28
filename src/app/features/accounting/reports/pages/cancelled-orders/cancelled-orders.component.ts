import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { CancelledOrdersService } from './cancelled-orders.service';
import { ReportDownloadService } from '../../shared/services/report-download.service';
import { ReportFormat, Brand, Store } from '../../models/report-common.types';

@Component({
  selector: 'app-cancelled-orders',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule,
    ToastModule,
    BreadcrumbModule
  ],
  providers: [CancelledOrdersService, MessageService],
  templateUrl: './cancelled-orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CancelledOrdersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CancelledOrdersService);
  private readonly downloadService = inject(ReportDownloadService);
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly brands = signal<Brand[]>([]);
  readonly stores = signal<Store[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isLoadingBrands = signal<boolean>(false);
  readonly isLoadingStores = signal<boolean>(false);
  readonly selectAllStores = signal<boolean>(false);

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Contabilidad', routerLink: '/accounting' },
    { label: 'Reportes', routerLink: '/accounting/reports' },
    { label: 'Órdenes Canceladas' }
  ];

  readonly form = this.fb.group({
    fechaInicio: [new Date(), Validators.required],
    fechaFin: [new Date(), Validators.required],
    brandId: [null as number | null, Validators.required],
    storeIds: [[] as number[]] // Optional, no validator
  });

  ngOnInit(): void {
    this.loadBrands();
    this.setupBrandChangeListener();
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

  toggleSelectAllStores(): void {
    const newValue = !this.selectAllStores();
    this.selectAllStores.set(newValue);

    if (newValue) {
      // Select all stores
      const allStoreIds = this.stores().map(s => s.restId);
      this.form.patchValue({ storeIds: allStoreIds });
    } else {
      // Deselect all
      this.form.patchValue({ storeIds: [] });
    }
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
    const brandId = this.form.value.brandId as number;
    const storeIds = this.form.value.storeIds as number[];

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
      fechaI: this.formatDateISO(fechaInicio),
      fechaF: this.formatDateISO(fechaFin),
      brandId,
      ...(storeIds && storeIds.length > 0 && { storeIds })
    };

    const fechaIStr = this.formatDateForFileName(fechaInicio);
    const fechaFStr = this.formatDateForFileName(fechaFin);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:\-T]/g, '');
    const filename = `ordenes-canceladas-${fechaIStr}-${fechaFStr}-${timestamp}.xlsx`;

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
      brandId: null,
      storeIds: []
    });
    this.stores.set([]);
    this.selectAllStores.set(false);
  }

  private setupBrandChangeListener(): void {
    this.form.get('brandId')?.valueChanges.subscribe(brandId => {
      if (brandId) {
        this.loadStores(brandId);
        // Reset stores selection when brand changes
        this.form.patchValue({ storeIds: [] });
        this.selectAllStores.set(false);
      } else {
        this.stores.set([]);
        this.form.patchValue({ storeIds: [] });
        this.selectAllStores.set(false);
      }
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

  private loadStores(brandId: number): void {
    this.isLoadingStores.set(true);
    this.cdr.markForCheck();

    this.service.getStoresByBrand(brandId).subscribe({
      next: (stores) => {
        this.stores.set(stores);
        this.isLoadingStores.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading stores:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar tiendas',
          detail: 'No se pudieron cargar las tiendas de esta marca',
          life: 3000
        });
        this.isLoadingStores.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  private formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateForFileName(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/\-/g, '');
  }
}
