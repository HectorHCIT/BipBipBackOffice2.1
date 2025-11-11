import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';

// Services & Models
import { CouponsRedeemedService } from './coupons-redeemed.service';
import { ReportDownloadService } from '../../shared/services/report-download.service';
import { ReportFormat, City } from '../../models/report-common.types';

/**
 * CouponsRedeemedComponent - Reporte de Cupones Canjeados
 *
 * Reporte COMPLEJO con:
 * - Rango de fechas con presets (hoy, semana, mes, personalizado)
 * - Multi-selector de ciudades
 * - Solo Excel XLSX
 *
 * Patrón: Standalone component + Signals + OnPush + PrimeNG
 */
@Component({
  selector: 'app-coupons-redeemed',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    MultiSelectModule,
    ToastModule,
    BreadcrumbModule
  ],
  templateUrl: './coupons-redeemed.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CouponsRedeemedComponent implements OnInit {
  private readonly service = inject(CouponsRedeemedService);
  private readonly downloadService = inject(ReportDownloadService);
  private readonly messageService = inject(MessageService);

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Contabilidad', routerLink: '/accounting' },
    { label: 'Reportes', routerLink: '/accounting/reports' },
    { label: 'Cupones Canjeados' }
  ];
  private readonly fb = inject(FormBuilder);

  readonly isLoading = this.service.isLoading;
  readonly cities = signal<City[]>([]);
  readonly isLoadingCities = signal<boolean>(false);

  readonly form = this.fb.group({
    dateFrom: [new Date(), Validators.required],
    dateTo: [new Date(), Validators.required],
    cityIds: [[] as number[], Validators.required]
  });

  ngOnInit(): void {
    this.loadCities();

    // Validar rango de fechas
    this.form.get('dateFrom')?.valueChanges.subscribe(() => this.validateDateRange());
    this.form.get('dateTo')?.valueChanges.subscribe(() => this.validateDateRange());
  }

  /**
   * Carga lista de ciudades
   */
  private loadCities(): void {
    this.isLoadingCities.set(true);
    this.service.getCities().subscribe({
      next: (cities) => {
        this.cities.set(cities);
        this.isLoadingCities.set(false);
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.isLoadingCities.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar ciudades'
        });
      }
    });
  }

  /**
   * Valida que dateFrom sea <= dateTo
   */
  private validateDateRange(): void {
    const dateFrom = this.form.get('dateFrom')?.value;
    const dateTo = this.form.get('dateTo')?.value;

    if (dateFrom && dateTo && dateFrom > dateTo) {
      this.form.get('dateTo')?.setErrors({ dateRange: true });
    } else {
      const errors = this.form.get('dateTo')?.errors;
      if (errors?.['dateRange']) {
        delete errors['dateRange'];
        const hasOtherErrors = Object.keys(errors).length > 0;
        this.form.get('dateTo')?.setErrors(hasOtherErrors ? errors : null);
      }
    }
  }

  /**
   * Presets de fechas para acceso rápido
   */
  setToday(): void {
    const today = new Date();
    this.form.patchValue({
      dateFrom: today,
      dateTo: today
    });
  }

  setLastWeek(): void {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    this.form.patchValue({
      dateFrom: lastWeek,
      dateTo: today
    });
  }

  setLastMonth(): void {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    this.form.patchValue({
      dateFrom: lastMonth,
      dateTo: today
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
        detail: 'Complete todos los campos: fechas y al menos una ciudad'
      });
      return;
    }

    const { dateFrom, dateTo, cityIds } = this.form.value;

    if (!cityIds || cityIds.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selección requerida',
        detail: 'Debe seleccionar al menos una ciudad'
      });
      return;
    }

    this.service.generateReport(dateFrom!, dateTo!, cityIds).subscribe({
      next: (base64) => {
        // Construir nombre del archivo
        const dateFromStr = this.formatDateForFilename(dateFrom!);
        const dateToStr = this.formatDateForFilename(dateTo!);
        const cityCount = cityIds.length;
        const filename = `cupones-canjeados_${dateFromStr}_${dateToStr}_${cityCount}ciudades`;

        // Descargar usando el servicio centralizado (Excel .xlsx formato antiguo)
        this.downloadService.download(base64, ReportFormat.Excel, filename);

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Reporte generado',
          detail: `Se descargó ${filename}.xlsx correctamente`,
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
   * Getter para saber si hay ciudades seleccionadas
   */
  get hasCitiesSelected(): boolean {
    const cityIds = this.form.get('cityIds')?.value;
    return cityIds ? cityIds.length > 0 : false;
  }

  /**
   * Limpia el formulario con valores por defecto
   */
  resetForm(): void {
    this.form.reset({
      dateFrom: new Date(),
      dateTo: new Date(),
      cityIds: []
    });
  }
}
