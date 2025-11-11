import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../../../environments/environment';
import { DeliveryTimeReportParams } from '../../shared/models';

/**
 * Servicio para generar reportes de tiempo de entrega
 *
 * Soporta formatos: PDF (1) y Excel (2)
 */
@Injectable({
  providedIn: 'root'
})
export class DeliveryTimeReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiURLReports}backoffice`;

  /**
   * Genera reporte de tiempo de entrega
   *
   * @param params Parámetros del reporte (fechas y formato)
   * @returns Observable con el archivo en base64
   */
  generateReport(params: DeliveryTimeReportParams): Observable<any> {
    // Convertir FileFormat a número: 1 = PDF, 2 = Excel
    const formatNumber = params.format === 'pdf' ? 1 : 2;

    const url = `${this.baseUrl}/reporteSacTiempoordenes/${params.fechaInicio}/${params.fechaFinal}/${formatNumber}`;

    return this.http.get(url, { responseType: 'text' });
  }
}
