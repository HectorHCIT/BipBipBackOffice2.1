import { Component, OnInit, signal, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { DeliveriesReportsService } from '../../../../services/deliveries-reports.service';
import { exportPDF, exportExcel } from '../../../../utils/report-export.utils';
import { CityList, DriverByCityList, FORMAT_OPTIONS, ReportFormat } from '../../../../models/report.types';

/**
 * ReportIncidenciasComponent
 *
 * Reporte #5: Incidencias por Delivery
 *
 * Genera reporte de incidencias por driver en un rango de fechas.
 * Requiere selección de ciudad y luego driver (dropdown dependiente con filtro).
 * Soporta exportación en PDF y Excel.
 *
 * Filtros:
 * - Fecha Inicio: Fecha inicial del rango (requerido)
 * - Fecha Fin: Fecha final del rango (requerido)
 * - Ciudad: Ciudad a consultar (requerido)
 * - Driver: Driver a consultar (requerido, depende de ciudad, con búsqueda)
 * - Formato: PDF o Excel (requerido)
 */
@Component({
  selector: 'app-report-incidencias',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    CardModule,
    SelectModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  templateUrl: './report-incidencias.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportIncidenciasComponent implements OnInit {
  private readonly service = inject(DeliveriesReportsService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal<boolean>(false);
  readonly isLoadingDrivers = signal<boolean>(false);
  readonly cityList = signal<CityList[]>([]);
  readonly driverList = signal<DriverByCityList[]>([]);
  readonly formatOptions = FORMAT_OPTIONS;

  // Computed para formatear drivers con código | nombre
  readonly formattedDriverList = computed(() => {
    return this.driverList().map(driver => ({
      ...driver,
      displayName: `${driver.codeDriver} | ${driver.fullNameDriver}`
    }));
  });

  readonly form = this.fb.group({
    dateInit: [new Date(), Validators.required],
    dateEnd: [new Date(), Validators.required],
    cityId: [null as number | null, Validators.required],
    driverId: [null as number | null, Validators.required],
    format: [ReportFormat.PDF, Validators.required]
  });

  ngOnInit(): void {
    this.loadCities();

    // Listener para cargar drivers cuando cambia la ciudad
    this.form.get('cityId')?.valueChanges.subscribe((cityId) => {
      // Limpiar driver seleccionado
      this.form.patchValue({ driverId: null }, { emitEvent: false });
      this.driverList.set([]);

      // Cargar drivers de la nueva ciudad
      if (cityId) {
        this.loadDriversByCity(cityId);
      }
    });
  }

  private loadCities(): void {
    this.service.getCityList().subscribe({
      next: (cities) => {
        this.cityList.set(cities);
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las ciudades'
        });
      }
    });
  }

  private loadDriversByCity(cityId: number): void {
    this.isLoadingDrivers.set(true);

    this.service.getDriverByCityList(cityId).subscribe({
      next: (drivers) => {
        this.driverList.set(drivers);
        this.isLoadingDrivers.set(false);
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los drivers'
        });
        this.isLoadingDrivers.set(false);
      }
    });
  }

  generateReport(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Complete todos los campos requeridos para generar el reporte'
      });
      return;
    }

    const { dateInit, dateEnd, driverId, format } = this.form.value;
    const startDate = this.formatDateDDMMYYYY(dateInit!);
    const endDate = this.formatDateDDMMYYYY(dateEnd!);

    this.isLoading.set(true);

    this.service.getReportIncidencias(startDate, endDate, driverId!, format!).subscribe({
      next: (base64) => {
        const selectedDriver = this.driverList().find(d => d.idDriver === driverId);
        const driverName = selectedDriver?.fullNameDriver || 'driver';
        const filename = `reporte-incidencias_${startDate}_${endDate}_${driverName.replace(/\s+/g, '-')}`;

        if (format === ReportFormat.PDF) {
          exportPDF(base64, filename);
        } else {
          exportExcel(base64, filename);
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Reporte generado',
          detail: `Se descargó ${filename}.${format === ReportFormat.PDF ? 'pdf' : 'xls'} correctamente`,
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

  private formatDateDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
