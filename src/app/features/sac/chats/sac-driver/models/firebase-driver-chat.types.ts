import { Timestamp } from '@angular/fire/firestore';

/**
 * Firebase Driver Chat Types
 *
 * Estos tipos representan la estructura EXACTA de los documentos en Firebase
 * para la colección SACDriver (chats entre SAC y conductores).
 */

/**
 * Documento principal de chat en la colección SACDriver
 * Path: SACDriver/{chatId}
 */
export interface FirebaseDriverChatDocument {
  // Core identifiers
  uid: string;                    // Format: "help_BIP-00373" or "order_BIP-00454"
  driverId: string;               // Driver ID string (ej: "BIP-00373")
  driverName?: string;            // Driver name (viene en Firebase)
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
 * Path: SACDriver/{chatId}/{subcollectionId}/{messageId}
 * subcollectionId se extrae del chatId (ej: "help_123456" → "123456")
 */
export interface FirebaseDriverChatMessage {
  // Core fields (ALWAYS present)
  driverId?: string;              // Driver ID (minúscula en Firebase real)
  DriverId?: string;              // Driver ID (mayúscula, por compatibilidad)
  message?: string;               // Message text (minúscula en Firebase real)
  Message?: string;               // Message text (mayúscula, por compatibilidad)
  driver: boolean;                // true = driver, false = SAC agent
  imageUrl: string | null;        // Image URL or null
  read: boolean;                  // Read status

  // Timestamps - Firebase tiene ambos formatos
  Datetime?: Timestamp | any;     // Timestamp original (mayúscula)
  dateTime?: Timestamp | any;     // Timestamp (minúscula, el que realmente existe)

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
 * Constantes para nombres de colecciones
 */
export const FIREBASE_DRIVER_COLLECTIONS = {
  SAC_DRIVER: 'SACDriver',
  SAC_USERS: 'SACUsers',
  SAC_CHAT_CONFIGURATIONS: 'SACChatConfigurations',
  SAC_CHAT_STATUS_LOG: 'SACChatStatusLog'
} as const;

/**
 * Helper para extraer el ID de subcolección del chatId
 * Ejemplo: "help_BIP-00373" → "BIP-00373"
 *          "order_BIP-00454" → "BIP-00454"
 */
export function getDriverSubcollectionId(chatId: string): string {
  return chatId.split('_')[1];
}

/**
 * Helper para determinar el tipo de chat desde el UID
 * @returns 'help' | 'order'
 */
export function getDriverChatType(uid: string): 'help' | 'order' {
  return uid.startsWith('help_') ? 'help' : 'order';
}

/**
 * Helper para extraer el driver ID del UID
 * Ejemplo: "help_BIP-00373" → "BIP-00373"
 *          "order_BIP-00454" → "BIP-00454"
 */
export function extractDriverIdFromUid(uid: string): string {
  return uid.split('_')[1];
}
