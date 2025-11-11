import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

/**
 * Servicio para generar reportes de chat SAC
 *
 * Usa el servicio de reportes con URLs dinámicas:
 * - reporteria/reporteChatXFecha/{inicio}/{final}/{tipo}
 * - reporteria/reporteChatXUsuario/{inicio}/{final}/{tipo}
 *
 * Donde tipo: 1 = PDF, 2 = Excel
 */
@Injectable({
  providedIn: 'root'
})
export class ChatReportService {
  private readonly http = inject(HttpClient);

  /**
   * Genera reporte de chat usando la URL completa
   *
   * @param url URL completa del endpoint a consumir
   * @returns Observable con el archivo en base64
   */
  generateReport(url: string): Observable<any> {
    return this.http.get(url, { responseType: 'text' });
  }
}
