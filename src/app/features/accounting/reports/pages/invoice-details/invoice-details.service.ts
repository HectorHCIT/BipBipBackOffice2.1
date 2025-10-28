import { Injectable } from '@angular/core';
import { Observable, tap, catchError } from 'rxjs';
import { ReportBaseService } from '../../shared/services/report-base.service';
import { ReportFormat } from '../../models/report-common.types';

/**
 * InvoiceDetailsService
 *
 * Servicio para el reporte de Detalles de Facturas.
 * Genera reportes en PDF o Excel según rango de fechas.
 *
 * Endpoint: reporteFAC/detalleFacturas/{dateFrom}/{dateTo}/{format}
 *
 * Patrón: Extiende ReportBaseService para reutilizar funcionalidad común
 */
@Injectable({ providedIn: 'root' })
export class InvoiceDetailsService extends ReportBaseService {
  /**
   * Genera reporte de detalles de facturas
   *
   * @param dateFrom - Fecha inicial del rango
   * @param dateTo - Fecha final del rango
   * @param format - Formato del reporte (0=PDF, 1=Excel)
   * @returns Observable<string> con base64 del archivo generado
   *
   * @example
   * service.generateReport(
   *   new Date('2024-01-01'),
   *   new Date('2024-01-31'),
   *   ReportFormat.PDF
   * ).subscribe(base64 => {
   *   // Descargar archivo
   * });
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

    // Construir URL del endpoint
    const url = `reporteFAC/detalleFacturas/${dateInit}/${dateEnd}/${format}`;

    return this.dataService.get$<string>(url).pipe(
      tap(() => {
        this.isLoading.set(false);
        console.log('Invoice Details report generated successfully');
      }),
      catchError((error) => {
        this.isLoading.set(false);
        console.error('Error generating Invoice Details report:', error);
        throw error;
      })
    );
  }
}
