import { Timestamp } from '@angular/fire/firestore';

/**
 * Configuraciones del sistema de chats SAC
 */
export interface ChatsConfigs {
  automaticAssignment: boolean;
  maximumAmountChatsPerAgent: number;
  automaticMessage: string;
  assignChatToSsacRole: boolean;
  inactiveThresholdHours: number;
}

/**
 * Información de un agente SAC
 */
export interface OnlineUser {
  id: string;
  updateStatusDate: FirestoreTimestamp;
  email: string;
  uid: string;
  createdAt: FirestoreTimestamp;
  mood: string;
  username: string;
  role: string;
  roleId: string;
  activeChatRooms: number;
  lastDatetimeAssignedChat: FirestoreTimestamp;
  name: string;
  currentStatus: AgentStatus;
}

/**
 * Timestamp de Firestore
 */
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

/**
 * Estados posibles de un agente
 */
export type AgentStatus = 'online' | 'offline' | 'break';

/**
 * Log de cambios de estado de agentes
 */
export interface Bitacora {
  createdAt: Timestamp;
  sacUserId: string;
  status: AgentStatus;
  uid: string;
  updateStatusBy: string;
  username: string;
}

/**
 * Filtros de estado para agentes
 */
export interface StatusFilter {
  id: string;
  name: string;
  qty: number;
}

/**
 * Estadísticas de agentes
 */
export interface AgentStats {
  totalAgents: number;
  onlineAgents: number;
  topAgent: OnlineUser | null;
}
