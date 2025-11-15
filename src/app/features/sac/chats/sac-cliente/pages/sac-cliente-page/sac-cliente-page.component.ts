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
import { FirebaseChatService } from '../../services/firebase-chat.service';
import { ImageUploadService } from '../../../../../../shared/services/image-upload.service';
import {
  ChatAdapterService,
  ChatCardData,
  ChatMessageBlock
} from '../../services/chat-adapter.service';
import { LocationService, CustomerService, ChatHistoryService, PushNotificationService, AgentStatusService } from '../../../shared/services';
import { SaveChatHistory, ChatBox, SACUser, AgentStatus } from '../../../shared/models';

// Firebase
import { Timestamp } from '@angular/fire/firestore';

// Modelos
import {
  FirebaseChatDocument,
  FirebaseChatMessage,
  getSubcollectionId
} from '../../models';

/**
 * Página principal de chats SAC-Cliente
 *
 * Funcionalidades:
 * - Lista de chats pendientes y asignados
 * - Mensajería en tiempo real
 * - Asignación manual de chats
 * - Marcado de mensajes como leídos
 * - Envío de mensajes de texto e imágenes
 */
@Component({
  selector: 'app-sac-cliente-page',
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
  templateUrl: './sac-cliente-page.component.html',
  styleUrls: ['./sac-cliente-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SacClientePageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly firebaseChatService = inject(FirebaseChatService);
  private readonly chatAdapter = inject(ChatAdapterService);
  private readonly messageService = inject(MessageService);
  private readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly locationService = inject(LocationService);
  private readonly imageUploadService = inject(ImageUploadService);
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
    { label: 'SAC-Cliente' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Signals para estado
  readonly unassignedChats = signal<FirebaseChatDocument[]>([]);
  readonly assignedChats = signal<FirebaseChatDocument[]>([]);
  readonly allMessages = signal<Map<string, FirebaseChatMessage[]>>(new Map());
  readonly selectedChatId = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly customerNames = signal<Map<number, string>>(new Map());  // Map customerId -> customerName
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
    return this.chatAdapter.toMessageBlocks(messages);
  });

  readonly selectedChatCardData = computed((): ChatCardData | null => {
    const chat = this.selectedChat();
    if (!chat) return null;

    const messages = this.selectedChatMessages();
    const unreadCount = this.chatAdapter.countUnreadMessages(messages);
    const customerName = this.customerNames().get(chat.customerId);

    return this.chatAdapter.toCardData(chat, unreadCount, true, customerName);
  });

  readonly filteredChats = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const chats = this.assignedChats();

    if (!search) return chats;

    return chats.filter(chat =>
      chat.customerId.toString().includes(search) ||
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
        emisor: 'Cliente',
        receptor: 'SAC',
        chatType: 'sac-cliente' as const
      };
    }

    return {
      emisor: `Cliente ${chat.customerId}`,
      receptor: chat.userName || 'SAC',
      chatType: 'sac-cliente' as const
    };
  });

  async ngOnInit(): Promise<void> {
    // Cargar datos de ubicación primero
    try {
      await this.locationService.loadLocations();
    } catch (error) {
      console.error('[SacClientePage] Error al cargar ubicaciones:', error);
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
          console.error('[SacClientePage] Error al obtener estado del agente:', error);
        }
      });

    // ✅ ADMIN: Los admins NO ven chats no asignados
    if (!this.isAdminUser()) {
      this.firebaseChatService.getUnassignedChats()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (chats) => {
            this.unassignedChats.set(chats);
          },
          error: (error) => {
            console.error('[SacClientePage] Error al cargar chats no asignados:', error);
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
      ? this.firebaseChatService.getAllAssignedChats()
      : this.firebaseChatService.getUserChats(this.userId());

    chatsObservable
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        // Para cada chat asignado, subscribirse a sus mensajes
        switchMap(chats => {
          this.assignedChats.set(chats);

          // Subscribirse a mensajes de todos los chats
          chats.forEach(chat => {
            this.subscribeToMessages(chat.uid);
            this.loadCustomerName(chat.customerId);
          });

          return [];
        })
      )
      .subscribe({
        error: (error) => {
          console.error('[SacClientePage] Error al cargar chats asignados:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar tus chats'
          });
        }
      });
  }

  /**
   * Carga el nombre de un cliente y lo almacena en el map
   */
  private loadCustomerName(customerId: number): void {
    // Si ya está cargado, no hacer la llamada de nuevo
    if (this.customerNames().has(customerId)) {
      return;
    }

    this.customerService.getCustomerName(customerId).subscribe({
      next: (name) => {
        this.customerNames.update(map => {
          const newMap = new Map(map);
          newMap.set(customerId, name);
          return newMap;
        });
      },
      error: (error) => {
        console.warn(`No se pudo cargar el nombre del cliente ${customerId}:`, error);
        // No mostrar error al usuario, no es crítico
      }
    });
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

    this.firebaseChatService.getChatMessages(chatId)
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
          console.error(`Error al cargar mensajes del chat ${chatId}:`, error);
          this.subscribedChats.delete(chatId); // Remover del set si falla
        }
      });
  }

  /**
   * Marca mensajes del chat como leídos
   */
  private async markMessagesAsRead(chatId: string): Promise<void> {
    try {
      await this.firebaseChatService.markChatMessagesAsRead(chatId);
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
      // Encontrar el chat en la lista de no asignados para obtener el customerId
      const chat = this.unassignedChats().find(c => c.uid === chatId);

      await this.firebaseChatService.assignChat(
        chatId,
        this.userId(),
        this.userName()
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Chat asignado',
        detail: 'El chat ha sido asignado exitosamente'
      });

      // Cargar nombre del cliente si existe el chat
      if (chat) {
        this.loadCustomerName(chat.customerId);
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
      // Firma: sendMessage(chatId, customerId, messageText, isFromCustomer, userName?, imageUrl?)
      await this.firebaseChatService.sendMessage(
        chat.uid,            // chatId
        chat.customerId,     // customerId
        messageData.message, // messageText
        false,               // isFromCustomer (false = es del agente SAC)
        this.userName(),     // userName
        imageUrl || undefined // imageUrl
      );

      // Limpiar el input después de enviar exitosamente
      this.chatInput()?.finishUpload();

      // Enviar push notification al cliente
      try {
        await firstValueFrom(
          this.pushNotificationService.notifyCustomer(
            chat.customerId.toString(),  // customerId como string
            0,  // orderId - siempre 0 por ahora ya que no existe en el modelo
            chat.uid,
            {
              title: 'Nuevo mensaje de SAC',
              body: messageData.message || 'Has recibido un nuevo mensaje'
            }
          )
        );
      } catch (pushError) {
        console.warn('⚠️ No se pudo enviar la notificación push:', pushError);
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

          // 2. Transformar mensajes al formato ChatBox
          const chatBoxes: ChatBox[] = messages.map(msg => ({
            message: msg.Message || '',
            dateMessage: this.timestampToISO(msg.Datetime || msg.dateTime),
            sendBy: msg.customer ? 'Cliente' : 'SAC'
          }));

          // 3. Preparar datos para guardar
          const chatHistory: SaveChatHistory = {
            tipoChat: 'SC',  // SAC-Cliente
            userChat: this.userName(),
            idCustomer: chat.customerId,
            orderId: null,  // No hay orderId en el modelo actual
            chat: chatBoxes,
            assignedAt: this.timestampToISO(chat.dateTimeAssigned),
            createdAt: this.timestampToISO(chat.createdAt)
          };

          // 4. Guardar en el backend
          await firstValueFrom(this.chatHistoryService.saveChatEnded(chatHistory));

          // 5. Eliminar chat de Firebase
          await this.firebaseChatService.deleteChat(chatId);

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
  getChatCardData(chat: FirebaseChatDocument): ChatCardData {
    const messages = this.allMessages().get(chat.uid) || [];
    const unreadCount = this.chatAdapter.countUnreadMessages(messages);
    const isSelected = chat.uid === this.selectedChatId();
    const customerName = this.customerNames().get(chat.customerId);

    return this.chatAdapter.toCardData(chat, unreadCount, isSelected, customerName);
  }

  /**
   * Track by para ngFor
   */
  trackByChatId(index: number, chat: FirebaseChatDocument): string {
    return chat.uid;
  }
}
