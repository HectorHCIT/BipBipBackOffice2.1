import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { ReportBaseService } from '../../shared/services/report-base.service';
import { environment } from '../../../../../../environments/environment';

/**
 * CouponsRedeemedService
 *
 * Servicio para el reporte de Cupones Canjeados.
 * Genera reportes en Excel (.xlsx) según rango de fechas y ciudades seleccionadas.
 *
 * Endpoint: GET {apiURL}Reports/Coupons/Redeemed/Excel
 * Query Params: fechaInicio, fechaFinal, ciudades (multiple)
 *
 * Patrón: Extiende ReportBaseService para reutilizar funcionalidad común
 */
@Injectable({ providedIn: 'root' })
export class CouponsRedeemedService extends ReportBaseService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = environment.apiURL + 'Reports/Coupons/Redeemed/';

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
    const fechaInicio = this.formatDateISO(dateFrom);
    const fechaFinal = this.formatDateISO(dateTo);

    // Build query params with multiple ciudades
    let httpParams = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFinal', fechaFinal);

    // Append each city ID as separate parameter (ciudades=1&ciudades=2&ciudades=3)
    cityIds.forEach(cityId => {
      httpParams = httpParams.append('ciudades', cityId.toString());
    });

    // Endpoint: GET Reports/Coupons/Redeemed/Excel
    return this.httpClient.get(this.apiUrl + 'Excel', {
      params: httpParams,
      responseType: 'text'
    }).pipe(
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
