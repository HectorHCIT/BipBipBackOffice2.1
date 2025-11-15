import { Injectable, inject } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import {
  FirebaseDriverChatDocument,
  FirebaseDriverChatMessage,
  getDriverChatType,
  extractDriverIdFromUid,
  MESSAGE_SENDER_TYPES,
  BACKEND_CHAT_TYPE
} from '../models';
import { LocationService } from '../../shared/services';
import { SaveChatHistory, ChatBox } from '../../shared/models';
import {
  ChatCardData,
  ChatMessageBlock,
  ChatMessageDisplay
} from '../../sac-cliente/services/chat-adapter.service';

/**
 * Servicio para adaptar datos de Firebase a formatos de UI
 *
 * PRINCIPIO: Transformar SOLO lo necesario para componentes visuales.
 * Mantener referencias a objetos Firebase originales cuando sea posible.
 */
@Injectable({
  providedIn: 'root'
})
export class DriverChatAdapterService {
  private readonly locationService = inject(LocationService);

  /**
   * Convierte FirebaseDriverChatDocument a ChatCardData para el componente chat-card
   * Mapea campos de driver a campos de customer para compatibilidad con UI compartida
   */
  toCardData(
    chat: FirebaseDriverChatDocument,
    unreadCount: number = 0,
    isSelected: boolean = false,
    driverName?: string
  ): ChatCardData {
    const createdAt = this.timestampToDate(chat.createdAt);
    const assignedAt = chat.dateTimeAssigned
      ? this.timestampToDate(chat.dateTimeAssigned)
      : undefined;

    return {
      id: chat.uid,
      customerId: chat.driverId,  // Mapear driverId a customerId
      customerName: chat.driverName || driverName || `Driver ${chat.driverId}`,  // Usar driverName de Firebase
      agentName: chat.userName || 'Sin asignar',
      chatType: getDriverChatType(chat.uid),
      orderNumber: getDriverChatType(chat.uid) === 'order'
        ? chat.driverId  // Driver ID ya es string, no necesita conversión
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
   * @param messages Array de mensajes de Firebase
   * @param driverName Nombre del driver (opcional, para mostrar en mensajes)
   */
  toMessageBlocks(messages: FirebaseDriverChatMessage[], driverName?: string): ChatMessageBlock[] {
    const grouped = new Map<string, ChatMessageDisplay[]>();

    // Convertir cada mensaje
    messages.forEach(msg => {
      const display = this.toMessageDisplay(msg, driverName);
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
   * Convierte FirebaseDriverChatMessage a formato de display
   * Mapea campo driver a isFromCustomer para compatibilidad con UI compartida
   */
  private toMessageDisplay(message: FirebaseDriverChatMessage, driverName?: string): ChatMessageDisplay {
    // NOTA: SAC-Driver usa MINÚSCULAS (dateTime, message, driverId)
    // Prioridad a minúsculas, fallback a mayúsculas por compatibilidad con mensajes antiguos
    const timestamp = message.dateTime || message.Datetime;
    const driverId = message.driverId || message.DriverId || '';
    const messageText = message.message || message.Message || '';

    return {
      id: message.id || '',
      message: messageText,
      imageUrl: message.imageUrl,
      isFromCustomer: message.driver,  // Mapear driver a isFromCustomer
      senderName: message.driver
        ? (driverName || `Driver ${driverId}`)  // Usar driverName si está disponible
        : (message.userName || 'SAC'),
      timestamp: this.timestampToDate(timestamp),
      isRead: message.read
    };
  }

  /**
   * Prepara datos para guardar chat en backend
   */
  toSaveFormat(
    chat: FirebaseDriverChatDocument,
    messages: FirebaseDriverChatMessage[]
  ): SaveChatHistory {
    const chatBoxes: ChatBox[] = messages.map(msg => {
      // NOTA: SAC-Driver usa MINÚSCULAS (dateTime, message)
      // Prioridad a minúsculas, fallback a mayúsculas por compatibilidad
      const timestamp = msg.dateTime || msg.Datetime;
      const messageText = msg.message || msg.Message || '';

      return {
        message: msg.imageUrl
          ? `${msg.imageUrl}, ${messageText}`
          : messageText,
        dateMessage: this.toISOString(timestamp),
        sendBy: msg.driver ? MESSAGE_SENDER_TYPES.DRIVER : MESSAGE_SENDER_TYPES.SAC
      };
    });

    return {
      tipoChat: BACKEND_CHAT_TYPE,  // 'SD' para SAC-Driver
      userChat: chat.userName,
      // NOTA: Para drivers, no hay un ID numérico de cliente
      // Usamos 0 como placeholder (el backend puede identificar por tipoChat='SD')
      idCustomer: 0,
      // orderId siempre null para chats de ayuda (tipo 'help')
      // TODO: Si necesitamos guardar el driverId, considerar agregarlo como campo custom
      orderId: null,
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
   * Cuenta mensajes no leídos del driver en un array de mensajes
   */
  countUnreadMessages(messages: FirebaseDriverChatMessage[]): number {
    return messages.filter(msg => msg.driver && !msg.read).length;
  }
}
