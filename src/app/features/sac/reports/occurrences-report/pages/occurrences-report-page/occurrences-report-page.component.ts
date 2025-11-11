import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { MenuItem, MessageService } from 'primeng/api';

// Services & Models
import { OccurrencesReportService } from '../../services';
import { OccurrencesReportParams } from '../../../shared/models';
import {
  downloadExcelFromBase64,
  formatDateISO
} from '../../../shared/utils';

/**
 * Interface para ciudades
 */
interface City {
  id: number;
  name: string;
}

/**
 * Interface para marcas
 */
interface Brand {
  id: number;
  name: string;
}

@Component({
  selector: 'app-occurrences-report-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    BreadcrumbModule,
    CardModule,
    ToastModule,
    MultiSelectModule
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './occurrences-report-page.component.html',
  styleUrl: './occurrences-report-page.component.scss'
})
export class OccurrencesReportPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(OccurrencesReportService);
  private readonly messageService = inject(MessageService);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'SAC', routerLink: '/sac' },
    { label: 'Reportes', routerLink: '/sac/reportes' },
    { label: 'Reporte de Ocurrencias' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Signals
  readonly isLoading = signal(false);
  readonly maxDate = new Date();
  readonly cities = signal<City[]>([]);
  readonly brands = signal<Brand[]>([]);

  // Form
  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadCities();
    this.loadBrands();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.form = this.fb.group({
      dateRange: [[thirtyDaysAgo, today], [Validators.required]],
      cities: [[]],  // Array de IDs de ciudades seleccionadas
      brands: [[]]   // Array de IDs de marcas seleccionadas
    });
  }

  /**
   * Carga la lista de ciudades
   */
  private loadCities(): void {
    this.reportService.getCities().subscribe({
      next: (cities) => {
        // Mapear la respuesta del backend a nuestro formato
        const mappedCities = cities.map((city: any) => ({
          id: city.idCity || city.id,
          name: city.nameCity || city.name
        }));
        this.cities.set(mappedCities);
      },
      error: (error) => {
        console.error('Error al cargar ciudades:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la lista de ciudades'
        });
      }
    });
  }

  /**
   * Carga la lista de marcas
   */
  private loadBrands(): void {
    this.reportService.getBrands().subscribe({
      next: (brands) => {
        // Mapear la respuesta del backend a nuestro formato
        const mappedBrands = brands.map((brand: any) => ({
          id: brand.idBrand || brand.id,
          name: brand.nameBrand || brand.name
        }));
        this.brands.set(mappedBrands);
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la lista de marcas'
        });
      }
    });
  }

  /**
   * Genera y descarga el reporte
   */
  generateReport(): void {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor selecciona un rango de fechas válido'
      });
      return;
    }

    const dateRange: Date[] = this.form.value.dateRange;
    if (!dateRange || dateRange.length !== 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debes seleccionar fecha de inicio y fin'
      });
      return;
    }

    const [startDate, endDate] = dateRange;
    const selectedCities = this.form.value.cities || [];
    const selectedBrands = this.form.value.brands || [];

    const params: OccurrencesReportParams = {
      fechaInicio: formatDateISO(startDate),
      fechaFinal: formatDateISO(endDate),
      ...(selectedCities.length > 0 && { ciudades: selectedCities }),
      ...(selectedBrands.length > 0 && { marcas: selectedBrands })
    };

    this.isLoading.set(true);

    this.reportService.generateReport(params).subscribe({
      next: (response) => {
        try {
          const base64 = response.data || response;

          if (!base64) {
            throw new Error('No se recibió el archivo del servidor');
          }

          const filename = `Reporte Ocurrencias (${formatDateISO(startDate)} - ${formatDateISO(endDate)})`;
          downloadExcelFromBase64(base64, filename);

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Reporte descargado correctamente'
          });
        } catch (error) {
          console.error('Error al procesar el reporte:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo procesar el archivo descargado'
          });
        } finally {
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Error al generar el reporte:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo generar el reporte'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Limpia el formulario
   */
  clearForm(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.form.patchValue({
      dateRange: [thirtyDaysAgo, today],
      cities: [],
      brands: []
    });
  }
}
