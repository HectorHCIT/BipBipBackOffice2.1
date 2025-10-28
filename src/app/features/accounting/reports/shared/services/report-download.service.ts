import { Injectable } from '@angular/core';
import { ReportFormat } from '../../models/report-common.types';
import { downloadPDF, downloadExcel, downloadExcelXLSX } from '../utils/report-export.utils';

/**
 * ReportDownloadService
 *
 * Servicio centralizado para manejo de descargas de reportes.
 * Convierte base64 a archivos y dispara la descarga.
 *
 * Patrón: Servicio sin dependencias para evitar problemas de inyección.
 * Los componentes manejan sus propios mensajes de éxito/error.
 */
@Injectable({ providedIn: 'root' })
export class ReportDownloadService {

  /**
   * Descarga un reporte según el formato especificado
   *
   * @param base64 - String base64 retornado por el API
   * @param format - Formato del archivo (PDF, Excel, ExcelXLSX)
   * @param filename - Nombre del archivo sin extensión
   *
   * @example
   * this.downloadService.download(
   *   response,
   *   ReportFormat.PDF,
   *   'reporte-ventas-2024'
   * );
   */
  download(base64: string, format: ReportFormat, filename: string): void {
    switch (format) {
      case ReportFormat.PDF:
        downloadPDF(base64, filename);
        break;

      case ReportFormat.Excel:
        downloadExcel(base64, filename);
        break;

      case ReportFormat.ExcelXLSX:
        downloadExcelXLSX(base64, filename);
        break;

      default:
        throw new Error(`Formato de reporte no soportado: ${format}`);
    }
  }

  /**
   * Descarga múltiples reportes en secuencia
   * Útil cuando se generan varios archivos a la vez
   *
   * @param reports - Array de reportes a descargar
   * @returns Objeto con conteo de éxitos y errores
   */
  downloadMultiple(
    reports: Array<{ base64: string; format: ReportFormat; filename: string }>
  ): { successCount: number; errorCount: number } {
    let successCount = 0;
    let errorCount = 0;

    reports.forEach((report) => {
      try {
        this.download(report.base64, report.format, report.filename);
        successCount++;
      } catch (error) {
        console.error('Error downloading report:', error);
        errorCount++;
      }
    });

    return { successCount, errorCount };
  }
}
