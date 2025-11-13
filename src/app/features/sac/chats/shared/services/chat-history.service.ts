import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '@core/services/data.service';
import { SaveChatHistory } from '../models/chat-history.model';

/**
 * Servicio para gestionar el historial de chats
 *
 * Endpoint: Chat/SaveChatEnded
 */
@Injectable({
  providedIn: 'root'
})
export class ChatHistoryService {
  private readonly dataService = inject(DataService);

  /**
   * Guarda un chat finalizado en el historial
   */
  saveChatEnded(chatHistory: SaveChatHistory): Observable<void> {
    return this.dataService.post$<void>('Chat/SaveChatEnded', chatHistory);
  }
}
