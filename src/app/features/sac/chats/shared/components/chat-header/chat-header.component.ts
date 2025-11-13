import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TiempoRealPipe } from '../../pipes';
import { ChatCardData } from '../../../sac-cliente/services/chat-adapter.service';

/**
 * Componente de cabecera de chat
 *
 * Muestra información del chat activo con avatares superpuestos,
 * información de cliente/agente, orden, tiempo transcurrido y ubicación.
 * Diseño basado en Figma: node-id=1777-135995
 */
@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, TiempoRealPipe],
  templateUrl: './chat-header.component.html',
  styleUrls: ['./chat-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatHeaderComponent {
  @Input() data!: ChatCardData;
  @Input() showCloseButton = false; // Por defecto no se muestra

  @Output() closeChat = new EventEmitter<void>();
  @Output() reportsClick = new EventEmitter<void>();

  /**
   * Obtiene la inicial del cliente
   */
  getInitial(): string {
    if (!this.data?.customerName) return '?';
    return this.data.customerName.charAt(0).toUpperCase();
  }

  /**
   * Obtiene la inicial del agente
   */
  getAgentInitial(): string {
    if (!this.data?.agentName) return '?';
    return this.data.agentName.charAt(0).toUpperCase();
  }

  /**
   * Color de avatar del cliente (gris claro)
   */
  getAvatarColor(): string {
    return '#E5E7EB'; // gray-200
  }

  /**
   * Color de avatar del agente (gris más oscuro)
   */
  getAgentAvatarColor(): string {
    return '#D1D5DB'; // gray-300
  }

  /**
   * Genera el texto de ubicación
   * Formato: "HN/SPS"
   */
  getLocationText(): string {
    return this.data?.location?.displayText || '';
  }

  /**
   * Genera el texto de reportes
   * TODO: Implementar contador real de reportes
   */
  getReportsText(): string {
    const count = 2; // TODO: obtener de data
    return `${count} Reportes`;
  }

  /**
   * Maneja el click en el botón de reportes
   */
  onReportsClick(): void {
    this.reportsClick.emit();
  }

  /**
   * Maneja el click en cerrar chat
   */
  onCloseClick(): void {
    this.closeChat.emit();
  }
}
