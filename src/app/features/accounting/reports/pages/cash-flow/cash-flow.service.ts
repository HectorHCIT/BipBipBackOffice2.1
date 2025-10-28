import { Injectable } from '@angular/core';
import { Observable, tap, catchError } from 'rxjs';
import { ReportBaseService } from '../../shared/services/report-base.service';

/**
 * CashFlowService
 *
 * Servicio para el reporte de Flujo de Efectivo por tienda.
 * Genera reportes en PDF según fecha, marca y tienda.
 *
 * Endpoint: backoffice/reporteefectivo/{dateFormatted}/{dateFormatted}/{storeShortName}/{storeId}
 *
 * Patrón: Extiende ReportBaseService para reutilizar funcionalidad común
 */
@Injectable({ providedIn: 'root' })
export class CashFlowService extends ReportBaseService {
  /**
   * Genera reporte de flujo de efectivo para una tienda específica
   *
   * @param date - Fecha del reporte
   * @param storeShortName - Nombre corto de la tienda (para URL)
   * @param storeId - ID de la tienda
   * @returns Observable<string> con base64 del archivo PDF generado
   *
   * @example
   * service.generateReport(
   *   new Date('2024-01-15'),
   *   'SPS-01',
   *   123
   * ).subscribe(base64 => {
   *   // Descargar PDF
   * });
   */
  generateReport(
    date: Date,
    storeShortName: string,
    storeId: number
  ): Observable<string> {
    this.isLoading.set(true);

    // Formatear fecha a DD-MM-YYYY (con padding): 15-01-2024
    const dateFormatted = this.formatDateDDMMYYYY(date);

    // Construir URL del endpoint
    // Nota: La fecha se repite dos veces en el old project (inicio y fin iguales)
    const url = `backoffice/reporteefectivo/${dateFormatted}/${dateFormatted}/${storeShortName}/${storeId}`;

    return this.dataService.get$<string>(url).pipe(
      tap(() => {
        this.isLoading.set(false);
        console.log('Cash Flow report generated successfully');
      }),
      catchError((error) => {
        this.isLoading.set(false);
        console.error('Error generating Cash Flow report:', error);
        throw error;
      })
    );
  }
}
