import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ReportBaseService } from '../../shared/services/report-base.service';
import { ReportFormat } from '../../models/report-common.types';
import { environment } from '../../../../../../environments/environment';

/**
 * InvoiceDetailsService
 *
 * Servicio para el reporte de Detalles de Facturas.
 * Genera reportes en PDF o Excel según rango de fechas.
 *
 * Endpoint: {apiURLReports}reporteFAC/detalleFacturas/{dateFrom}/{dateTo}/{format}
 *
 * IMPORTANTE: Usa apiURLReports, no apiURL
 */
@Injectable({ providedIn: 'root' })
export class InvoiceDetailsService extends ReportBaseService {
  private readonly httpClient = inject(HttpClient);

  /**
   * Genera reporte de detalles de facturas
   *
   * @param dateFrom - Fecha inicial del rango
   * @param dateTo - Fecha final del rango
   * @param format - Formato del reporte (1=PDF, 2=Excel)
   * @returns Observable<string> con base64 del archivo generado
   */
  generateReport(
    dateFrom: Date,
    dateTo: Date,
    format: ReportFormat
  ): Observable<string> {
    this.isLoading.set(true);

    // Formatear fechas a D-M-Y (sin padding): 5-1-2024
    const dateInit = this.formatDateDMY(dateFrom);
    const dateEnd = this.formatDateDMY(dateTo);

    // Construir URL completa con apiURLReports
    const url = `${environment.apiURLReports}reporteFAC/detalleFacturas/${dateInit}/${dateEnd}/${format}`;

    return this.httpClient.get(url, { responseType: 'text' }).pipe(
      tap(() => {
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        console.error('Error generating Invoice Details report:', error);
        return throwError(() => error);
      })
    );
  }
}
