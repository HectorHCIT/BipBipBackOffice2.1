import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { DataService } from '@core/services/data.service';
import { ChatDetailsReportParams, Agentes } from '../../shared/models';

/**
 * Servicio para generar reportes de detalle de chats
 */
@Injectable({
  providedIn: 'root'
})
export class ChatDetailsReportService {
  private readonly dataService = inject(DataService);

  /**
   * Genera reporte de detalle de chats
   *
   * @param params Parámetros del reporte (fechas y nombre de usuario)
   * @returns Observable con el PDF en base64
   */
  generateReport(params: ChatDetailsReportParams): Observable<any> {
    return this.dataService.get$('Reports/DetailsChats', {
      fechaInicio: params.fechaInicio,
      fechaFinal: params.fechaFinal,
      nameUser: params.nameUser
    });
  }

  /**
   * Obtiene la lista de agentes de chat
   *
   * @returns Observable con array de agentes
   */
  getAgents(): Observable<Agentes[]> {
    return this.dataService.get$<Agentes[]>('Users/summary/usuariosChat');
  }
}
