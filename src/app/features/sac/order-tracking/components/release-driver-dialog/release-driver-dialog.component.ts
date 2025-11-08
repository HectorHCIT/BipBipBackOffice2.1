import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ReAssignDriver } from '../../models';
import { OrderTrackingService } from '../../services';

@Component({
  selector: 'app-release-driver-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-4 p-2">
      <!-- Header -->
      <div class="mb-2">
        <h2 class="text-xl font-bold text-gray-800">Liberar Driver</h2>
        <p class="text-sm text-gray-600 mt-1">Orden #{{ orderId }}</p>
      </div>

      <!-- Driver Info -->
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-sm font-semibold text-gray-700 mb-1">Driver actual:</p>
        <p class="text-base font-medium text-gray-900">{{ driverName }}</p>
      </div>

      <!-- Warning message -->
      <div class="border border-orange-200 bg-orange-50 rounded-lg p-3 text-sm text-orange-800">
        <div class="flex gap-2">
          <i class="pi pi-exclamation-triangle mt-0.5"></i>
          <div>
            <p class="font-semibold mb-1">¿Estás seguro de liberar este driver?</p>
            <p>El driver será desasignado de esta orden y la orden quedará sin driver hasta que se asigne uno nuevo.</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row sm:justify-end gap-2 mt-2">
        <p-button
          label="Cancelar"
          [outlined]="true"
          severity="secondary"
          (onClick)="close()"
          [disabled]="isSubmitting()"
          styleClass="w-full sm:w-auto"
        />
        <p-button
          label="Liberar Driver"
          icon="pi pi-times"
          severity="danger"
          [loading]="isSubmitting()"
          (onClick)="submit()"
          styleClass="w-full sm:w-auto"
        />
      </div>
    </div>
  `
})
export class ReleaseDriverDialogComponent {
  readonly dialogRef = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  readonly orderTrackingService = inject(OrderTrackingService);
  private readonly messageService = inject(MessageService);

  readonly orderId: number = this.config.data.orderId;
  readonly driverId: number = this.config.data.driverId;
  readonly driverName: string = this.config.data.driverName;

  readonly isSubmitting = signal(false);

  /**
   * Libera el driver de la orden
   */
  submit(): void {
    this.isSubmitting.set(true);

    const data: ReAssignDriver = {
      orderId: this.orderId,
      driverId: this.driverId,
      comments: ''
    };

    this.orderTrackingService.releaseDriver(data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Driver liberado',
          detail: 'El driver ha sido liberado exitosamente'
        });
        this.dialogRef.close({ success: true });
      },
      error: (error) => {
        console.error('Error al liberar driver:', error);
        this.isSubmitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo liberar el driver'
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
