import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { CancelRequest } from '../../models';

@Component({
  selector: 'app-cancellation-requests-table',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    BadgeModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cancellation-requests-table.component.html',
  styleUrl: './cancellation-requests-table.component.scss'
})
export class CancellationRequestsTableComponent {
  // Inputs
  readonly cancelRequests = input.required<CancelRequest[]>();

  // Outputs
  readonly approveRequest = output<CancelRequest>();
  readonly denyRequest = output<CancelRequest>();

  // Computed
  readonly isEmpty = computed(() => this.cancelRequests().length === 0);

  /**
   * Obtiene el severity del badge según el estado
   */
  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'APROBADA' || statusUpper === 'APPROVED') return 'success';
    if (statusUpper === 'RECHAZADA' || statusUpper === 'REJECTED') return 'danger';
    if (statusUpper === 'PENDIENTE' || statusUpper === 'PENDING') return 'warn';
    return 'info';
  }

  /**
   * Verifica si la solicitud está pendiente
   */
  isPending(status: string): boolean {
    const statusUpper = status.toUpperCase();
    return statusUpper === 'PENDIENTE' || statusUpper === 'PENDING';
  }

  /**
   * Handler para aprobar solicitud
   */
  onApproveRequest(request: CancelRequest): void {
    this.approveRequest.emit(request);
  }

  /**
   * Handler para denegar solicitud
   */
  onDenyRequest(request: CancelRequest): void {
    this.denyRequest.emit(request);
  }
}
