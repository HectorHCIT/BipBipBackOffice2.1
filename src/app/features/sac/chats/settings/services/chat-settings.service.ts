import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  collectionData,
  docData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Bitacora, ChatsConfigs, OnlineUser } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ChatSettingsService {
  private readonly firestore = inject(Firestore);

  /**
   * Obtiene la lista de agentes SAC con su estado actual
   */
  getAgentSac(): Observable<OnlineUser[]> {
    const usersCollection = collection(this.firestore, 'SACUsers');
    return collectionData(usersCollection, { idField: 'id' }) as Observable<OnlineUser[]>;
  }

  /**
   * Obtiene las configuraciones del sistema de chats
   */
  getChatConfigs(): Observable<ChatsConfigs> {
    const docRef = doc(collection(this.firestore, 'SACChatConfigurations'), 'configs');
    return docData(docRef) as Observable<ChatsConfigs>;
  }

  /**
   * Guarda las configuraciones del sistema de chats
   */
  async saveConfigs(updates: Partial<ChatsConfigs>): Promise<void> {
    const docRef = doc(collection(this.firestore, 'SACChatConfigurations'), 'configs');
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error('El documento de configuraciones no existe');
    }

    const existingKeys = Object.keys(snapshot.data() as ChatsConfigs);

    // Validar que solo se actualicen claves existentes
    for (const key of Object.keys(updates)) {
      if (!existingKeys.includes(key)) {
        throw new Error(`La clave "${key}" no existe en la configuración actual`);
      }
    }

    await updateDoc(docRef, { ...updates });
  }

  /**
   * Actualiza propiedades de un usuario SAC
   */
  async updateUserProperties(userId: string, updates: Partial<OnlineUser>): Promise<void> {
    const userDocRef = doc(this.firestore, 'SACUsers', userId);
    const snapshot = await getDoc(userDocRef);

    if (!snapshot.exists()) {
      throw new Error(`El usuario con ID "${userId}" no existe`);
    }

    await updateDoc(userDocRef, updates);
  }

  /**
   * Guarda un registro en la bitácora y actualiza el estado del agente
   */
  async saveBitacora(bitacora: Bitacora): Promise<void> {
    const bitacoraCollection = collection(this.firestore, 'SACChatStatusLog');
    const userDocRef = doc(this.firestore, 'SACUsers', bitacora.sacUserId);
    const batch = writeBatch(this.firestore);

    try {
      // Verificar que el usuario existe
      const userDocSnapshot = await getDoc(userDocRef);
      if (!userDocSnapshot.exists()) {
        throw new Error(`No se encontró un usuario SAC con el ID "${bitacora.sacUserId}"`);
      }

      // Actualizar estado del usuario
      batch.update(userDocRef, { currentStatus: bitacora.status });

      // Guardar registro en bitácora
      const bitacoraDocRef = doc(bitacoraCollection);
      bitacora.uid = bitacoraDocRef.id;
      batch.set(bitacoraDocRef, { ...bitacora });

      await batch.commit();
    } catch (error) {
      console.error('Error al guardar la bitácora o actualizar el estado:', error);
      throw error;
    }
  }
}
