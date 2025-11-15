import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

import { OnlineUser, AgentStatus } from '../../models';

@Component({
  selector: 'app-agent-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './agent-status-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentStatusDialogComponent {
  // Inputs
  readonly visible = input.required<boolean>();
  readonly agent = input<OnlineUser | null>(null);

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly confirm = output<AgentStatus>();

  // State
  readonly selectedStatus = signal<AgentStatus>('online');

  // Opciones de estado disponibles
  readonly statusOptions: Array<{ value: AgentStatus; label: string; severity: string }> = [
    { value: 'online', label: 'Online', severity: 'success' },
    { value: 'offline', label: 'Offline', severity: 'danger' },
    { value: 'break', label: 'Break', severity: 'warn' }
  ];

  /**
   * Selecciona un nuevo estado
   */
  selectStatus(status: AgentStatus): void {
    this.selectedStatus.set(status);
  }

  /**
   * Obtiene la clase CSS según el estado
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'break':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  }

  /**
   * Confirma el cambio de estado
   */
  onConfirm(): void {
    this.confirm.emit(this.selectedStatus());
  }

  /**
   * Cierra el diálogo
   */
  onClose(): void {
    this.visibleChange.emit(false);
  }
}
