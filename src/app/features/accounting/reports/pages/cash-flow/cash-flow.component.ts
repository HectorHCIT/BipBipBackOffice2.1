import { Component, OnInit, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { CashFlowService } from './cash-flow.service';
import { ReportDownloadService } from '../../shared/services/report-download.service';
import { ReportFormat, Brand, Store } from '../../models/report-common.types';

/**
 * CashFlowComponent - Reporte de Flujo de Efectivo
 *
 * Reporte MEDIO con:
 * - Fecha
 * - Selector de marca (dropdown con logos)
 * - Selector de tienda (cascada desde marca)
 * - Solo PDF
 *
 * Patrón: Standalone component + Signals + OnPush + PrimeNG
 */
@Component({
  selector: 'app-cash-flow',
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
  templateUrl: './cash-flow.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CashFlowComponent implements OnInit {
  private readonly service = inject(CashFlowService);
  private readonly downloadService = inject(ReportDownloadService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isLoading = this.service.isLoading;

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Contabilidad', routerLink: '/accounting' },
    { label: 'Reportes', routerLink: '/accounting/reports' },
    { label: 'Flujo de Efectivo' }
  ];
  readonly brands = signal<Brand[]>([]);
  readonly stores = signal<Store[]>([]);
  readonly isLoadingStores = signal<boolean>(false);

  readonly form = this.fb.group({
    date: [new Date(), Validators.required],
    brandId: [null as number | null, Validators.required],
    storeId: [null as number | null, Validators.required]
  });

  ngOnInit(): void {
    this.loadBrands();

    // Cuando cambia la marca, cargar tiendas y resetear store
    this.form.get('brandId')?.valueChanges.subscribe((brandId) => {
      if (brandId) {
        this.loadStores(brandId);
        this.form.get('storeId')?.reset();
      } else {
        this.stores.set([]);
      }
    });
  }

  /**
   * Carga lista de marcas
   */
  private loadBrands(): void {
    this.service.getBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading brands:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar marcas'
        });
      }
    });
  }

  /**
   * Carga tiendas de una marca específica
   */
  private loadStores(brandId: number): void {
    this.isLoadingStores.set(true);
    this.service.getStoresByBrand(brandId).subscribe({
      next: (stores) => {
        this.stores.set(stores);
        this.isLoadingStores.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading stores:', error);
        this.isLoadingStores.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar tiendas'
        });
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Genera y descarga el reporte
   */
  generateReport(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Complete todos los campos: fecha, marca y unidad'
      });
      return;
    }

    const { date, storeId } = this.form.value;
    const store = this.stores().find(s => s.restId === storeId);

    if (!store) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontró la tienda seleccionada'
      });
      return;
    }

    this.service.generateReport(date!, store.shortName, store.restId).subscribe({
      next: (base64) => {
        // Construir nombre del archivo
        const dateStr = this.formatDateForFilename(date!);
        const filename = `flujo-efectivo_${store.shortName}_${dateStr}`;

        // Descargar usando el servicio centralizado
        this.downloadService.download(base64, ReportFormat.PDF, filename);

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Reporte generado',
          detail: `Se descargó ${filename}.pdf correctamente`,
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
      date: new Date(),
      brandId: null,
      storeId: null
    });
  }
}
