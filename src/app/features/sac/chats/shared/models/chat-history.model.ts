/**
 * Modelos para el historial de chats
 *
 * Utilizado cuando se finaliza un chat para guardarlo en el backend
 */

/**
 * Payload para guardar un chat finalizado
 */
export interface SaveChatHistory {
  tipoChat: 'SC' | 'SD';        // SC = SAC-Cliente, SD = SAC-Driver
  userChat: string;             // Nombre del agente
  idCustomer: number;           // ID del cliente (0 para drivers sin ID numérico)
  orderId: number | null;       // ID de la orden (null si es chat de ayuda)
  chat: ChatBox[];              // Array de mensajes transformados
  assignedAt?: string;          // ISO DateTime cuando se asignó
  createdAt?: string;           // ISO DateTime cuando se creó
}

/**
 * Mensaje transformado para el historial
 */
export interface ChatBox {
  message: string;              // Contenido del mensaje
  dateMessage: string;          // ISO DateTime del mensaje
  sendBy: string;               // 'SAC', 'Cliente', 'Driver'
}
