import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TiempoRealPipe } from '../../pipes';
import { ChatCardData } from '../../../sac-cliente/services/chat-adapter.service';

/**
 * Componente de tarjeta de chat
 *
 * Muestra un chat en la lista con avatar, información básica,
 * contador de no leídos y menú de acciones.
 */
@Component({
  selector: 'app-chat-card',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MenuModule,
    TiempoRealPipe
  ],
  templateUrl: './chat-card.component.html',
  styleUrls: ['./chat-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatCardComponent {
  @Input() data!: ChatCardData;
  @Input() isSelected = false;
  @Input() showMenu = true;
  @Input() showTakeButton = false;
  @Input() disableTakeButton = false;  // ✅ Nueva propiedad para deshabilitar botón "Tomar"
  @Input() disableFinalizeButton = false;  // ✅ Nueva propiedad para deshabilitar botón "Finalizar"

  @Output() cardClick = new EventEmitter<ChatCardData>();
  @Output() finalizarChat = new EventEmitter<string>();
  @Output() takeChat = new EventEmitter<string>();

  /**
   * Items del menú de acciones
   * NOTA: Inicializamos el array UNA SOLA VEZ para evitar problemas con PrimeNG Menu
   * El problema era que el getter se ejecutaba en cada detección de cambios,
   * creando nuevas funciones y causando que el menú necesite 2 clicks
   */
  readonly menuItems: MenuItem[] = [
    {
      label: 'Finalizar',
      icon: 'pi pi-times',
      command: () => this.onFinalizarClick(),
      styleClass: 'text-red-600 hover:bg-red-50'
    }
  ];

  /**
   * Obtiene la inicial del cliente
   */
  getInitial(): string {
    if (!this.data?.customerName) return '?';
    return this.data.customerName.charAt(0).toUpperCase();
  }

  /**
   * Color de avatar del cliente (gris claro uniforme)
   */
  getAvatarColor(): string {
    return '#E5E7EB'; // gray-200
  }

  /**
   * Obtiene la inicial del agente
   */
  getAgentInitial(): string {
    if (!this.data?.agentName) return '?';
    return this.data.agentName.charAt(0).toUpperCase();
  }

  /**
   * Color de avatar del agente (gris más oscuro para distinguirlo)
   */
  getAgentAvatarColor(): string {
    return '#D1D5DB'; // gray-300
  }

  /**
   * Icono del cliente
   */
  getCustomerIcon(): string {
    return 'pi pi-user';
  }

  /**
   * Icono del agente
   */
  getAgentIcon(): string {
    return 'pi pi-headphones';
  }

  /**
   * Genera el texto de ubicación según el diseño de Figma
   * Formato: HN / San Pedro de Sula, PH-02
   */
  getLocationText(): string {
    if (!this.data?.location) {
      return 'Sin ubicación';
    }

    const parts: string[] = [];

    // Usar el displayText que ya viene formateado: "HN/SPS"
    return this.data.location.displayText;
  }

  /**
   * Maneja el click en la card
   */
  onCardClick(): void {
    this.cardClick.emit(this.data);
  }

  /**
   * Maneja el click en finalizar chat
   */
  onFinalizarClick(): void {
    this.finalizarChat.emit(this.data.id);
  }

  /**
   * Maneja el click en tomar chat
   */
  onTakeClick(event: Event): void {
    event.stopPropagation();
    this.takeChat.emit(this.data.id);
  }

  /**
   * Determina las clases CSS de la card según su estado
   */
  getCardClasses(): string {
    const classes: string[] = ['chat-card'];

    if (this.isSelected) {
      classes.push('chat-card--selected');
    } else if (this.data.unreadCount > 0) {
      classes.push('chat-card--unread');
    }

    return classes.join(' ');
  }
}
