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
import { CityList, FORMAT_OPTIONS, ReportFormat } from '../../../../models/report.types';

/**
 * ReportDiasEntregaComponent
 *
 * Reporte #4: Días de Entrega por Delivery
 *
 * Genera reporte de días de entrega por driver en un rango de fechas para una ciudad específica.
 * Soporta exportación en PDF y Excel.
 *
 * Filtros:
 * - Fecha Inicio: Fecha inicial del rango (requerido)
 * - Fecha Fin: Fecha final del rango (requerido)
 * - Ciudad: Ciudad a consultar (requerido)
 * - Formato: PDF o Excel (requerido)
 */
@Component({
  selector: 'app-report-dias-entrega',
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
  templateUrl: './report-dias-entrega.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportDiasEntregaComponent implements OnInit {
  private readonly service = inject(DeliveriesReportsService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal<boolean>(false);
  readonly cityList = signal<CityList[]>([]);
  readonly formatOptions = FORMAT_OPTIONS;

  readonly form = this.fb.group({
    dateInit: [new Date(), Validators.required],
    dateEnd: [new Date(), Validators.required],
    cityId: [null as number | null, Validators.required],
    format: [ReportFormat.PDF, Validators.required]
  });

  ngOnInit(): void {
    this.loadCities();
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

    const { dateInit, dateEnd, cityId, format } = this.form.value;
    const startDate = this.formatDateDDMMYYYY(dateInit!);
    const endDate = this.formatDateDDMMYYYY(dateEnd!);

    this.isLoading.set(true);

    this.service.getReportDriverParDelivery(startDate, endDate, cityId!, format!).subscribe({
      next: (base64) => {
        const selectedCity = this.cityList().find(c => c.cityId === cityId);
        const cityName = selectedCity?.cityName || 'ciudad';
        const filename = `reporte-dias-entrega_${startDate}_${endDate}_${cityName}`;

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
