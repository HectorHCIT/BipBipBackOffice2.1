import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  doc,
  getDoc
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, switchMap } from 'rxjs';
import {
  SACChatStatusLog,
  SACUser,
  AgentStatusEvent,
  AgentHistoryResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AgentHistoryService {
  private readonly firestore = inject(Firestore);

  // Cache de agentes para optimizar consultas
  private agentsCache = new Map<string, SACUser>();

  /**
   * Obtiene el historial de cambios de estado de agentes
   */
  getAgentStatusHistory(startDate: Date, endDate: Date): Observable<AgentHistoryResponse> {

    // Convertir fechas locales a Timestamps de Firebase
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    // Query a la colección SACChatStatusLog
    const logsRef = collection(this.firestore, 'SACChatStatusLog');
    const q = query(
      logsRef,
      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp),
      orderBy('createdAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      switchMap((querySnapshot) => from(this.processQuerySnapshot(querySnapshot))),
      catchError((error) => {
        console.error('[AgentHistory] Error obteniendo historial:', error);
        throw error;
      })
    );
  }

  /**
   * Procesa el snapshot de Firebase y retorna los eventos
   */
  private async processQuerySnapshot(querySnapshot: any): Promise<AgentHistoryResponse> {

    const events: AgentStatusEvent[] = [];

    for (const docSnap of querySnapshot.docs) {
      const logData = { id: docSnap.id, ...docSnap.data() } as SACChatStatusLog;

      // Obtener info del agente (con cache)
      const agentInfo = await this.getAgentInfo(logData.sacUserId);

      const event: AgentStatusEvent = {
        id: logData.id || docSnap.id,
        agentName: agentInfo?.name || 'Agente desconocido',
        agentUsername: logData.username,
        status: logData.status,
        changedAt: new Date(logData.createdAt.seconds * 1000),
        changedBy: await this.getUsernameById(logData.updateStatusBy),
        sacUserId: logData.sacUserId
      };

      events.push(event);
    }

    return {
      events,
      totalCount: events.length
    };
  }

  /**
   * Obtiene la información de un agente por su UID
   * Usa cache para evitar consultas repetidas
   */
  private async getAgentInfo(userId: string): Promise<SACUser | null> {
    // Verificar cache
    if (this.agentsCache.has(userId)) {
      return this.agentsCache.get(userId)!;
    }

    try {
      const userDocRef = doc(this.firestore, 'SACUsers', userId);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = { uid: userId, ...docSnap.data() } as SACUser;
        this.agentsCache.set(userId, userData);
        return userData;
      }

      return null;
    } catch (error) {
      console.error('[AgentHistory] Error obteniendo info del agente:', error);
      return null;
    }
  }

  /**
   * Obtiene el username de un usuario por su ID
   */
  private async getUsernameById(userId: string): Promise<string> {
    const agentInfo = await this.getAgentInfo(userId);
    return agentInfo?.username || 'Sistema';
  }

  /**
   * Limpia el cache de agentes
   */
  clearCache(): void {
    this.agentsCache.clear();
  }

  /**
   * Obtiene todos los agentes SAC disponibles
   */
  getAllAgents(): Observable<SACUser[]> {
    const usersRef = collection(this.firestore, 'SACUsers');

    return from(getDocs(usersRef)).pipe(
      map((querySnapshot) => {
        const agents: SACUser[] = [];
        querySnapshot.forEach((doc) => {
          const agentData = { uid: doc.id, ...doc.data() } as SACUser;
          agents.push(agentData);
          // Cachear los agentes obtenidos
          this.agentsCache.set(doc.id, agentData);
        });
        return agents;
      }),
      catchError((error) => {
        console.error('[AgentHistory] Error obteniendo agentes:', error);
        throw error;
      })
    );
  }
}
