import {
  Component,
  input,
  output,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ChatBox, ChatHistoryRecord } from '../../models';

interface GroupedMessage {
  date: string;
  messages: ChatBox[];
}

@Component({
  selector: 'app-chat-preview',
  standalone: true,
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    TagModule,
    ButtonModule
  ],
  templateUrl: './chat-preview.component.html',
  styleUrls: ['./chat-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatPreviewComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  // Inputs usando la nueva API
  readonly chat = input<ChatHistoryRecord | null>(null);

  // Outputs usando la nueva API
  readonly closed = output<void>();

  ngOnInit(): void {
    // Componente inicializado
  }

  // Computed signals
  readonly groupedMessages = computed(() => {
    const chatData = this.chat();
    if (!chatData?.chat) return [];

    const groups: GroupedMessage[] = [];
    const messagesByDate = new Map<string, ChatBox[]>();

    chatData.chat.forEach(message => {
      const date = this.getDateLabel(message.dateMessage);
      if (!messagesByDate.has(date)) {
        messagesByDate.set(date, []);
      }
      messagesByDate.get(date)?.push(message);
    });

    messagesByDate.forEach((messages, date) => {
      groups.push({ date, messages });
    });

    return groups;
  });

  readonly hasMessages = computed(() => {
    const chatData = this.chat();
    return chatData && chatData.chat && chatData.chat.length > 0;
  });

  readonly totalMessages = computed(() => {
    const chatData = this.chat();
    return chatData?.chat?.length || 0;
  });

  /**
   * Cierra el preview
   */
  close(): void {
    this.closed.emit();
  }

  /**
   * Obtiene el label de fecha (Hoy, Ayer, o fecha)
   */
  private getDateLabel(dateString: string): string {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.isSameDay(messageDate, today)) {
      return 'Hoy';
    } else if (this.isSameDay(messageDate, yesterday)) {
      return 'Ayer';
    } else {
      return messageDate.toLocaleDateString('es-HN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  }

  /**
   * Verifica si dos fechas son el mismo día
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Formatea la hora de un mensaje
   */
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-HN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtiene las clases CSS para el mensaje según quién lo envió
   */
  getMessageClasses(sendBy: string): string {
    const isAgent = sendBy === 'SAC';
    return isAgent
      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 self-start'
      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 self-end';
  }

  /**
   * Obtiene las clases del contenedor del mensaje
   */
  getMessageContainerClasses(sendBy: string): string {
    const isAgent = sendBy === 'SAC';
    return isAgent ? 'justify-start' : 'justify-end';
  }

  /**
   * Obtiene el severity del tag según el estado
   */
  getStatusSeverity(status?: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warn';
      case 'pending': return 'danger';
      default: return 'secondary';
    }
  }

  /**
   * Obtiene el label del estado
   */
  getStatusLabel(status?: string): string {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En Progreso';
      case 'pending': return 'Pendiente';
      default: return 'Sin Estado';
    }
  }

  /**
   * Obtiene las estrellas de rating
   */
  getRatingStars(rating?: number): string[] {
    if (!rating) return [];

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('pi-star-fill');
    }

    if (hasHalfStar) {
      stars.push('pi-star-half-fill');
    }

    while (stars.length < 5) {
      stars.push('pi-star');
    }

    return stars;
  }

  /**
   * Verifica si el mensaje contiene una imagen
   */
  hasImage(message: string): boolean {
    const imagePattern = /https?:\/\/[^\s,]+\.(jpg|jpeg|png|gif|webp|bmp|svg)/i;
    return imagePattern.test(message);
  }

  /**
   * Extrae la URL de la imagen del mensaje
   */
  extractImageUrl(message: string): string {
    const urlMatch = message.match(/https?:\/\/[^\s,]+\.(jpg|jpeg|png|gif|webp|bmp|svg)/i);
    return urlMatch ? urlMatch[0] : '';
  }

  /**
   * Obtiene el texto del mensaje sin la URL
   */
  getMessageText(message: string): string {
    if (this.hasImage(message)) {
      const textAfterUrl = message.replace(/https?:\/\/[^\s,]+\.(jpg|jpeg|png|gif|webp|bmp|svg)/i, '');
      return textAfterUrl.replace(/^,\s*/, '').trim();
    }
    return message;
  }

  /**
   * Maneja el error cuando una imagen no se puede cargar
   */
  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
}
