import { Timestamp } from '@angular/fire/firestore';

/**
 * Agent Status Types
 */
export type AgentStatus = 'online' | 'break' | 'offline';

/**
 * SAC User Model - Represents an agent in the system
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
  lastDatetimeAssignedChat?: Timestamp;
  updateStatusDate?: Timestamp;
  mood?: string;
}

/**
 * Status Bitacora (Log) - Records status changes for audit trail
 */
export interface StatusBitacora {
  uid?: string;  // Document ID (auto-generated)
  sacUserId: string;
  status: AgentStatus;
  createdAt: Timestamp;
  updateStatusBy: string;
  username: string;
}

/**
 * Status Option for UI Dropdown
 */
export interface StatusOption {
  label: string;
  value: AgentStatus;
  dotClass: string;
  avatarClass: string;
}
