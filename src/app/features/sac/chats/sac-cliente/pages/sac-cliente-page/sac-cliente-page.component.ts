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
import { MenuItem, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

// Componentes
import {
  ChatHeaderComponent,
  ChatCardComponent,
  ChatInputComponent,
  ChatBodyComponent,
  MessageSubmitData,
  ImageViewerDialogComponent
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
import { LocationService } from '../../../shared/services';

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
    ChatHeaderComponent,
    ChatCardComponent,
    ChatInputComponent,
    ChatBodyComponent
  ],
  providers: [MessageService, DialogService],
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly locationService = inject(LocationService);
  private readonly imageUploadService = inject(ImageUploadService);

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

    return this.chatAdapter.toCardData(chat, unreadCount, true);
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
    console.log('[SacClientePage] ngOnInit - Iniciando componente');
    console.log('[SacClientePage] Usuario actual:', this.authService.currentUser());
    console.log('[SacClientePage] User ID:', this.authService.getUserId());
    console.log('[SacClientePage] User Name:', this.authService.userName());

    // Cargar datos de ubicación primero
    try {
      await this.locationService.loadLocations();
      console.log('[SacClientePage] Datos de ubicación cargados');
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
   * Verifica si el usuario es admin (TODO: implementar lógica real)
   */
  isAdmin(): boolean {
    // TODO: Implementar lógica real para verificar si es admin
    return false;
  }

  /**
   * Inicializa las subscripciones a Firebase
   */
  private initializeSubscriptions(): void {
    console.log('[SacClientePage] Inicializando suscripciones...');
    console.log('[SacClientePage] userId():', this.userId());
    console.log('[SacClientePage] userName():', this.userName());

    // Chats no asignados
    this.firebaseChatService.getUnassignedChats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (chats) => {
          console.log('[SacClientePage] Chats no asignados recibidos:', chats.length, chats);
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

    // Chats asignados al usuario
    this.firebaseChatService.getUserChats(this.userId())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        // Para cada chat asignado, subscribirse a sus mensajes
        switchMap(chats => {
          console.log('[SacClientePage] Chats asignados recibidos:', chats.length, chats);
          this.assignedChats.set(chats);

          // Subscribirse a mensajes de todos los chats
          chats.forEach(chat => {
            this.subscribeToMessages(chat.uid);
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
    try {
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

        console.log('✅ Imagen subida exitosamente:', imageUrl);
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

      // TODO: Enviar push notification al cliente

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
    // TODO: Implementar en Fase 7
    console.log('Dialog de respuestas predefinidas - pendiente');
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
    // TODO: Implementar en Fase 5
    console.log('Finalizar chat:', chatId);
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

    return this.chatAdapter.toCardData(chat, unreadCount, isSelected);
  }

  /**
   * Track by para ngFor
   */
  trackByChatId(index: number, chat: FirebaseChatDocument): string {
    return chat.uid;
  }
}
