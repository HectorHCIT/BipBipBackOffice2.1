import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ReportBaseService } from '../../shared/services/report-base.service';
import { environment } from '../../../../../../environments/environment';

/**
 * CashFlowService
 *
 * Servicio para el reporte de Flujo de Efectivo por tienda.
 * Genera reportes en PDF según fecha, marca y tienda.
 *
 * Endpoint: {apiURLReports}backoffice/reporteefectivo/{dateFormatted}/{dateFormatted}/{storeShortName}/{storeId}
 *
 * IMPORTANTE: Usa apiURLReports, no apiURL
 */
@Injectable({ providedIn: 'root' })
export class CashFlowService extends ReportBaseService {
  private readonly httpClient = inject(HttpClient);

  /**
   * Genera reporte de flujo de efectivo para una tienda específica
   * Formato: DD-MM-YYYY (con padding)
   */
  generateReport(
    date: Date,
    storeShortName: string,
    storeId: number
  ): Observable<string> {
    this.isLoading.set(true);

    // Formatear fecha a DD-MM-YYYY (con padding): 15-01-2024
    const dateFormatted = this.formatDateDDMMYYYY(date);

    // Construir URL completa con apiURLReports
    // Nota: La fecha se repite dos veces (inicio y fin iguales)
    const url = `${environment.apiURLReports}backoffice/reporteefectivo/${dateFormatted}/${dateFormatted}/${storeShortName}/${storeId}`;

    return this.httpClient.get(url, { responseType: 'text' }).pipe(
      tap(() => {
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.isLoading.set(false);
        console.error('Error generating Cash Flow report:', error);
        return throwError(() => error);
      })
    );
  }
}
