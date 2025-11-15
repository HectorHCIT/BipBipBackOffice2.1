import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
  Timestamp,
  collectionData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  FirebaseDriverChatDocument,
  FirebaseDriverChatMessage,
  SacConfiguration,
  FIREBASE_DRIVER_COLLECTIONS,
  getDriverSubcollectionId
} from '../models';

/**
 * Servicio para operaciones de Firebase en chats SAC-Driver
 *
 * PRINCIPIO: Este servicio trabaja SOLO con tipos de Firebase.
 * NO transforma data - retorna exactamente lo que viene de Firebase.
 *
 * IMPORTANTE: Usa collectionData de AngularFire para evitar warnings
 * de injection context en modo zoneless.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseDriverChatService {
  private readonly firestore = inject(Firestore);

  /**
   * Obtiene chats no asignados
   * @returns Observable con chats donde userAssigned = false
   */
  getUnassignedChats(): Observable<FirebaseDriverChatDocument[]> {
    const q = query(
      collection(this.firestore, FIREBASE_DRIVER_COLLECTIONS.SAC_DRIVER),
      where('userAssigned', '==', false)
    );

    return collectionData(q, { idField: 'uid' }) as Observable<FirebaseDriverChatDocument[]>;
  }

  /**
   * Obtiene chats asignados a un usuario específico
   * @param userId ID del usuario
   */
  getUserChats(userId: string): Observable<FirebaseDriverChatDocument[]> {
    const q = query(
      collection(this.firestore, FIREBASE_DRIVER_COLLECTIONS.SAC_DRIVER),
      where('userId', '==', userId),
      where('finished', '==', false)
    );

    return collectionData(q, { idField: 'uid' }) as Observable<FirebaseDriverChatDocument[]>;
  }

  /**
   * Obtiene TODOS los chats asignados (para admins)
   * @returns Observable con todos los chats asignados, sin importar el usuario
   */
  getAllAssignedChats(): Observable<FirebaseDriverChatDocument[]> {
    const q = query(
      collection(this.firestore, FIREBASE_DRIVER_COLLECTIONS.SAC_DRIVER),
      where('userAssigned', '==', true),
      where('finished', '==', false)
    );

    return collectionData(q, { idField: 'uid' }) as Observable<FirebaseDriverChatDocument[]>;
  }

  /**
   * Obtiene mensajes de un chat específico
   * @param chatId ID del chat (ej: "help_424639")
   */
  getChatMessages(chatId: string): Observable<FirebaseDriverChatMessage[]> {
    const subId = getDriverSubcollectionId(chatId);
    const messagesPath = `${FIREBASE_DRIVER_COLLECTIONS.SAC_DRIVER}/${chatId}/${subId}`;

    const q = query(collection(this.firestore, messagesPath));

    return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(
      map(messages => {
        const mapped = messages.map(msg => ({
          ...msg,
          chatId: chatId
        })) as FirebaseDriverChatMessage[];

        // Ordenar manualmente por timestamp (prioridad a minúsculas)
        mapped.sort((a, b) => {
          const timeA = a.dateTime?.seconds || a.Datetime?.seconds || 0;
          const timeB = b.dateTime?.seconds || b.Datetime?.seconds || 0;
          return timeA - timeB;
        });

        return mapped;
      })
    );
  }

  /**
   * Envía un mensaje al chat
   * @param chatId ID del chat
   * @param driverId ID del conductor (string como "BIP-00373")
   * @param messageText Texto del mensaje
   * @param isFromDriver Si el mensaje es del conductor (true) o del agente (false)
   * @param userName Nombre del usuario que envía (solo si es agente)
   * @param imageUrl URL de imagen opcional
   */
  async sendMessage(
    chatId: string,
    driverId: string,
    messageText: string,
    isFromDriver: boolean,
    userName?: string,
    imageUrl?: string
  ): Promise<void> {
    const subId = getDriverSubcollectionId(chatId);
    const messagesPath = `${FIREBASE_DRIVER_COLLECTIONS.SAC_DRIVER}/${chatId}/${subId}`;

    const now = Timestamp.now();

    // IMPORTANTE: Para SAC-Driver, los mensajes usan MINÚSCULAS (no como SAC-Cliente)
    // El driver espera: dateTime, driverId, message (todo en minúsculas)
    const messageData = {
      driverId: chatId,                   // Usar chatId completo (ej: "help_BIP-00373")
      dateTime: now,                      // Minúscula (formato driver)
      message: messageText,               // Minúscula (formato driver)
      driver: isFromDriver,
      imageUrl: imageUrl || null,
      read: false,
      ...(!isFromDriver && userName && { userName: userName })
    };

    await addDoc(collection(this.firestore, messagesPath), messageData);
  }

  /**
   * Asigna un chat a un agente
   * @param chatId ID del chat
   * @param userId ID del usuario
   * @param userName Nombre del usuario
   */
  async assignChat(chatId: string, userId: string, userName: string): Promise<void> {
    const chatRef = doc(this.firestore, FIREBASE_DRIVER_COLLECTIONS.SAC_DRIVER, chatId);

    await updateDoc(chatRef, {
      userAssigned: true,
      userId: userId,
      userName: userName,
      wasOpen: true,
      dateTimeAssigned: Timestamp.now()
    });
  }

  /**
   * Marca mensajes de un chat como leídos
   * Solo marca mensajes del conductor (driver: true) que no han sido leídos
   */
  async markChatMessagesAsRead(chatId: string): Promise<void> {
    const subId = getDriverSubcollectionId(chatId);
    const messagesPath = `${FIREBASE_DRIVER_COLLECTIONS.SAC_DRIVER}/${chatId}/${subId}`;

    // Query para mensajes no leídos del conductor
    const q = query(
      collection(this.firestore, messagesPath),
      where('driver', '==', true),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return; // No hay mensajes para marcar
    }

    // Usar batch para actualizar todos a la vez
    const batch = writeBatch(this.firestore);

    snapshot.docs.forEach(document => {
      batch.update(document.ref, { read: true });
    });

    await batch.commit();
  }

  /**
   * Elimina un chat completo (mensajes + documento principal)
   * @param chatId ID del chat
   */
  async deleteChat(chatId: string): Promise<void> {
    const subId = getDriverSubcollectionId(chatId);
    const messagesPath = `${FIREBASE_DRIVER_COLLECTIONS.SAC_DRIVER}/${chatId}/${subId}`;

    // 1. Eliminar todos los mensajes de la subcolección
    const messagesSnapshot = await getDocs(collection(this.firestore, messagesPath));

    const batch = writeBatch(this.firestore);

    messagesSnapshot.docs.forEach(document => {
      batch.delete(document.ref);
    });

    await batch.commit();

    // 2. Eliminar el documento principal del chat
    const chatRef = doc(this.firestore, FIREBASE_DRIVER_COLLECTIONS.SAC_DRIVER, chatId);
    await deleteDoc(chatRef);
  }

  /**
   * Marca un chat como finalizado
   * @param chatId ID del chat
   */
  async finishChat(chatId: string): Promise<void> {
    const chatRef = doc(this.firestore, FIREBASE_DRIVER_COLLECTIONS.SAC_DRIVER, chatId);

    await updateDoc(chatRef, {
      finished: true
    });
  }

  /**
   * Marca mensajes específicos como leídos
   * @param chatId ID del chat
   * @param messageIds IDs de los mensajes a marcar como leídos
   */
  async markMessagesAsRead(chatId: string, messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) {
      return; // No hay mensajes para marcar
    }

    const subId = getDriverSubcollectionId(chatId);
    const messagesPath = `${FIREBASE_DRIVER_COLLECTIONS.SAC_DRIVER}/${chatId}/${subId}`;

    // Usar batch para actualizar todos a la vez
    const batch = writeBatch(this.firestore);

    messageIds.forEach(messageId => {
      const messageRef = doc(this.firestore, messagesPath, messageId);
      batch.update(messageRef, { read: true });
    });

    await batch.commit();
  }

  /**
   * Obtiene la configuración de chats SAC
   */
  getSacConfiguration(): Observable<SacConfiguration | null> {
    const configRef = collection(this.firestore, FIREBASE_DRIVER_COLLECTIONS.SAC_CHAT_CONFIGURATIONS);

    return (collectionData(configRef) as Observable<any[]>).pipe(
      map(configs => {
        if (configs.length > 0) {
          return configs[0] as SacConfiguration;
        }
        return null;
      })
    );
  }
}
