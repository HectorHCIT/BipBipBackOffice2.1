import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * ReportBaseService
 *
 * Servicio base abstracto para todos los reportes.
 * Proporciona funcionalidad común:
 * - Estado de carga (signals)
 * - Acceso a HttpClient
 * - Métodos de formateo de fechas
 *
 * Patrón: Servicios concretos extienden este servicio e implementan su lógica específica
 *
 * @example
 * @Injectable({ providedIn: 'root' })
 * export class DeliveriesReportsService extends ReportBaseService {
 *   getReportDeliveryInactive(...params): Observable<string> {
 *     this.isLoading.set(true);
 *     return this.http.get(...).pipe(
 *       tap(() => this.isLoading.set(false))
 *     );
 *   }
 * }
 */
@Injectable()
export abstract class ReportBaseService {
  protected readonly http = inject(HttpClient);

  // Estado reactivo compartido
  readonly isLoading = signal<boolean>(false);

  /**
   * Formatea fecha a DD-MM-YYYY con padding
   * Formato: 05-01-2024 (día, mes, año)
   *
   * @param date - Fecha a formatear
   * @returns String en formato DD-MM-YYYY
   *
   * @example
   * formatDateDDMMYYYY(new Date('2024-01-05')) // '05-01-2024'
   */
  protected formatDateDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Formatea fecha a YYYY-MM-DD (ISO format)
   * Útil para APIs que requieren formato ISO
   *
   * @param date - Fecha a formatear
   * @returns String en formato YYYY-MM-DD
   *
   * @example
   * formatDateISO(new Date('2024-01-05')) // '2024-01-05'
   */
  protected formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatea fecha a D-M-Y sin padding
   * Formato: 5-1-2024 (día, mes, año)
   *
   * @param date - Fecha a formatear
   * @returns String en formato D-M-Y
   *
   * @example
   * formatDateDMY(new Date('2024-01-05')) // '5-1-2024'
   */
  protected formatDateDMY(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Valida que una fecha esté dentro de un rango permitido
   *
   * @param date - Fecha a validar
   * @param maxDaysInPast - Máximo número de días en el pasado permitidos
   * @param maxDaysInFuture - Máximo número de días en el futuro permitidos
   * @returns true si la fecha es válida
   */
  protected isDateInRange(
    date: Date,
    maxDaysInPast: number = 365,
    maxDaysInFuture: number = 0
  ): boolean {
    const now = new Date();
    const pastLimit = new Date();
    pastLimit.setDate(now.getDate() - maxDaysInPast);

    const futureLimit = new Date();
    futureLimit.setDate(now.getDate() + maxDaysInFuture);

    return date >= pastLimit && date <= futureLimit;
  }

  /**
   * Calcula diferencia en días entre dos fechas
   *
   * @param dateFrom - Fecha inicial
   * @param dateTo - Fecha final
   * @returns Número de días de diferencia
   */
  protected getDaysDifference(dateFrom: Date, dateTo: Date): number {
    const timeDiff = dateTo.getTime() - dateFrom.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}
