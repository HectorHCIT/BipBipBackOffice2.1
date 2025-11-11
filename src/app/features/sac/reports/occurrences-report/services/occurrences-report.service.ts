import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { DataService } from '@core/services/data.service';
import { OccurrencesReportParams } from '../../shared/models';

/**
 * Servicio para generar reportes de ocurrencias/incidencias
 */
@Injectable({
  providedIn: 'root'
})
export class OccurrencesReportService {
  private readonly dataService = inject(DataService);

  /**
   * Genera reporte de ocurrencias
   *
   * @param params Parámetros del reporte (fechas, marcas y ciudades)
   * @returns Observable con el archivo Excel en base64
   */
  generateReport(params: OccurrencesReportParams): Observable<any> {
    const queryParams: any = {
      fechaInicio: params.fechaInicio,
      fechaFinal: params.fechaFinal
    };

    // Agregar marcas si están presentes
    if (params.marcas && params.marcas.length > 0) {
      queryParams.marcas = params.marcas;
    }

    // Agregar ciudades si están presentes
    if (params.ciudades && params.ciudades.length > 0) {
      queryParams.ciudades = params.ciudades;
    }

    return this.dataService.get$('Reports/Ocurrences', queryParams);
  }

  /**
   * Obtiene la lista de ciudades disponibles
   *
   * @returns Observable con array de ciudades
   */
  getCities(): Observable<any[]> {
    return this.dataService.get$<any[]>('Location/CityList');
  }

  /**
   * Obtiene la lista de marcas disponibles
   *
   * @returns Observable con array de marcas
   */
  getBrands(): Observable<any[]> {
    return this.dataService.get$<any[]>('Brand/BrandList');
  }
}
