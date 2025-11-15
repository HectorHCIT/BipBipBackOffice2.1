import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
  viewChild,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { map, switchMap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

// PrimeNG
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

// Componentes
import {
  ChatHeaderComponent,
  ChatCardComponent,
  ChatInputComponent,
  ChatBodyComponent,
  MessageSubmitData,
  ImageViewerDialogComponent,
  PredefinedResponsesDialogComponent,
  AgentStatusIndicatorComponent
} from '../../../shared/components';


// Servicios
import { AuthService } from '../../../../../../core/services/auth.service';
import { FirebaseDriverChatService } from '../../services/firebase-driver-chat.service';
import { ImageUploadService } from '../../../../../../shared/services/image-upload.service';
import { DriverChatAdapterService } from '../../services/driver-chat-adapter.service';
import {
  ChatCardData,
  ChatMessageBlock
} from '../../../sac-cliente/services/chat-adapter.service';
import { LocationService, CustomerService, ChatHistoryService, PushNotificationService, AgentStatusService } from '../../../shared/services';
import { SaveChatHistory, ChatBox, SACUser, AgentStatus } from '../../../shared/models';

// Firebase
import { Timestamp } from '@angular/fire/firestore';

// Modelos
import {
  FirebaseDriverChatDocument,
  FirebaseDriverChatMessage,
  getDriverSubcollectionId,
  BACKEND_CHAT_TYPE
} from '../../models';

/**
 * Página principal de chats SAC-Driver
 *
 * Funcionalidades:
 * - Lista de chats pendientes y asignados
 * - Mensajería en tiempo real
 * - Asignación manual de chats
 * - Marcado de mensajes como leídos
 * - Envío de mensajes de texto e imágenes
 */
@Component({
  selector: 'app-sac-driver-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    ConfirmDialogModule,
    ChatHeaderComponent,
    ChatCardComponent,
    ChatInputComponent,
    ChatBodyComponent,
    AgentStatusIndicatorComponent
  ],
  providers: [MessageService, DialogService, ConfirmationService],
  templateUrl: './sac-driver-page.component.html',
  styleUrls: ['./sac-driver-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SacDriverPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly firebaseDriverChatService = inject(FirebaseDriverChatService);
  private readonly chatAdapter = inject(DriverChatAdapterService);
  private readonly messageService = inject(MessageService);
  private readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly locationService = inject(LocationService);
  private readonly imageUploadService = inject(ImageUploadService);
  // TODO: Create a DriverService following the same pattern as CustomerService
  // For now, using CustomerService as a workaround (may work if backend accepts driverId)
  private readonly customerService = inject(CustomerService);
  private readonly chatHistoryService = inject(ChatHistoryService);
  private readonly pushNotificationService = inject(PushNotificationService);
  private readonly agentStatusService = inject(AgentStatusService);

  // ViewChild para el chat input
  readonly chatInput = viewChild<ChatInputComponent>('chatInput');

  // Set para trackear chats con suscripción activa a mensajes
  private readonly subscribedChats = new Set<string>();

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'SAC', routerLink: '/sac' },
    { label: 'Chats' },
    { label: 'SAC-Driver' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Signals para estado
  readonly unassignedChats = signal<FirebaseDriverChatDocument[]>([]);
  readonly assignedChats = signal<FirebaseDriverChatDocument[]>([]);
  readonly allMessages = signal<Map<string, FirebaseDriverChatMessage[]>>(new Map());
  readonly selectedChatId = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly driverNames = signal<Map<string, string>>(new Map());  // Map driverId -> driverName
  readonly agentStatus = signal<AgentStatus>('offline');  // Estado actual del agente

  // Computed signals
  readonly selectedChat = computed(() => {
    const chatId = this.selectedChatId();
    if (!chatId) return null;

    // Buscar en chats asignados
    const assigned = this.assignedChats().find(c => c.uid === chatId);
    if (assigned) return assigned;

    // Buscar en chats no asignados
    return this.unassignedChats().find(c => c.uid === chatId) || null;
  });

  readonly selectedChatMessages = computed(() => {
    const chatId = this.selectedChatId();
    if (!chatId) return [];

    return this.allMessages().get(chatId) || [];
  });

  readonly messageBlocks = computed(() => {
    const messages = this.selectedChatMessages();
    const chat = this.selectedChat();

    // Obtener el driverName del chat actual (viene en Firebase o del Map)
    const driverName = chat?.driverName || this.driverNames().get(chat?.driverId || '');

    return this.chatAdapter.toMessageBlocks(messages, driverName);
  });

  readonly selectedChatCardData = computed((): ChatCardData | null => {
    const chat = this.selectedChat();
    if (!chat) return null;

    const messages = this.selectedChatMessages();
    const unreadCount = this.chatAdapter.countUnreadMessages(messages);

    // Prioridad: driverName de Firebase, luego del Map, luego fallback
    const driverName = chat.driverName || this.driverNames().get(chat.driverId);

    return this.chatAdapter.toCardData(chat, unreadCount, true, driverName);
  });

  readonly filteredChats = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const chats = this.assignedChats();

    if (!search) return chats;

    return chats.filter(chat =>
      chat.driverId.toString().includes(search) ||
      chat.userName?.toLowerCase().includes(search) ||
      chat.uid.toLowerCase().includes(search)
    );
  });

  // ✅ VALIDACIONES: Solo mostrar chats pendientes si está online
  readonly visibleUnassignedChats = computed(() => {
    return this.agentStatus() === 'online' ? this.unassignedChats() : [];
  });

  // ✅ VALIDACIONES: Solo puede tomar chats si está online
  readonly canTakeChats = computed(() => {
    return this.agentStatus() === 'online';
  });

  // ✅ VALIDACIONES: Solo puede finalizar chats si está online
  readonly canFinalizeChats = computed(() => {
    return this.agentStatus() === 'online';
  });

  // ✅ ADMIN: Computed signal para verificar si el usuario es admin
  readonly isAdminUser = computed(() => {
    const role = this.authService.userRole();
    return role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'administrador';
  });

  readonly chatInfo = computed(() => {
    const chat = this.selectedChat();
    if (!chat) {
      return {
        emisor: 'Driver',
        receptor: 'SAC',
        chatType: 'sac-driver' as const
      };
    }

    // Usar driverName de Firebase si existe, sino fallback a "Driver {driverId}"
    const driverName = chat.driverName || `Driver ${chat.driverId}`;

    return {
      emisor: driverName,  // Muestra nombre real: "CIT Desarrollo"
      receptor: chat.userName || 'SAC',
      chatType: 'sac-driver' as const
    };
  });

  async ngOnInit(): Promise<void> {
    // Cargar datos de ubicación primero
    try {
      await this.locationService.loadLocations();
    } catch (error) {
      console.error('[SacDriverPage] Error al cargar ubicaciones:', error);
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se pudieron cargar los datos de ubicación'
      });
    }

    this.initializeSubscriptions();
  }

  /**
   * Obtiene el ID del usuario actual
   */
  userId(): string {
    return this.authService.getUserId() || 'temp-user-id';
  }

  /**
   * Obtiene el nombre del usuario actual
   */
  userName(): string {
    return this.authService.userName() || 'Agente SAC';
  }

  /**
   * Verifica si el usuario es admin
   */
  isAdmin(): boolean {
    return this.isAdminUser();
  }

  /**
   * Inicializa las subscripciones a Firebase
   */
  private initializeSubscriptions(): void {
    // ✅ Suscribirse al estado del agente
    this.agentStatusService.getAgentData(this.userId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (agent) => {
          if (agent) {
            this.agentStatus.set(agent.currentStatus);
          }
        },
        error: (error) => {
          console.error('[SacDriverPage] Error al obtener estado del agente:', error);
        }
      });

    // ✅ ADMIN: Los admins NO ven chats no asignados
    if (!this.isAdminUser()) {
      this.firebaseDriverChatService.getUnassignedChats()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (chats) => {
            this.unassignedChats.set(chats);
          },
          error: (error) => {
            console.error('[SacDriverPage] Error al cargar chats no asignados:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudieron cargar los chats pendientes'
            });
          }
        });
    }

    // ✅ ADMIN: Chats asignados - Admins ven TODOS, agentes solo los suyos
    const chatsObservable = this.isAdminUser()
      ? this.firebaseDriverChatService.getAllAssignedChats()
      : this.firebaseDriverChatService.getUserChats(this.userId());

    chatsObservable
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        // Para cada chat asignado, subscribirse a sus mensajes
        switchMap(chats => {
          this.assignedChats.set(chats);

          // Subscribirse a mensajes de todos los chats
          chats.forEach(chat => {
            this.subscribeToMessages(chat.uid);
            this.loadDriverName(chat.driverId);
          });

          return [];
        })
      )
      .subscribe({
        error: (error) => {
          console.error('[SacDriverPage] Error al cargar chats asignados:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar tus chats'
          });
        }
      });
  }

  /**
   * Carga el nombre de un conductor y lo almacena en el map
   * NOTA: El driverName ya viene en Firebase, así que solo lo extraemos del documento
   */
  private loadDriverName(driverId: string): void {
    // El nombre del driver ya viene en el documento de Firebase (chat.driverName)
    // Este método ya no necesita hacer llamadas al backend
    // Se mantiene por compatibilidad pero no hace nada
  }

  /**
   * Se subscribe a los mensajes de un chat específico
   */
  private subscribeToMessages(chatId: string): void {
    // Evitar suscripciones duplicadas
    if (this.subscribedChats.has(chatId)) {
      return;
    }

    this.subscribedChats.add(chatId);

    this.firebaseDriverChatService.getChatMessages(chatId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (messages) => {
          this.allMessages.update(map => {
            const newMap = new Map(map);
            newMap.set(chatId, messages);
            return newMap;
          });

          // Si este es el chat seleccionado y hay mensajes no leídos, marcar como leído
          if (chatId === this.selectedChatId() && !this.isAdmin()) {
            this.markMessagesAsRead(chatId);
          }
        },
        error: (error) => {
          console.error(`[SacDriverPage] Error al cargar mensajes del chat ${chatId}:`, error);
          this.subscribedChats.delete(chatId); // Remover del set si falla
        }
      });
  }

  /**
   * Marca mensajes del chat como leídos
   */
  private async markMessagesAsRead(chatId: string): Promise<void> {
    try {
      await this.firebaseDriverChatService.markChatMessagesAsRead(chatId);
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
    }
  }

  /**
   * Selecciona un chat
   */
  onChatSelect(cardData: ChatCardData): void {
    this.selectedChatId.set(cardData.id);

    // Suscribirse a mensajes del chat si aún no está suscrito
    this.subscribeToMessages(cardData.id);

    // Marcar mensajes como leídos si no es admin
    if (!this.isAdmin()) {
      this.markMessagesAsRead(cardData.id);
    }
  }

  /**
   * Toma un chat no asignado
   */
  async onTakeUnassignedChat(chatId: string): Promise<void> {
    // ✅ VALIDACIÓN: Solo puede tomar chats si está online
    if (!this.canTakeChats()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acción no permitida',
        detail: 'Debes estar en estado "Online" para tomar chats'
      });
      return;
    }

    try {
      // Encontrar el chat en la lista de no asignados para obtener el driverId
      const chat = this.unassignedChats().find(c => c.uid === chatId);

      await this.firebaseDriverChatService.assignChat(
        chatId,
        this.userId(),
        this.userName()
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Chat asignado',
        detail: 'El chat ha sido asignado exitosamente'
      });

      // Cargar nombre del conductor si existe el chat
      if (chat) {
        this.loadDriverName(chat.driverId);
      }

      // Seleccionar el chat automáticamente
      this.selectedChatId.set(chatId);

    } catch (error) {
      console.error('Error al asignar chat:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo asignar el chat'
      });
    }
  }

  /**
   * Maneja el envío de un mensaje
   */
  async onSendMessage(messageData: MessageSubmitData): Promise<void> {
    const chat = this.selectedChat();
    if (!chat) return;

    try {
      let imageUrl: string | null = null;

      // Si hay imagen, subirla primero a S3
      if (messageData.imageFile) {
        const timestamp = Date.now();

        imageUrl = await firstValueFrom(
          this.imageUploadService.uploadChatImage(
            chat.uid,              // chatId: "help_424639" o "order_55454"
            messageData.imageFile, // File object
            timestamp,             // 1731427856000
            false                  // No optimizar para subida más rápida
          )
        );
      }

      // Enviar a Firebase
      // Firma: sendMessage(chatId, driverId, messageText, isFromDriver, userName?, imageUrl?)
      await this.firebaseDriverChatService.sendMessage(
        chat.uid,            // chatId
        chat.driverId,       // driverId
        messageData.message, // messageText
        false,               // isFromDriver (false = es del agente SAC)
        this.userName(),     // userName
        imageUrl || undefined // imageUrl
      );

      // Limpiar el input después de enviar exitosamente
      this.chatInput()?.finishUpload();

      // Enviar push notification al conductor
      try {
        await firstValueFrom(
          this.pushNotificationService.notifyCustomer(
            chat.driverId.toString(),  // driverId como string
            0,  // orderId - siempre 0 por ahora ya que no existe en el modelo
            chat.uid,
            {
              title: 'Nuevo mensaje de SAC',
              body: messageData.message || 'Has recibido un nuevo mensaje'
            }
          )
        );
      } catch (pushError) {
        console.warn('No se pudo enviar la notificación push:', pushError);
        // No mostrar error al usuario, no es crítico
      }

    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: messageData.imageFile
          ? 'No se pudo subir la imagen o enviar el mensaje'
          : 'No se pudo enviar el mensaje'
      });

      // Resetear estado de carga del input
      this.chatInput()?.finishUpload();
    }
  }

  /**
   * Abre el dialog de respuestas predefinidas
   */
  onOpenPredefinedResponses(): void {
    const ref = this.dialogService.open(PredefinedResponsesDialogComponent, {
      header: ' ',  // Espacio vacío, el componente maneja su propio header
      modal: true,
      dismissableMask: false,
      width: '700px',
      contentStyle: { padding: 0 },
      style: { maxWidth: '95vw' }
    });

    // Cuando se selecciona una respuesta, insertarla en el chat input
    if (ref) {
      ref.onClose.subscribe((result) => {
        if (result?.response) {
          this.chatInput()?.setMessage(result.response);
        }
      });
    }
  }

  /**
   * Maneja el click en una imagen - Abre el visor con zoom
   */
  onImageClick(imageUrl: string): void {
    this.dialogService.open(ImageViewerDialogComponent, {
      data: { imageUrl },
      modal: true,
      dismissableMask: true,
      closable: false,
      width: '90vw',
      contentStyle: { padding: 0 }
    });
  }

  /**
   * Maneja la finalización de un chat
   */
  async onFinalizeChat(chatId: string): Promise<void> {
    // ✅ VALIDACIÓN: Solo puede finalizar chats si está online
    if (!this.canFinalizeChats()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acción no permitida',
        detail: 'Debes estar en estado "Online" para finalizar chats'
      });
      return;
    }

    // Buscar el chat
    const chat = this.selectedChat();
    if (!chat || chat.uid !== chatId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo encontrar el chat'
      });
      return;
    }

    // Mostrar confirmation dialog
    this.confirmationService.confirm({
      message: '¿Estás seguro de finalizar este chat? Esta acción no se puede deshacer.',
      header: 'Confirmar finalización',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, finalizar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          // 1. Obtener todos los mensajes
          const messages = this.allMessages().get(chatId) || [];

          // 2. Usar el adapter para transformar - maneja ambos formatos correctamente
          const chatHistory = this.chatAdapter.toSaveFormat(chat, messages);

          // 4. Guardar en el backend
          await firstValueFrom(this.chatHistoryService.saveChatEnded(chatHistory));

          // 5. Eliminar chat de Firebase
          await this.firebaseDriverChatService.deleteChat(chatId);

          // 6. Limpiar UI
          this.selectedChatId.set(null);

          // 7. Mostrar éxito
          this.messageService.add({
            severity: 'success',
            summary: 'Chat finalizado',
            detail: 'El chat ha sido finalizado y guardado en el historial'
          });

        } catch (error) {
          console.error('Error al finalizar chat:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo finalizar el chat. Por favor, intenta nuevamente.'
          });
        }
      }
    });
  }

  /**
   * Convierte Timestamp de Firebase a ISO string
   */
  private timestampToISO(timestamp: Timestamp | undefined): string {
    if (!timestamp) {
      return new Date().toISOString(); // Fallback a fecha actual si no existe
    }
    return timestamp.toDate().toISOString();
  }

  /**
   * Cierra el chat actual (deselecciona)
   */
  onCloseChat(): void {
    this.selectedChatId.set(null);
  }

  /**
   * Obtiene el card data para un chat
   */
  getChatCardData(chat: FirebaseDriverChatDocument): ChatCardData {
    const messages = this.allMessages().get(chat.uid) || [];
    const unreadCount = this.chatAdapter.countUnreadMessages(messages);
    const isSelected = chat.uid === this.selectedChatId();
    const driverName = this.driverNames().get(chat.driverId);

    return this.chatAdapter.toCardData(chat, unreadCount, isSelected, driverName);
  }

  /**
   * Track by para ngFor
   */
  trackByChatId(index: number, chat: FirebaseDriverChatDocument): string {
    return chat.uid;
  }
}
