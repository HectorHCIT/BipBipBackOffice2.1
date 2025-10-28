import { Injectable } from '@angular/core';
import { Observable, tap, catchError } from 'rxjs';
import { ReportBaseService } from '../../shared/services/report-base.service';

/**
 * CouponsRedeemedService
 *
 * Servicio para el reporte de Cupones Canjeados.
 * Genera reportes en Excel (.xlsx) según rango de fechas y ciudades seleccionadas.
 *
 * Endpoint: POST Reports/Coupons/Redeemed/Excel
 * Body: { dateFrom: 'YYYY-MM-DD', dateTo: 'YYYY-MM-DD', cityIds: [1, 2, 3] }
 *
 * Patrón: Extiende ReportBaseService para reutilizar funcionalidad común
 */
@Injectable({ providedIn: 'root' })
export class CouponsRedeemedService extends ReportBaseService {
  /**
   * Genera reporte de cupones canjeados
   *
   * @param dateFrom - Fecha inicial del rango
   * @param dateTo - Fecha final del rango
   * @param cityIds - Array de IDs de ciudades seleccionadas
   * @returns Observable<string> con base64 del archivo Excel generado
   *
   * @example
   * service.generateReport(
   *   new Date('2024-01-01'),
   *   new Date('2024-01-31'),
   *   [1, 2, 3]
   * ).subscribe(base64 => {
   *   // Descargar Excel
   * });
   */
  generateReport(
    dateFrom: Date,
    dateTo: Date,
    cityIds: number[]
  ): Observable<string> {
    this.isLoading.set(true);

    // Formatear fechas a ISO (YYYY-MM-DD)
    const body = {
      dateFrom: this.formatDateISO(dateFrom),
      dateTo: this.formatDateISO(dateTo),
      cityIds: cityIds
    };

    // Endpoint: POST Reports/Coupons/Redeemed/Excel
    return this.http.post<string>('Reports/Coupons/Redeemed/Excel', body).pipe(
      tap(() => {
        this.isLoading.set(false);
        console.log('Coupons Redeemed report generated successfully');
      }),
      catchError((error) => {
        this.isLoading.set(false);
        console.error('Error generating Coupons Redeemed report:', error);
        throw error;
      })
    );
  }
}
