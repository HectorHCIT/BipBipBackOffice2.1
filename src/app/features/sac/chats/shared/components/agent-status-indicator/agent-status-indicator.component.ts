import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { AgentStatusService } from '../../services/agent-status.service';
import { SACUser, AgentStatus, StatusOption } from '../../models/agent-status.model';

/**
 * AgentStatusIndicatorComponent - Indicador y selector de estado del agente
 *
 * Features:
 * - ✅ Muestra avatar con iniciales del agente
 * - ✅ Dot indicator con color según estado
 * - ✅ Dropdown para cambiar estado (online/break/offline)
 * - ✅ Validación: bloquea cambio con chats activos
 * - ✅ Muestra nombre, email y contador de chats
 * - ✅ Responsive design
 * - ✅ Dark mode support
 */
@Component({
  selector: 'app-agent-status-indicator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule
  ],
  templateUrl: './agent-status-indicator.component.html',
  styleUrls: ['./agent-status-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentStatusIndicatorComponent implements OnInit {
  private readonly agentStatusService = inject(AgentStatusService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // 🔥 SIGNALS
  readonly agentData = signal<SACUser | null>(null);
  readonly selectedStatus = signal<AgentStatus>('offline');
  readonly isUpdating = signal(false);

  // 🔥 COMPUTED
  readonly initials = computed(() => {
    const name = this.agentData()?.name || '';
    if (!name) return '??';

    const names = name.split(' ');
    return names
      .map(n => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  });

  readonly avatarClass = computed(() => {
    const status = this.agentData()?.currentStatus || 'offline';
    return `agent-status__avatar--${status}`;
  });

  readonly statusDotClass = computed(() => {
    const status = this.agentData()?.currentStatus || 'offline';
    return `agent-status__dot--${status}`;
  });

  readonly selectedStatusLabel = computed(() => {
    const status = this.selectedStatus();
    return this.statusOptions.find(opt => opt.value === status)?.label || 'Offline';
  });

  readonly selectedStatusDotClass = computed(() => {
    const status = this.selectedStatus();
    return this.statusOptions.find(opt => opt.value === status)?.dotClass || 'status-dot--offline';
  });

  readonly canChangeStatus = computed(() => {
    const agent = this.agentData();
    if (!agent) return false;

    // Permite cambio si no hay chats activos O si no está online
    return agent.activeChatRooms === 0 || agent.currentStatus !== 'online';
  });

  // Status options for dropdown
  readonly statusOptions: StatusOption[] = [
    {
      label: 'Online',
      value: 'online',
      dotClass: 'status-dot--online',
      avatarClass: 'agent-status__avatar--online'
    },
    {
      label: 'Break',
      value: 'break',
      dotClass: 'status-dot--break',
      avatarClass: 'agent-status__avatar--break'
    },
    {
      label: 'Offline',
      value: 'offline',
      dotClass: 'status-dot--offline',
      avatarClass: 'agent-status__avatar--offline'
    }
  ];

  ngOnInit(): void {
    const userId = this.agentStatusService.getCurrentUserId();

    if (!userId) {
      console.error('[AgentStatusIndicator] No user ID found');
      return;
    }

    // Escuchar cambios en los datos del agente
    this.agentStatusService.getAgentData(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (agent) => {
          if (agent) {
            this.agentData.set(agent);
            this.selectedStatus.set(agent.currentStatus);
          }
        },
        error: (error) => {
          console.error('[AgentStatusIndicator] Error loading agent data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el estado del agente'
          });
        }
      });
  }

  /**
   * Maneja el cambio de estado
   */
  async onStatusChange(event: { value: AgentStatus }): Promise<void> {
    const newStatus = event.value;
    const agent = this.agentData();

    if (!agent) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener la información del agente'
      });
      return;
    }

    // Validar si puede cambiar el estado
    if (!this.canChangeStatus()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No se puede cambiar el estado',
        detail: 'Debes finalizar tus chats activos primero'
      });

      // Revertir selección
      this.selectedStatus.set(agent.currentStatus);
      return;
    }

    // Si el estado no cambió realmente, no hacer nada
    if (newStatus === agent.currentStatus) {
      return;
    }

    this.isUpdating.set(true);

    try {
      await this.agentStatusService.updateAgentStatus(
        agent.uid,
        newStatus,
        agent.activeChatRooms,
        agent.currentStatus
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `Tu estado ha sido cambiado a ${this.getStatusLabel(newStatus)}`
      });
    } catch (error) {
      console.error('[AgentStatusIndicator] Error updating status:', error);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'No se pudo actualizar el estado'
      });

      // Revertir selección
      this.selectedStatus.set(agent.currentStatus);
    } finally {
      this.isUpdating.set(false);
    }
  }

  /**
   * Obtiene la etiqueta traducida del estado
   */
  private getStatusLabel(status: AgentStatus): string {
    switch (status) {
      case 'online': return 'Online';
      case 'break': return 'Break';
      case 'offline': return 'Offline';
      default: return 'Desconocido';
    }
  }
}
