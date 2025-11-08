import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

// PrimeNG
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuItem, MessageService } from 'primeng/api';

// Services
import { OccurrenceService } from '../../services';
import { GlobalDataService } from '@core/services/global-data.service';

@Component({
  selector: 'app-occurrences-report-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    BreadcrumbModule,
    ButtonModule,
    DatePickerModule,
    MultiSelectModule,
    ToastModule,
    SkeletonModule
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './occurrences-report-page.component.html',
  styleUrl: './occurrences-report-page.component.scss'
})
export class OccurrencesReportPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly occurrenceService = inject(OccurrenceService);
  readonly globalDataService = inject(GlobalDataService);
  private readonly messageService = inject(MessageService);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'SAC', routerLink: '/sac' },
    { label: 'Ocurrencias', routerLink: '/sac/ocurrences' },
    { label: 'Reportes' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Form
  form!: FormGroup;

  // Local signals
  readonly isGenerating = signal(false);
  readonly allBrandsSelected = signal(false);
  readonly allCitiesSelected = signal(false);

  // Computed signals
  readonly brands = computed(() => this.globalDataService.brands());
  readonly cities = computed(() => this.globalDataService.citiesShort());
  readonly isLoadingData = computed(() =>
    this.globalDataService.isLoadingBrands() || this.globalDataService.isLoadingCitiesShort()
  );

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  /**
   * Inicializa el formulario reactivo
   */
  private initForm(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.form = this.fb.group({
      dateRange: [[firstDayOfMonth, today], Validators.required],
      selectedBrands: [[], Validators.required],
      selectedCities: [[], Validators.required]
    });
  }

  /**
   * Carga las marcas y ciudades
   */
  private loadData(): void {
    // Solo cargar si no están ya cargadas
    if (this.brands().length === 0) {
      this.globalDataService.forceRefresh('brands');
    }
    if (this.cities().length === 0) {
      this.globalDataService.forceRefresh('citiesShort');
    }
  }

  /**
   * Selecciona o deselecciona todas las marcas
   */
  toggleAllBrands(): void {
    const allSelected = !this.allBrandsSelected();
    this.allBrandsSelected.set(allSelected);

    if (allSelected) {
      const allBrandIds = this.brands().map(b => b.id);
      this.form.patchValue({ selectedBrands: allBrandIds });
    } else {
      this.form.patchValue({ selectedBrands: [] });
    }
  }

  /**
   * Selecciona o deselecciona todas las ciudades
   */
  toggleAllCities(): void {
    const allSelected = !this.allCitiesSelected();
    this.allCitiesSelected.set(allSelected);

    if (allSelected) {
      const allCityIds = this.cities().map(c => c.id);
      this.form.patchValue({ selectedCities: allCityIds });
    } else {
      this.form.patchValue({ selectedCities: [] });
    }
  }

  /**
   * Genera y descarga el reporte de ocurrencias
   */
  generateReport(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor completa todos los filtros requeridos'
      });
      return;
    }

    const formValue = this.form.value;
    const dateRange: Date[] = formValue.dateRange;

    if (!dateRange || dateRange.length !== 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Rango de fechas inválido',
        detail: 'Por favor selecciona un rango de fechas válido'
      });
      return;
    }

    // Formatear fechas a ISO string (YYYY-MM-DD)
    const startDate = this.formatDateToISO(dateRange[0]);
    const endDate = this.formatDateToISO(dateRange[1]);

    // Convertir arrays a strings separados por coma
    const marcas = formValue.selectedBrands.join(',');
    const ciudades = formValue.selectedCities.join(',');

    this.isGenerating.set(true);

    this.occurrenceService.generateReport(startDate, endDate, marcas, ciudades).subscribe({
      next: (response: any) => {
        this.isGenerating.set(false);

        // El backend devuelve un objeto con base64
        // Formato esperado: { fileContents: "base64string", contentType: "...", fileDownloadName: "..." }
        if (response && response.fileContents) {
          this.downloadExcelFile(response.fileContents, response.fileDownloadName || 'reporte_ocurrencias.xlsx');
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Reporte generado correctamente'
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'El formato de respuesta del servidor es inválido'
          });
        }
      },
      error: (error) => {
        console.error('Error al generar reporte:', error);
        this.isGenerating.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo generar el reporte'
        });
      }
    });
  }

  /**
   * Formatea una fecha a string ISO (YYYY-MM-DD)
   */
  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Descarga un archivo Excel desde base64
   */
  private downloadExcelFile(base64: string, filename: string): void {
    try {
      // Decodificar base64 a binary
      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Crear blob
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Crear link temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo descargar el archivo'
      });
    }
  }

  /**
   * Limpia el formulario
   */
  clearFilters(): void {
    this.form.reset();
    this.allBrandsSelected.set(false);
    this.allCitiesSelected.set(false);

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.form.patchValue({ dateRange: [firstDayOfMonth, today] });
  }
}
