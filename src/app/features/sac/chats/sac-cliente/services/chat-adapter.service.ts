import { Injectable, inject } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import {
  FirebaseChatDocument,
  FirebaseChatMessage,
  getChatType,
  extractNumberFromUid,
  MESSAGE_SENDER_TYPES,
  BACKEND_CHAT_TYPES
} from '../models';
import { LocationService } from '../../shared/services';

/**
 * Interfaz para datos de tarjeta de chat (componente chat-card)
 */
export interface ChatCardData {
  id: string;                     // Chat UID
  customerId: number;            // ID del cliente
  customerName: string;          // Nombre del cliente (o "Cliente {id}")
  agentName: string;             // Nombre del agente
  chatType: 'help' | 'order';    // Tipo de chat
  orderNumber?: number;          // Número de orden (si aplica)
  createdAt: Date;               // Fecha de creación
  assignedAt?: Date;             // Fecha de asignación
  unreadCount: number;           // Contador de mensajes no leídos
  isSelected: boolean;           // Si está seleccionado
  isUnassigned: boolean;         // Si no está asignado
  location?: {
    displayText: string;         // Formato: "HN/SPS" o "HN/SPS - D2"
    countryCode: string;         // "HN"
    cityCode: string;            // "SPS"
    storeShortName?: string;     // "D2" (solo en chats de orden)
  };
  imageUrl?: string;
}

/**
 * Interfaz para mensajes agrupados por fecha
 */
export interface ChatMessageBlock {
  date: string;                  // "Hoy", "Ayer", "12 Nov 2025"
  messages: ChatMessageDisplay[];
}

/**
 * Interfaz para mensaje en display
 */
export interface ChatMessageDisplay {
  id: string;
  message: string;
  imageUrl: string | null;
  isFromCustomer: boolean;
  senderName: string;
  timestamp: Date;
  isRead: boolean;
}

/**
 * Interfaz para guardar chat en backend
 */
export interface SaveChatHistory {
  tipoChat: 'SC' | 'SD';
  userChat: string;
  idCustomer: number;
  orderId: number | null;
  assignedAt?: string;
  createdAt?: string;
  chat: ChatBox[];
}

export interface ChatBox {
  message: string;
  dateMessage: string;
  sendBy: string;  // "Cliente" | "SAC"
}

/**
 * Servicio para adaptar datos de Firebase a formatos de UI
 *
 * PRINCIPIO: Transformar SOLO lo necesario para componentes visuales.
 * Mantener referencias a objetos Firebase originales cuando sea posible.
 */
@Injectable({
  providedIn: 'root'
})
export class ChatAdapterService {
  private readonly locationService = inject(LocationService);

  /**
   * Convierte FirebaseChatDocument a ChatCardData para el componente chat-card
   */
  toCardData(
    chat: FirebaseChatDocument,
    unreadCount: number = 0,
    isSelected: boolean = false
  ): ChatCardData {
    const createdAt = this.timestampToDate(chat.createdAt);
    const assignedAt = chat.dateTimeAssigned
      ? this.timestampToDate(chat.dateTimeAssigned)
      : undefined;

    return {
      id: chat.uid,
      customerId: chat.customerId,
      customerName: `Cliente ${chat.customerId}`,  // Por defecto mostrar ID
      agentName: chat.userName || 'Sin asignar',
      chatType: getChatType(chat.uid),
      orderNumber: getChatType(chat.uid) === 'order'
        ? extractNumberFromUid(chat.uid)
        : undefined,
      createdAt: createdAt,
      assignedAt: assignedAt,
      unreadCount: unreadCount,
      isSelected: isSelected,
      isUnassigned: !chat.userAssigned,
      location: this.formatLocation(chat.location, chat.order),
      imageUrl: chat.imageUrl
    };
  }

  /**
   * Formatea la ubicación usando LocationService
   * Incluye storeShortName si es un chat de orden
   * @private
   */
  private formatLocation(
    location?: { cityId: number; countryId: number },
    order?: { storeId: string; storeShortName: string; cityCode: string }
  ): ChatCardData['location'] {
    if (!location) return undefined;

    const formatted = this.locationService.getFormattedLocation(
      location.cityId,
      location.countryId
    );

    if (!formatted) return undefined;

    // Si hay orden, agregar storeShortName al displayText
    const displayText = order?.storeShortName
      ? `${formatted.displayText} - ${order.storeShortName}`
      : formatted.displayText;

    return {
      displayText,
      countryCode: formatted.countryCode,
      cityCode: formatted.cityCode,
      storeShortName: order?.storeShortName
    };
  }

  /**
   * Agrupa mensajes por fecha para el componente chat-body
   */
  toMessageBlocks(messages: FirebaseChatMessage[]): ChatMessageBlock[] {
    const grouped = new Map<string, ChatMessageDisplay[]>();

    // Convertir cada mensaje
    messages.forEach(msg => {
      const display = this.toMessageDisplay(msg);
      const dateKey = this.formatDateLabel(display.timestamp);

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }

      grouped.get(dateKey)!.push(display);
    });

    // Convertir Map a array de bloques
    return Array.from(grouped.entries()).map(([date, messages]) => ({
      date,
      messages
    }));
  }

  /**
   * Convierte FirebaseChatMessage a formato de display
   */
  private toMessageDisplay(message: FirebaseChatMessage): ChatMessageDisplay {
    // Usar el timestamp con prioridad a Datetime (mayúscula), luego dateTime (minúscula)
    const timestamp = message.Datetime || message.dateTime;

    return {
      id: message.id || '',
      message: message.Message,  // Usar Message con mayúscula
      imageUrl: message.imageUrl,
      isFromCustomer: message.customer,
      senderName: message.customer
        ? `Cliente ${message.CustomerId}`  // Usar CustomerId con mayúscula
        : (message.userName || 'SAC'),
      timestamp: this.timestampToDate(timestamp),
      isRead: message.read
    };
  }

  /**
   * Prepara datos para guardar chat en backend
   */
  toSaveFormat(
    chat: FirebaseChatDocument,
    messages: FirebaseChatMessage[]
  ): SaveChatHistory {
    const chatBoxes: ChatBox[] = messages.map(msg => {
      // Usar el timestamp correcto (Datetime o dateTime)
      const timestamp = msg.Datetime || msg.dateTime;

      return {
        message: msg.imageUrl
          ? `${msg.imageUrl}, ${msg.Message}`
          : msg.Message,  // Usar Message con mayúscula
        dateMessage: this.toISOString(timestamp),
        sendBy: msg.customer ? MESSAGE_SENDER_TYPES.CUSTOMER : MESSAGE_SENDER_TYPES.SAC
      };
    });

    return {
      tipoChat: BACKEND_CHAT_TYPES.SAC_CLIENTE,
      userChat: chat.userName,
      idCustomer: chat.customerId,
      orderId: getChatType(chat.uid) === 'order'
        ? extractNumberFromUid(chat.uid)
        : null,
      assignedAt: chat.dateTimeAssigned
        ? this.toISOString(chat.dateTimeAssigned)
        : undefined,
      createdAt: this.toISOString(chat.createdAt),
      chat: chatBoxes
    };
  }

  /**
   * Convierte Timestamp de Firebase a Date
   */
  private timestampToDate(timestamp: Timestamp | any): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }

    // Si tiene seconds (formato Firestore)
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000);
    }

    // Si ya es Date o string
    return new Date(timestamp);
  }

  /**
   * Convierte Timestamp a string ISO para backend
   */
  private toISOString(timestamp: Timestamp | any): string {
    const date = this.timestampToDate(timestamp);
    return date.toISOString();
  }

  /**
   * Formatea fecha como "Hoy", "Ayer" o fecha completa
   */
  private formatDateLabel(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Resetear horas para comparación
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Hoy';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Ayer';
    } else {
      // Formato: "12 Nov 2025"
      return date.toLocaleDateString('es-HN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  /**
   * Calcula el tiempo transcurrido desde una fecha
   * Retorna formato legible: "hace 5 min", "hace 2 horas", etc.
   */
  calculateElapsedTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
      return 'hace un momento';
    } else if (diffMinutes < 60) {
      return `hace ${diffMinutes} min`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
  }

  /**
   * Cuenta mensajes no leídos del cliente en un array de mensajes
   */
  countUnreadMessages(messages: FirebaseChatMessage[]): number {
    return messages.filter(msg => msg.customer && !msg.read).length;
  }
}
