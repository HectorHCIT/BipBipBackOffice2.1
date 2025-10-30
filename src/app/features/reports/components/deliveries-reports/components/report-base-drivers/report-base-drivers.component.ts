import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { DeliveriesReportsService } from '../../../../services/deliveries-reports.service';
import { exportPDF, exportExcel } from '../../../../utils/report-export.utils';
import { CityList, BaseList, FORMAT_OPTIONS, ReportFormat } from '../../../../models/report.types';

/**
 * ReportBaseDriversComponent
 *
 * Reporte #10: Base de Drivers
 *
 * Genera reporte de drivers por base de operación.
 * Requiere selección de ciudad y luego base (dropdown dependiente).
 * Soporta exportación en PDF y Excel (con APIs diferentes).
 *
 * Filtros:
 * - Ciudad: Ciudad a consultar (requerido)
 * - Base de Operaciones: Base/Headquarter a consultar (requerido, depende de ciudad)
 * - Formato: PDF o Excel (requerido)
 *
 * Nota: El endpoint API es diferente para PDF vs Excel.
 */
@Component({
  selector: 'app-report-base-drivers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    SelectModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  templateUrl: './report-base-drivers.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportBaseDriversComponent implements OnInit {
  private readonly service = inject(DeliveriesReportsService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal<boolean>(false);
  readonly isLoadingBases = signal<boolean>(false);
  readonly cityList = signal<CityList[]>([]);
  readonly baseList = signal<BaseList[]>([]);
  readonly formatOptions = FORMAT_OPTIONS;

  readonly form = this.fb.group({
    cityId: [null as number | null, Validators.required],
    baseId: [null as number | null, Validators.required],
    format: [ReportFormat.PDF, Validators.required]
  });

  ngOnInit(): void {
    this.loadCities();

    // Listener para cargar bases cuando cambia la ciudad
    this.form.get('cityId')?.valueChanges.subscribe((cityId) => {
      // Limpiar base seleccionada
      this.form.patchValue({ baseId: null }, { emitEvent: false });
      this.baseList.set([]);

      // Cargar bases de la nueva ciudad
      if (cityId) {
        this.loadBasesByCity(cityId);
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

  private loadBasesByCity(cityId: number): void {
    this.isLoadingBases.set(true);

    this.service.getBaseSumary(cityId).subscribe({
      next: (bases) => {
        this.baseList.set(bases);
        this.isLoadingBases.set(false);
      },
      error: (error) => {
        console.error('Error loading bases:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las bases de operación'
        });
        this.isLoadingBases.set(false);
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

    const { baseId, format } = this.form.value;
    const selectedBase = this.baseList().find(b => b.codHeadquarter === baseId);

    if (!selectedBase) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontró la base seleccionada'
      });
      return;
    }

    const baseName = selectedBase.headquarterName;
    this.isLoading.set(true);

    this.service.getReportBaseDrivers(baseId!, baseName, format!).subscribe({
      next: (base64) => {
        const filename = `reporte-base-drivers_${baseName.replace(/\s+/g, '-')}`;

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
}
