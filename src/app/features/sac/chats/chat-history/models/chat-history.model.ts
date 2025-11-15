/**
 * Chat History Models
 * Modelos para el historial de chats entre SAC y clientes/drivers
 */

/**
 * Mensaje individual dentro de un chat
 */
export interface ChatBox {
  message: string;
  dateMessage: string;
  sendBy: string;
}

/**
 * Respuesta del backend para historial de chats (GET)
 */
export interface ChatHistoryResponse {
  tipoChat: string;
  userChat: string;
  idCustomer: number;
  orderId: number | null;
  chat: ChatBox[];
  assignedAt?: string;  // ISO DateTime string
  createdAt?: string;   // ISO DateTime string
}

/**
 * Registro extendido de chat para uso en el componente
 * Incluye campos calculados adicionales
 */
export interface ChatHistoryRecord extends ChatHistoryResponse {
  id?: string;  // ID generado localmente para la tabla
  status?: 'completed' | 'pending' | 'in_progress';
  duration?: string;  // Calculado desde los mensajes
  rating?: number;
  customerPhone?: string;
  agentName?: string;  // Nombre del agente (userChat)
}

/**
 * Filtros disponibles para buscar en el historial
 */
export interface ChatHistoryFilters {
  customerPhone?: string;
  createdAtDate?: string;  // Fecha específica
  from?: string;  // Fecha inicio del rango
  to?: string;    // Fecha fin del rango
}

/**
 * Payload para guardar un chat en el historial (POST)
 */
export interface SaveChatHistory {
  tipoChat: 'SC' | 'SD';
  userChat: string;
  idCustomer: number;
  orderId: number | null;
  chat: ChatBox[];
  assignedAt?: string;
  createdAt?: string;
}

/**
 * Tipo de chat
 */
export type ChatType = 'SC' | 'SD';  // SC = SAC-Cliente, SD = SAC-Driver

/**
 * Estado del chat
 */
export type ChatStatus = 'completed' | 'pending' | 'in_progress';
