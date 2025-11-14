import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Firestore,
  doc,
  docData,
  writeBatch,
  collection,
  Timestamp
} from '@angular/fire/firestore';

import { AuthService } from '@core/services/auth.service';
import { SACUser, StatusBitacora, AgentStatus } from '../models/agent-status.model';

/**
 * AgentStatusService - Gestiona el estado de los agentes SAC
 *
 * Features:
 * - ✅ Obtener estado actual del agente desde Firebase
 * - ✅ Actualizar estado del agente (online/break/offline)
 * - ✅ Guardar logs de cambios de estado (bitácora)
 * - ✅ Validación: no permite cambio con chats activos
 */
@Injectable({
  providedIn: 'root'
})
export class AgentStatusService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);

  /**
   * Obtiene los datos del agente actual desde Firebase
   * Escucha cambios en tiempo real
   */
  getAgentData(userId: string): Observable<SACUser | undefined> {
    const userDocRef = doc(this.firestore, 'SACUsers', userId);
    return docData(userDocRef, { idField: 'uid' }) as Observable<SACUser | undefined>;
  }

  /**
   * Actualiza el estado del agente y guarda en bitácora
   *
   * @param userId ID del agente
   * @param newStatus Nuevo estado (online/break/offline)
   * @param currentActiveChatRooms Número actual de chats activos
   * @param currentStatus Estado actual del agente
   * @returns Promise<void>
   * @throws Error si hay chats activos al intentar cambiar desde online
   */
  async updateAgentStatus(
    userId: string,
    newStatus: AgentStatus,
    currentActiveChatRooms: number,
    currentStatus: AgentStatus
  ): Promise<void> {
    // Validación: No permitir cambio de online a otro estado si hay chats activos
    if (currentActiveChatRooms > 0 && currentStatus === 'online' && newStatus !== 'online') {
      throw new Error('No se puede cambiar el estado mientras hay chats activos. Finaliza todos los chats primero.');
    }

    // Preparar datos de bitácora
    const userData = this.authService.currentUser();
    const bitacora: StatusBitacora = {
      sacUserId: userId,
      status: newStatus,
      createdAt: Timestamp.fromDate(new Date()),
      updateStatusBy: userId,
      username: userData?.fullName || 'Unknown'
    };

    // Referencias de documentos
    const userDocRef = doc(this.firestore, 'SACUsers', userId);
    const bitacoraCollectionRef = collection(this.firestore, 'SACChatStatusLog');
    const bitacoraDocRef = doc(bitacoraCollectionRef);

    // Batch write para garantizar atomicidad
    const batch = writeBatch(this.firestore);

    // 1. Actualizar estado en SACUsers
    batch.update(userDocRef, {
      currentStatus: newStatus,
      updateStatusDate: Timestamp.fromDate(new Date())
    });

    // 2. Guardar log en SACChatStatusLog
    batch.set(bitacoraDocRef, {
      ...bitacora,
      uid: bitacoraDocRef.id
    });

    // Ejecutar transacción
    await batch.commit();
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId(): string {
    return this.authService.getUserId() || '';
  }

  /**
   * Obtiene el nombre del usuario actual
   */
  getCurrentUserName(): string {
    return this.authService.userName() || 'Agente SAC';
  }
}
