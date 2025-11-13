import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '@core/services/data.service';
import { AutomaticReply, AutomaticReplyPayload } from '../models/automatic-reply.model';

/**
 * Servicio para gestionar respuestas automáticas/predefinidas
 *
 * Endpoints de AutomaticReply API:
 * - GET    AutomaticReply/AutomaticReply
 * - POST   AutomaticReply/CreateAutomaticReply
 * - PUT    AutomaticReply/UpdateAutomaticReply?id={id}
 * - DELETE AutomaticReply/DeleteAutomaticReply?id={id}
 */
@Injectable({
  providedIn: 'root'
})
export class AutomaticReplyService {
  private readonly dataService = inject(DataService);

  /**
   * Obtiene todas las respuestas automáticas
   */
  getAutomaticReplies(): Observable<AutomaticReply[]> {
    return this.dataService.get$<AutomaticReply[]>('AutomaticReply/AutomaticReply');
  }

  /**
   * Crea una nueva respuesta automática
   */
  createAutomaticReply(payload: AutomaticReplyPayload): Observable<AutomaticReply> {
    return this.dataService.post$<AutomaticReply>('AutomaticReply/CreateAutomaticReply', payload);
  }

  /**
   * Actualiza una respuesta automática existente
   */
  updateAutomaticReply(id: number, payload: AutomaticReplyPayload): Observable<AutomaticReply> {
    return this.dataService.put$<AutomaticReply>(
      `AutomaticReply/UpdateAutomaticReply?id=${id}`,
      payload
    );
  }

  /**
   * Elimina una respuesta automática
   */
  deleteAutomaticReply(id: number): Observable<void> {
    return this.dataService.delete$<void>(`AutomaticReply/DeleteAutomaticReply?id=${id}`);
  }
}
