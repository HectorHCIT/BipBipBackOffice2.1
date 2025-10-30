import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
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
import { CityList, RESTByCityList, FORMAT_OPTIONS, ReportFormat } from '../../../../models/report.types';

/**
 * ReportTiempoOrdenesComponent
 *
 * Reporte #6: Tiempo por Órdenes (Tiempos de Entrega)
 *
 * Genera reporte de tiempos de entrega por restaurante en un rango de fechas.
 * Requiere selección de ciudad y luego restaurante (dropdown dependiente).
 * Soporta exportación en PDF y Excel.
 *
 * Filtros:
 * - Fecha Inicio: Fecha inicial del rango (requerido)
 * - Fecha Fin: Fecha final del rango (requerido)
 * - Ciudad: Ciudad a consultar (requerido)
 * - Restaurante: Restaurante/Unidad a consultar (requerido, depende de ciudad)
 * - Formato: PDF o Excel (requerido)
 */
@Component({
  selector: 'app-report-tiempo-ordenes',
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
  templateUrl: './report-tiempo-ordenes.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportTiempoOrdenesComponent implements OnInit {
  private readonly service = inject(DeliveriesReportsService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal<boolean>(false);
  readonly isLoadingRestaurants = signal<boolean>(false);
  readonly cityList = signal<CityList[]>([]);
  readonly restaurantList = signal<RESTByCityList[]>([]);
  readonly formatOptions = FORMAT_OPTIONS;

  readonly form = this.fb.group({
    dateInit: [new Date(), Validators.required],
    dateEnd: [new Date(), Validators.required],
    cityId: [null as number | null, Validators.required],
    restaurantId: [null as number | null, Validators.required],
    format: [ReportFormat.PDF, Validators.required]
  });

  ngOnInit(): void {
    this.loadCities();

    // Listener para cargar restaurantes cuando cambia la ciudad
    this.form.get('cityId')?.valueChanges.subscribe((cityId) => {
      // Limpiar restaurante seleccionado
      this.form.patchValue({ restaurantId: null }, { emitEvent: false });
      this.restaurantList.set([]);

      // Cargar restaurantes de la nueva ciudad
      if (cityId) {
        this.loadRestaurantsByCity(cityId);
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

  private loadRestaurantsByCity(cityId: number): void {
    this.isLoadingRestaurants.set(true);

    this.service.getUnlinkedRestaurants(cityId).subscribe({
      next: (restaurants) => {
        this.restaurantList.set(restaurants);
        this.isLoadingRestaurants.set(false);
      },
      error: (error) => {
        console.error('Error loading restaurants:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los restaurantes'
        });
        this.isLoadingRestaurants.set(false);
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

    const { dateInit, dateEnd, restaurantId, format } = this.form.value;
    const startDate = this.formatDateDDMMYYYY(dateInit!);
    const endDate = this.formatDateDDMMYYYY(dateEnd!);

    this.isLoading.set(true);

    this.service.getReportParTimes(startDate, endDate, restaurantId!, format!).subscribe({
      next: (base64) => {
        const selectedRestaurant = this.restaurantList().find(r => r.restId === restaurantId);
        const restName = selectedRestaurant?.restShortName || 'restaurante';
        const filename = `reporte-tiempo-ordenes_${startDate}_${endDate}_${restName}`;

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
