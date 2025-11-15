import { Timestamp } from '@angular/fire/firestore';

/**
 * Modelo para los logs de cambio de estado de agentes SAC
 * Colección Firebase: SACChatStatusLog
 */
export interface SACChatStatusLog {
  id?: string;
  createdAt: Timestamp;
  sacUserId: string;
  status: AgentStatus;
  uid: string;
  updateStatusBy: string;
  username: string;
}

/**
 * Modelo para la información de agentes SAC
 * Colección Firebase: SACUsers
 */
export interface SACUser {
  uid: string;
  username: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  currentStatus: AgentStatus;
  activeChatRooms: number;
  createdAt: Timestamp;
  lastDatetimeAssignedChat: Timestamp;
  updateStatusDate: Timestamp;
  mood?: string;
}

/**
 * Estados posibles de un agente
 */
export type AgentStatus = 'online' | 'offline' | 'break';

/**
 * Modelo para mostrar en la tabla de eventos
 * Combina información de SACChatStatusLog y SACUser
 */
export interface AgentStatusEvent {
  id: string;
  agentName: string;
  agentUsername: string;
  status: AgentStatus;
  changedAt: Date;
  changedBy: string;
  sacUserId: string;
}

/**
 * Filtros para la consulta de historial
 */
export interface AgentHistoryFilters {
  startDate: Date;
  endDate: Date;
  agentName?: string;
  status?: AgentStatus | 'all';
}

/**
 * Respuesta del servicio con eventos procesados
 */
export interface AgentHistoryResponse {
  events: AgentStatusEvent[];
  totalCount: number;
}
