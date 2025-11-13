import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';
import {
  FirebaseChatDocument,
  FirebaseChatMessage,
  SacConfiguration,
  getChatType
} from '../models/firebase-chat.types';
import { FirebaseChatService } from './firebase-chat.service';

/**
 * Estado global de los chats usando Signals
 * Implementa las mejores prácticas de Angular 20+
 */
@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private readonly firebaseChatService = inject(FirebaseChatService);

  // ========== SIGNALS DE ESTADO ==========

  // Chats del usuario actual
  private readonly userChatsSignal = signal<FirebaseChatDocument[]>([]);
  readonly userChats = this.userChatsSignal.asReadonly();

  // Chats no asignados (pendientes)
  private readonly unassignedChatsSignal = signal<FirebaseChatDocument[]>([]);
  readonly unassignedChats = this.unassignedChatsSignal.asReadonly();

  // Mensajes de todos los chats
  private readonly messagesSignal = signal<Map<string, FirebaseChatMessage[]>>(new Map());
  readonly messages = this.messagesSignal.asReadonly();

  // Chat actualmente seleccionado
  private readonly selectedChatIdSignal = signal<string | null>(null);
  readonly selectedChatId = this.selectedChatIdSignal.asReadonly();

  // Configuración del SAC
  private readonly sacConfigSignal = signal<SacConfiguration | null>(null);
  readonly sacConfig = this.sacConfigSignal.asReadonly();

  // Estados de carga
  private readonly loadingChatsSignal = signal(false);
  readonly loadingChats = this.loadingChatsSignal.asReadonly();

  private readonly loadingMessagesSignal = signal(false);
  readonly loadingMessages = this.loadingMessagesSignal.asReadonly();

  // Estados de error
  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  // ========== COMPUTED SIGNALS ==========

  /**
   * Chat actualmente seleccionado
   */
  readonly selectedChat = computed(() => {
    const chatId = this.selectedChatIdSignal();
    if (!chatId) return null;

    // Buscar en chats del usuario
    const userChat = this.userChatsSignal().find(c => c.uid === chatId);
    if (userChat) return userChat;

    // Buscar en chats no asignados
    return this.unassignedChatsSignal().find(c => c.uid === chatId) || null;
  });

  /**
   * Mensajes del chat seleccionado
   */
  readonly selectedChatMessages = computed(() => {
    const chatId = this.selectedChatIdSignal();
    if (!chatId) return [];

    return this.messagesSignal().get(chatId) || [];
  });

  /**
   * Mensajes agrupados por fecha del chat seleccionado
   */
  readonly selectedChatMessagesByDate = computed(() => {
    const messages = this.selectedChatMessages();
    return this.groupMessagesByDate(messages);
  });

  /**
   * Número total de chats del usuario
   */
  readonly userChatsCount = computed(() => this.userChatsSignal().length);

  /**
   * Número de chats pendientes
   */
  readonly unassignedChatsCount = computed(() => this.unassignedChatsSignal().length);

  /**
   * Indica si la asignación automática está deshabilitada
   */
  readonly isManualAssignment = computed(() => {
    const config = this.sacConfigSignal();
    return config ? !config.automaticAssignment : false;
  });

  /**
   * Todos los chats combinados (usuario + no asignados)
   */
  readonly allChats = computed(() => [
    ...this.userChatsSignal(),
    ...this.unassignedChatsSignal()
  ]);

  // ========== MÉTODOS PÚBLICOS ==========

  /**
   * Inicializa el servicio con el usuario actual
   */
  initialize(userId: string): void {
    // Cargar configuración del SAC
    this.loadSacConfig();

    // Cargar chats del usuario
    this.loadUserChats(userId);

    // Cargar chats no asignados si la configuración lo permite
    // (se cargará automáticamente cuando tengamos la config)
  }

  /**
   * Carga la configuración del SAC
   */
  private loadSacConfig(): void {
    this.firebaseChatService.getSacConfiguration()
      .pipe(
        tap(() => this.errorSignal.set(null)),
        catchError(error => {
          console.error('Error loading SAC config:', error);
          this.errorSignal.set('Error al cargar la configuración');
          return of(null);
        })
      )
      .subscribe(config => {
        if (config) {
          this.sacConfigSignal.set(config);

          // Cargar chats no asignados si la asignación manual está habilitada
          if (!config.automaticAssignment) {
            this.loadUnassignedChats();
          }
        }
      });
  }

  /**
   * Carga los chats del usuario
   */
  loadUserChats(userId: string): void {
    this.loadingChatsSignal.set(true);
    this.errorSignal.set(null);

    this.firebaseChatService
      .getUserChats(userId)
      .pipe(
        tap(() => this.loadingChatsSignal.set(false)),
        catchError(error => {
          console.error('Error loading user chats:', error);
          this.loadingChatsSignal.set(false);
          this.errorSignal.set('Error al cargar los chats');
          return of([]);
        })
      )
      .subscribe((chats: FirebaseChatDocument[]) => {
        this.userChatsSignal.set(chats);

        // Cargar mensajes para cada chat
        chats.forEach(chat => {
          this.loadMessagesForChat(chat.uid);
        });
      });
  }

  /**
   * Carga los chats no asignados
   */
  loadUnassignedChats(): void {
    this.firebaseChatService
      .getUnassignedChats()
      .pipe(
        catchError(error => {
          console.error('Error loading unassigned chats:', error);
          return of([]);
        })
      )
      .subscribe((chats: FirebaseChatDocument[]) => {
        this.unassignedChatsSignal.set(chats);

        // Cargar mensajes para cada chat no asignado
        chats.forEach(chat => {
          this.loadMessagesForChat(chat.uid);
        });
      });
  }

  /**
   * Carga los mensajes de un chat específico
   */
  loadMessagesForChat(chatId: string): void {
    this.loadingMessagesSignal.set(true);

    this.firebaseChatService
      .getChatMessages(chatId)
      .pipe(
        tap(() => this.loadingMessagesSignal.set(false)),
        catchError(error => {
          console.error(`Error loading messages for chat ${chatId}:`, error);
          this.loadingMessagesSignal.set(false);
          return of([]);
        })
      )
      .subscribe((messages: FirebaseChatMessage[]) => {
        const currentMessages = this.messagesSignal();
        const newMessages = new Map(currentMessages);
        newMessages.set(chatId, messages);
        this.messagesSignal.set(newMessages);
      });
  }

  /**
   * Selecciona un chat
   */
  selectChat(chatId: string | null): void {
    this.selectedChatIdSignal.set(chatId);

    // Si se selecciona un chat, marcar sus mensajes como leídos
    if (chatId) {
      this.markChatAsRead(chatId);
    }
  }

  /**
   * Asigna un chat no asignado al usuario actual
   */
  async assignChatToUser(
    userId: string,
    userName: string,
    chatId: string
  ): Promise<void> {
    try {
      // Asignar en Firebase
      await this.firebaseChatService.assignChat(chatId, userId, userName);

      // Mover el chat de no asignados a chats del usuario
      const unassignedChat = this.unassignedChatsSignal().find(c => c.uid === chatId);
      if (unassignedChat) {
        // Actualizar el chat
        const updatedChat: FirebaseChatDocument = {
          ...unassignedChat,
          userAssigned: true,
          userId: userId,
          userName: userName,
          dateTimeAssigned: Timestamp.now()
        };

        // Actualizar signals
        this.unassignedChatsSignal.update(chats =>
          chats.filter(c => c.uid !== chatId)
        );
        this.userChatsSignal.update(chats => [...chats, updatedChat]);

        // Cargar mensajes del chat
        this.loadMessagesForChat(chatId);
      }
    } catch (error) {
      console.error('Error assigning chat:', error);
      this.errorSignal.set('Error al asignar el chat');
      throw error;
    }
  }

  /**
   * Envía un mensaje como agente SAC
   */
  async sendMessage(
    chatId: string,
    message: string,
    imageUrl?: string
  ): Promise<void> {
    const chat = this.selectedChat();
    if (!chat) {
      throw new Error('No hay chat seleccionado');
    }

    try {
      // Enviar mensaje a Firebase
      await this.firebaseChatService.sendMessage(
        chatId,
        chat.customerId,
        message,
        false, // customer = false (es mensaje del agente SAC)
        chat.userName,
        imageUrl
      );

      // Los mensajes se actualizarán automáticamente por la suscripción en tiempo real
      // Opcionalmente podemos agregar actualización optimista aquí
    } catch (error) {
      console.error('Error sending message:', error);
      this.errorSignal.set('Error al enviar el mensaje');
      throw error;
    }
  }

  /**
   * Marca un chat como finalizado
   */
  async finishChat(chatId: string): Promise<void> {
    try {
      await this.firebaseChatService.finishChat(chatId);

      // Actualizar el estado local
      this.userChatsSignal.update(chats =>
        chats.map(chat =>
          chat.uid === chatId
            ? { ...chat, finished: true }
            : chat
        )
      );
    } catch (error) {
      console.error('Error finishing chat:', error);
      this.errorSignal.set('Error al finalizar el chat');
      throw error;
    }
  }

  /**
   * Limpia el chat seleccionado
   */
  clearSelectedChat(): void {
    this.selectedChatIdSignal.set(null);
  }

  /**
   * Marca todos los mensajes de un chat como leídos
   */
  async markChatAsRead(chatId: string): Promise<void> {
    try {
      // Obtener mensajes no leídos del cliente
      const chatMessages = this.messagesSignal().get(chatId) || [];
      const unreadClientMessages = chatMessages.filter(msg =>
        msg.customer && !msg.read
      );

      if (unreadClientMessages.length === 0) {
        return; // No hay mensajes no leídos del cliente
      }

      // Marcar como leídos en Firebase
      await this.firebaseChatService.markMessagesAsRead(
        chatId,
        unreadClientMessages.map(msg => msg.id || '')
      );

      // Actualizar estado local
      this.messagesSignal.update(messages => {
        const newMessages = new Map(messages);
        const updatedMessages = chatMessages.map(msg =>
          msg.customer && !msg.read ? { ...msg, read: true } : msg
        );
        newMessages.set(chatId, updatedMessages);
        return newMessages;
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      this.errorSignal.set('Error al marcar mensajes como leídos');
    }
  }

  /**
   * Obtiene la cantidad de mensajes no leídos del cliente en un chat
   */
  getUnreadClientMessagesCount(chatId: string): number {
    const chatMessages = this.messagesSignal().get(chatId) || [];
    return chatMessages.filter(msg => msg.customer && !msg.read).length;
  }

  /**
   * Computed signal para mensajes no leídos del chat seleccionado
   */
  readonly selectedChatUnreadCount = computed(() => {
    const chatId = this.selectedChatIdSignal();
    if (!chatId) return 0;
    return this.getUnreadClientMessagesCount(chatId);
  });

  /**
   * Computed signal para el total de mensajes no leídos de todos los chats
   */
  readonly totalUnreadMessagesCount = computed(() => {
    const messages = this.messagesSignal();
    let total = 0;

    messages.forEach((chatMessages) => {
      total += chatMessages.filter(msg => msg.customer && !msg.read).length;
    });

    return total;
  });

  /**
   * Recarga todos los datos
   */
  refresh(userId: string): void {
    this.loadUserChats(userId);
    const config = this.sacConfigSignal();
    if (config && !config.automaticAssignment) {
      this.loadUnassignedChats();
    }
  }

  // ========== MÉTODOS PRIVADOS AUXILIARES ==========

  /**
   * Agrupa mensajes por fecha
   */
  private groupMessagesByDate(messages: FirebaseChatMessage[]): Map<string, FirebaseChatMessage[]> {
    const grouped = new Map<string, FirebaseChatMessage[]>();

    messages.forEach(message => {
      const timestamp = message.Datetime || message.dateTime;
      const date = this.getMessageDateLabel(timestamp);
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)?.push(message);
    });

    return grouped;
  }

  /**
   * Obtiene la etiqueta de fecha para un mensaje
   */
  private getMessageDateLabel(timestamp: any): string {
    const messageDate = this.timestampToDate(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.isSameDay(messageDate, today)) {
      return 'Hoy';
    } else if (this.isSameDay(messageDate, yesterday)) {
      return 'Ayer';
    } else {
      return messageDate.toLocaleDateString('es-HN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  /**
   * Convierte Timestamp a Date
   */
  private timestampToDate(timestamp: any): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  }

  /**
   * Verifica si dos fechas son el mismo día
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}
