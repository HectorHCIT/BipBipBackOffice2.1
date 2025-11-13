import { Timestamp } from '@angular/fire/firestore';

/**
 * Firebase Chat Types
 *
 * Estos tipos representan la estructura EXACTA de los documentos en Firebase.
 * NO transformar estos tipos - trabajar directamente con ellos.
 */

/**
 * Documento principal de chat en la colección SAC
 * Path: SAC/{chatId}
 */
export interface FirebaseChatDocument {
  // Core identifiers
  uid: string;                    // Format: "help_424639" or "order_55454"
  customerId: number;             // Customer ID number
  userId: string;                 // SAC agent user ID
  userName: string;               // SAC agent name
  pushId: string;                 // Push notification ID

  // Timestamps
  createdAt: Timestamp | any;     // Chat creation timestamp
  dateTimeAssigned: Timestamp | any; // When assigned to agent

  // Status flags
  finished: boolean;              // If chat is finished
  userAssigned: boolean;          // If assigned to agent
  wasOpen: boolean;              // If chat was opened

  // Optional location
  location?: {
    cityId: number;
    countryId: number;
  };

  // Optional order info
  order?: {
    cityCode: string;
    storeId: string;
    storeShortName: string;
    pushId?: string;
  };

  // Optional image
  imageUrl?: string;
}

/**
 * Mensaje de chat en la subcolección
 * Path: SAC/{chatId}/{subcollectionId}/{messageId}
 * subcollectionId se extrae del chatId (ej: "help_424639" → "424639")
 */
export interface FirebaseChatMessage {
  // Core fields (ALWAYS present)
  CustomerId: number;             // Customer ID (mayúscula en Firebase)
  Message: string;                // Message text (mayúscula en Firebase)
  customer: boolean;              // true = customer, false = SAC agent
  imageUrl: string | null;        // Image URL or null
  read: boolean;                  // Read status

  // Timestamps - Firebase tiene ambos formatos
  Datetime: Timestamp | any;      // Timestamp original (mayúscula)
  dateTime: Timestamp | any;      // Timestamp duplicado (minúscula)

  // SAC agent field (ONLY in agent messages)
  userName?: string;              // SAC agent name

  // Firestore metadata (added by query)
  id?: string;                    // Document ID
  chatId?: string;                // Parent chat ID
}

/**
 * Configuración de chats SAC
 * Path: SACChatConfigurations/{configId}
 */
export interface SacConfiguration {
  automaticAssignment: boolean;           // Enable auto-assignment
  automaticAssingQuantity: number;        // Max chats per auto-assignment
  automaticMessage: string;               // Auto-reply message
  assignChatToSsacRole: boolean;         // Assign to SSAC role
  maximumAmountChatsPerAgent: number;    // Max chats per agent
}

/**
 * Usuario SAC (agente)
 * Path: SACUsers/{userId}
 */
export interface UserData {
  uid: string;                           // User ID
  username: string;                      // Username
  name: string;                          // Display name
  email: string;                         // Email
  role: string;                          // Role name
  roleId: string;                        // Role ID
  currentStatus: string;                 // "online" | "offline" | "break"
  mood: string;                          // Agent mood status
  activeChatRooms: number;              // Number of active chats
  createdAt: Timestamp;                 // Account creation
  updateStatusDate: Timestamp;          // Last status update
  lastDatetimeAssignedChat: Timestamp;  // Last chat assignment
}

/**
 * Bitácora de cambios de estado
 * Path: SACChatStatusLog/{logId}
 */
export interface Bitacora {
  uid: string;                    // Log entry ID
  sacUserId: string;             // User ID
  username: string;              // User name
  status: 'break' | 'online' | 'offline';
  createdAt: Timestamp;          // When status changed
  updateStatusBy: string;        // Who updated (usually same as userId)
}

/**
 * Constantes para nombres de colecciones
 */
export const FIREBASE_COLLECTIONS = {
  SAC: 'SAC',
  SAC_DRIVER: 'SACDriver',
  CHAT: 'Chat',
  SAC_USERS: 'SACUsers',
  SAC_CHAT_CONFIGURATIONS: 'SACChatConfigurations',
  SAC_CHAT_STATUS_LOG: 'SACChatStatusLog'
} as const;

/**
 * Helper para extraer el ID de subcolección del chatId
 * Ejemplo: "help_424639" → "424639"
 *          "order_55454" → "55454"
 */
export function getSubcollectionId(chatId: string): string {
  return chatId.split('_')[1];
}

/**
 * Helper para determinar el tipo de chat desde el UID
 * @returns 'help' | 'order'
 */
export function getChatType(uid: string): 'help' | 'order' {
  return uid.startsWith('help_') ? 'help' : 'order';
}

/**
 * Helper para extraer el número del UID
 * Ejemplo: "help_424639" → 424639
 *          "order_55454" → 55454
 */
export function extractNumberFromUid(uid: string): number {
  return parseInt(uid.split('_')[1]);
}
