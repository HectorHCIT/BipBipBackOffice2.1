import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { DataService } from '@core/services/data.service';
import { BenefitsReportParams } from '../../shared/models';

/**
 * Servicio para generar reportes de control de beneficios
 *
 * Maneja dos tipos de reportes:
 * - Reporte de Beneficios (BenefitReport)
 * - Reporte de Puntos Bips (BipsReport)
 */
@Injectable({
  providedIn: 'root'
})
export class BenefitsReportService {
  private readonly dataService = inject(DataService);

  /**
   * Genera reporte de beneficios
   */
  generateBenefitReport(params: BenefitsReportParams): Observable<any> {
    return this.dataService.get$('Reports/BenefitReport', {
      fechaInicio: params.fechaInicio,
      fechaFinal: params.fechaFinal
    });
  }

  /**
   * Genera reporte de puntos Bips
   */
  generateBipsReport(params: BenefitsReportParams): Observable<any> {
    return this.dataService.get$('Reports/BipsReport', {
      fechaInicio: params.fechaInicio,
      fechaFinal: params.fechaFinal
    });
  }
}
