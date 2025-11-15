import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';
import {
  ChatHistoryResponse,
  ChatHistoryRecord,
  ChatHistoryFilters,
  SaveChatHistory,
  ChatBox
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ChatHistoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiURL}Chat/GetChatEnded`;

  /**
   * Obtiene el historial de chats desde el backend
   * Endpoint: Chat/GetChatEnded
   * Filtros disponibles: customerPhone, createdAtDate, from, to
   */
  getChatHistory(filters?: ChatHistoryFilters): Observable<ChatHistoryRecord[]> {
    const params = this.buildHttpParams(filters);

    return this.http.get<ChatHistoryResponse[]>(this.apiUrl, { params }).pipe(
      map(response => this.transformResponse(response)),
      catchError(error => {
        console.error('[ChatHistory] Error obteniendo historial:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Transforma la respuesta del backend agregando campos calculados
   */
  private transformResponse(response: ChatHistoryResponse[]): ChatHistoryRecord[] {
    return response.map((chat, index) => ({
      ...chat,
      id: `CHAT-${String(index + 1).padStart(5, '0')}`,
      status: 'completed' as const,
      duration: this.calculateDuration(chat),
      agentName: chat.userChat,
    }));
  }

  /**
   * Calcula la duración del chat basado en los mensajes
   */
  private calculateDuration(chat: ChatHistoryResponse): string {
    if (!chat.chat || chat.chat.length < 2) return 'N/A';

    const firstMessage = chat.chat[0];
    const lastMessage = chat.chat[chat.chat.length - 1];

    try {
      const start = new Date(firstMessage.dateMessage);
      const end = new Date(lastMessage.dateMessage);

      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return '< 1 min';
      if (diffMins < 60) return `${diffMins} min`;

      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Construye los parámetros HTTP desde los filtros
   */
  private buildHttpParams(filters?: ChatHistoryFilters): HttpParams {
    let params = new HttpParams();

    if (!filters) return params;

    if (filters.customerPhone) {
      params = params.set('customerPhone', filters.customerPhone);
    }

    if (filters.createdAtDate) {
      params = params.set('createdAtDate', filters.createdAtDate);
    }

    if (filters.from) {
      params = params.set('from', filters.from);
    }

    if (filters.to) {
      params = params.set('to', filters.to);
    }

    return params;
  }

  /**
   * Busca chats por teléfono del cliente
   */
  searchByPhone(customerPhone: string): Observable<ChatHistoryRecord[]> {
    return this.getChatHistory({ customerPhone });
  }

  /**
   * Busca chats por rango de fechas
   */
  searchByDateRange(from: Date, to: Date): Observable<ChatHistoryRecord[]> {
    return this.getChatHistory({
      from: from.toISOString(),
      to: to.toISOString()
    });
  }

  /**
   * Guarda un chat en el historial (POST)
   */
  saveChatToHistory(chatData: SaveChatHistory): Observable<any> {
    const payload: SaveChatHistory = {
      tipoChat: chatData.tipoChat,
      userChat: chatData.userChat,
      idCustomer: chatData.idCustomer,
      orderId: chatData.orderId || null,
      chat: chatData.chat,
      assignedAt: chatData.assignedAt || new Date().toISOString(),
      createdAt: chatData.createdAt || new Date().toISOString()
    };

    return this.http.post(`${environment.apiURL}Chat/SaveChatHistory`, payload).pipe(
      catchError(error => {
        console.error('[ChatHistory] Error guardando chat:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Exporta el historial de chats a CSV
   */
  exportChatHistory(data: ChatHistoryRecord[]): Observable<Blob> {
    const csvContent = this.generateCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return of(blob);
  }

  /**
   * Genera contenido CSV desde los datos
   */
  private generateCSV(data: ChatHistoryRecord[]): string {
    const headers = ['Tipo', 'Agente', 'Cliente ID', 'Orden ID', 'Total Mensajes', 'Duración', 'Fecha Creación'];
    const rows = data.map(chat => [
      chat.tipoChat,
      chat.userChat || 'N/A',
      chat.idCustomer,
      chat.orderId || 'N/A',
      chat.chat?.length || 0,
      chat.duration || 'N/A',
      chat.createdAt || 'N/A'
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  /**
   * Obtiene estadísticas del historial de chats
   */
  getChatStatistics(): Observable<any> {
    return of({
      totalChats: 0,
      completedChats: 0,
      pendingChats: 0,
      inProgressChats: 0,
      averageResponseTime: 'N/A',
      averageResolutionTime: 'N/A',
      customerSatisfaction: 0
    });
  }
}
