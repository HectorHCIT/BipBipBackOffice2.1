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
  FirebaseChatDocument,
  FirebaseChatMessage,
  SacConfiguration,
  FIREBASE_COLLECTIONS,
  getSubcollectionId
} from '../models';

/**
 * Servicio para operaciones de Firebase en chats SAC-Cliente
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
export class FirebaseChatService {
  private readonly firestore = inject(Firestore);

  /**
   * Obtiene chats no asignados
   * @returns Observable con chats donde userAssigned = false
   */
  getUnassignedChats(): Observable<FirebaseChatDocument[]> {
    const q = query(
      collection(this.firestore, FIREBASE_COLLECTIONS.SAC),
      where('userAssigned', '==', false)
    );

    return (collectionData(q, { idField: 'uid' }) as Observable<FirebaseChatDocument[]>).pipe(
      map(chats => {
        return chats;
      })
    );
  }

  /**
   * Obtiene chats asignados a un usuario específico
   * @param userId ID del usuario
   */
  getUserChats(userId: string): Observable<FirebaseChatDocument[]> {

    // Query con SOLO userId para debuggear
    // TODO: Restaurar filtro de finished después de verificar
    const q = query(
      collection(this.firestore, FIREBASE_COLLECTIONS.SAC),
      where('userId', '==', userId)
      // where('finished', '==', false) // TEMPORALMENTE DESHABILITADO PARA DEBUG
    );

    return (collectionData(q, { idField: 'uid' }) as Observable<FirebaseChatDocument[]>).pipe(
      map(chats => {
       // Por ahora retornar solo los NO finalizados manualmente
        return chats.filter(c => !c.finished);
      })
    );
  }

  /**
   * Obtiene TODOS los chats asignados (para admins)
   * @returns Observable con todos los chats asignados, sin importar el usuario
   */
  getAllAssignedChats(): Observable<FirebaseChatDocument[]> {

    const q = query(
      collection(this.firestore, FIREBASE_COLLECTIONS.SAC),
      where('userAssigned', '==', true)
    );

    return (collectionData(q, { idField: 'uid' }) as Observable<FirebaseChatDocument[]>).pipe(
      map(chats => {
        // Filtrar solo los NO finalizados
        return chats.filter(c => !c.finished);
      })
    );
  }

  /**
   * Obtiene mensajes de un chat específico
   * @param chatId ID del chat (ej: "help_424639")
   */
  getChatMessages(chatId: string): Observable<FirebaseChatMessage[]> {
    const subId = getSubcollectionId(chatId);
    const messagesPath = `${FIREBASE_COLLECTIONS.SAC}/${chatId}/${subId}`;


    const q = query(
      collection(this.firestore, messagesPath),
      orderBy('Datetime')  // Firebase usa 'Datetime' con D mayúscula
    );

    return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(
      map(messages => {
        const mapped = messages.map(msg => ({
          ...msg,
          chatId: chatId,
          // Normalizar el campo (Firebase usa 'Datetime', nuestro tipo usa 'dateTime')
          dateTime: msg['Datetime'] || msg['dateTime']
        })) as FirebaseChatMessage[];

        return mapped;
      })
    );
  }

  /**
   * Envía un mensaje al chat
   * @param chatId ID del chat
   * @param customerId ID del cliente
   * @param messageText Texto del mensaje
   * @param isFromCustomer Si el mensaje es del cliente (true) o del agente (false)
   * @param userName Nombre del usuario que envía (solo si es agente)
   * @param imageUrl URL de imagen opcional
   */
  async sendMessage(
    chatId: string,
    customerId: number,
    messageText: string,
    isFromCustomer: boolean,
    userName?: string,
    imageUrl?: string
  ): Promise<void> {
    const subId = getSubcollectionId(chatId);
    const messagesPath = `${FIREBASE_COLLECTIONS.SAC}/${chatId}/${subId}`;

    const now = Timestamp.now();

    // Firebase espera campos con mayúsculas específicas
    const messageData = {
      CustomerId: customerId,             // Mayúscula en Firebase
      Datetime: now,                      // Mayúscula en Firebase
      dateTime: now,                      // Firebase guarda ambos
      Message: messageText,               // Mayúscula en Firebase
      customer: isFromCustomer,
      imageUrl: imageUrl || null,
      read: false,
      ...(!isFromCustomer && userName && { userName: userName })
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
    const chatRef = doc(this.firestore, FIREBASE_COLLECTIONS.SAC, chatId);

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
   * Solo marca mensajes del cliente (customer: true) que no han sido leídos
   */
  async markChatMessagesAsRead(chatId: string): Promise<void> {
    const subId = getSubcollectionId(chatId);
    const messagesPath = `${FIREBASE_COLLECTIONS.SAC}/${chatId}/${subId}`;

    // Query para mensajes no leídos del cliente
    const q = query(
      collection(this.firestore, messagesPath),
      where('customer', '==', true),
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
    const subId = getSubcollectionId(chatId);
    const messagesPath = `${FIREBASE_COLLECTIONS.SAC}/${chatId}/${subId}`;

    // 1. Eliminar todos los mensajes de la subcolección
    const messagesSnapshot = await getDocs(collection(this.firestore, messagesPath));

    const batch = writeBatch(this.firestore);

    messagesSnapshot.docs.forEach(document => {
      batch.delete(document.ref);
    });

    await batch.commit();

    // 2. Eliminar el documento principal del chat
    const chatRef = doc(this.firestore, FIREBASE_COLLECTIONS.SAC, chatId);
    await deleteDoc(chatRef);
  }

  /**
   * Marca un chat como finalizado
   * @param chatId ID del chat
   */
  async finishChat(chatId: string): Promise<void> {
    const chatRef = doc(this.firestore, FIREBASE_COLLECTIONS.SAC, chatId);

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

    const subId = getSubcollectionId(chatId);
    const messagesPath = `${FIREBASE_COLLECTIONS.SAC}/${chatId}/${subId}`;

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
    const configRef = collection(this.firestore, FIREBASE_COLLECTIONS.SAC_CHAT_CONFIGURATIONS);

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
