import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '@core/services/data.service';
import { AssignmentsReportParams } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AssignmentsReportService {
  private readonly dataService = inject(DataService);

  /**
   * Genera el reporte de asignaciones y re-asignaciones
   *
   * @param params - Parámetros del reporte (fechas)
   * @returns Observable con la respuesta del servidor (base64 o data)
   */
  generateReport(params: AssignmentsReportParams): Observable<any> {
    return this.dataService.get$('Reports/Assignments', {
      fechaInicio: params.fechaInicio,
      fechaFinal: params.fechaFinal
    });
  }
}
