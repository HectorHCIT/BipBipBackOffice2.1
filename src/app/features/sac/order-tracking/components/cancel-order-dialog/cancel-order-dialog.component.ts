import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { TrackOrderList, CancelReason, CancelOrderRequest } from '../../models';
import { OrderTrackingService } from '../../services';

@Component({
  selector: 'app-cancel-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    CheckboxModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cancel-order-dialog.component.html',
  styleUrl: './cancel-order-dialog.component.scss'
})
export class CancelOrderDialogComponent implements OnInit {
  readonly dialogRef = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  readonly orderTrackingService = inject(OrderTrackingService);
  private readonly messageService = inject(MessageService);

  readonly order: TrackOrderList = this.config.data.order;

  // Form fields signals
  readonly selectedReasonId = signal<number | null>(null);
  readonly comment = signal('');
  readonly productProcessed = signal(true);
  readonly reasons = signal<CancelReason[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingReasons = signal(false);

  // Computed
  readonly characterCount = computed(() => this.comment().length);
  readonly remainingChars = computed(() => 200 - this.characterCount());
  readonly isOverLimit = computed(() => this.characterCount() > 200);
  readonly canSubmit = computed(() => {
    return this.selectedReasonId() !== null &&
           !this.isOverLimit() &&
           !this.isLoading();
  });

  ngOnInit(): void {
    this.loadCancelReasons();
  }

  /**
   * Carga los motivos de cancelación desde la API
   */
  loadCancelReasons(): void {
    this.isLoadingReasons.set(true);
    this.orderTrackingService.getCancelReasons().subscribe({
      next: (reasons) => {
        this.reasons.set(reasons);
        this.isLoadingReasons.set(false);
      },
      error: (error) => {
        console.error('Error al cargar motivos:', error);
        this.isLoadingReasons.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los motivos de cancelación'
        });
      }
    });
  }

  /**
   * Cancela la orden
   */
  cancelOrder(): void {
    if (!this.canSubmit()) {
      return;
    }

    this.isLoading.set(true);

    const requestData: CancelOrderRequest = {
      orderId: this.order.numOrder,
      reason: this.selectedReasonId()!,
      notes: this.comment(),
      productProcessed: this.productProcessed()
    };

    this.orderTrackingService.cancelOrder(requestData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Orden cancelada',
          detail: 'La orden ha sido cancelada exitosamente'
        });
        this.dialogRef.close({ success: true });
      },
      error: (error) => {
        console.error('Error al cancelar orden:', error);
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cancelar la orden'
        });
      }
    });
  }

  /**
   * Cierra el diálogo sin guardar
   */
  close(): void {
    this.dialogRef.close();
  }
}
