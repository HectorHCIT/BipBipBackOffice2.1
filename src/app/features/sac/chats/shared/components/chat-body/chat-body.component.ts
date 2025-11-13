import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import {
  ChatMessageBlock,
  ChatMessageDisplay
} from '../../../sac-cliente/services/chat-adapter.service';
import { ChatInfo } from './chat-body.types';
import { TagModule } from 'primeng/tag';

/**
 * Componente para mostrar mensajes de chat
 *
 * Features:
 * - Mensajes agrupados por fecha
 * - Auto-scroll inteligente
 * - Botón flotante para ir al final
 * - Contador de mensajes no leídos
 * - Preview de imágenes
 */
@Component({
  selector: 'app-chat-body',
  standalone: true,
  imports: [CommonModule, ButtonModule, BadgeModule,TagModule],
  templateUrl: './chat-body.component.html',
  styleUrls: ['./chat-body.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatBodyComponent implements AfterViewInit, OnChanges, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  @Input() messageBlocks: ChatMessageBlock[] = [];
  @Input() chatInfo!: ChatInfo;
  @Input() loading = false;
  @Input() autoScroll = true;

  @Output() imageClick = new EventEmitter<string>();

  private shouldScrollToBottom = true;
  private previousMessageCount = 0;

  // Para el botón flotante
  showScrollButton = false;
  unreadCount = 0;

  /**
   * Obtiene la inicial para el avatar
   */
  getInitial(name: string): string {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  /**
   * Obtiene el color del avatar
   */
  getAvatarColor(): string {
    return '#F9FAFB';     // gray-50
  }

  /**
   * Obtiene el nombre para mostrar en el mensaje
   */
  getUserName(isFromCustomer: boolean): string {
    if (isFromCustomer) {
      return `${this.chatInfo.emisor} (${this.getUserRole(true)})`;
    }
    return `${this.chatInfo.receptor} (${this.getUserRole(false)})`;
  }

  /**
   * Obtiene el rol según el tipo de chat
   */
  getUserRole(isFromCustomer: boolean): string {
    const roles: Record<string, string> = {
      'sac-cliente': isFromCustomer ? 'Cliente' : 'SAC',
      'sac-driver': isFromCustomer ? 'Driver' : 'SAC',
      'cliente-driver': isFromCustomer ? 'Cliente' : 'Driver'
    };
    return roles[this.chatInfo.chatType] || '';
  }

  /**
   * Formatea la fecha para mostrar
   */
  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-HN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Maneja el click en una imagen
   */
  onImageClick(imageUrl: string): void {
    if (imageUrl) {
      this.imageClick.emit(imageUrl);
    }
  }

  /**
   * Trackby para el loop de bloques
   */
  trackByBlock(index: number, block: ChatMessageBlock): string {
    return block.date;
  }

  /**
   * Trackby para el loop de mensajes
   */
  trackByMessage(index: number, message: ChatMessageDisplay): string {
    return message.id || index.toString();
  }

  ngAfterViewInit(): void {
    // Scroll inicial cuando se carga el chat por primera vez
    setTimeout(() => {
      this.scrollToBottom();
    }, 200);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // SOLO detectar cambios en messageBlocks
    if (changes['messageBlocks'] && !changes['messageBlocks'].firstChange) {
      const currentMessages = this.getTotalMessageCount();
      const previousCount = this.previousMessageCount;

      // Solo hacer scroll si hay más mensajes que antes
      if (currentMessages > previousCount) {
        if (this.isUserNearBottom()) {
          // Marcar para hacer scroll después del render
          this.shouldScrollToBottom = true;
          this.unreadCount = 0; // Reset contador si estamos abajo
        } else {
          // Si no estamos abajo, incrementar contador de no leídos
          this.unreadCount += (currentMessages - previousCount);
        }
      }

      this.previousMessageCount = currentMessages;
    }
  }

  ngAfterViewChecked(): void {
    // Solo hacer scroll si está marcado Y si autoScroll está habilitado
    if (this.shouldScrollToBottom && this.autoScroll) {
      this.scrollToBottom();
      // Importante: resetear la bandera inmediatamente
      this.shouldScrollToBottom = false;
    }
  }

  /**
   * Hace scroll hasta el final del contenedor
   */
  private scrollToBottom(): void {
    try {
      if (this.scrollContainer?.nativeElement) {
        const element = this.scrollContainer.nativeElement;
        // Pequeño delay para asegurar que el DOM esté completamente actualizado
        setTimeout(() => {
          element.scrollTop = element.scrollHeight;
        }, 50);
      }
    } catch (err) {
      // Silenciar errores de scroll
    }
  }

  /**
   * Cuenta el total de mensajes en todos los bloques
   */
  private getTotalMessageCount(): number {
    let count = 0;
    if (this.messageBlocks && Array.isArray(this.messageBlocks)) {
      this.messageBlocks.forEach(block => {
        if (block.messages && Array.isArray(block.messages)) {
          count += block.messages.length;
        }
      });
    }
    return count;
  }

  /**
   * Verifica si el usuario está cerca del fondo del chat
   */
  private isUserNearBottom(): boolean {
    if (!this.scrollContainer?.nativeElement) return true;

    const element = this.scrollContainer.nativeElement;
    const threshold = 100; // Píxeles de tolerancia
    const position = element.scrollTop + element.offsetHeight;
    const height = element.scrollHeight;

    // true si está a menos de 100px del fondo
    return position >= height - threshold;
  }

  /**
   * Maneja el evento de scroll para mostrar/ocultar el botón flotante
   */
  onScroll(): void {
    if (!this.scrollContainer?.nativeElement) return;

    const element = this.scrollContainer.nativeElement;
    const threshold = 200; // Mostrar botón si estamos a más de 200px del fondo
    const position = element.scrollTop + element.offsetHeight;
    const height = element.scrollHeight;

    // Mostrar botón si NO estamos cerca del fondo
    this.showScrollButton = position < height - threshold;

    // Si llegamos al fondo, resetear contador
    if (this.isUserNearBottom()) {
      this.unreadCount = 0;
    }
  }

  /**
   * Scroll al fondo cuando se hace click en el botón flotante
   */
  scrollToBottomClick(): void {
    this.scrollToBottom();
    this.unreadCount = 0;
    this.showScrollButton = false;
  }
}
