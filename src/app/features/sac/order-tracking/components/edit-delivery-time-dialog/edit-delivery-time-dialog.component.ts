import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TrackOrderList } from '../../models';

@Component({
  selector: 'app-edit-delivery-time-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-delivery-time-dialog.component.html',
  styleUrl: './edit-delivery-time-dialog.component.scss'
})
export class EditDeliveryTimeDialogComponent {
  readonly dialogRef = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);

  readonly order: TrackOrderList = this.config.data.order;

  // Form fields
  readonly newTime = signal('');
  readonly selectedReason = signal<string | null>(null);

  // Motivos hardcodeados (como en el código viejo)
  readonly reasons = [
    'Ha pasado mucho tiempo',
    'Orden equivocada',
    'Driver se equivocó de dirección',
    'Retraso en preparación',
    'Problema con el producto',
    'Solicitud del cliente'
  ];

  /**
   * Guarda el nuevo tiempo de entrega
   */
  save(): void {
    if (!this.newTime() || !this.selectedReason()) {
      return;
    }

    this.dialogRef.close({
      numOrder: this.order.numOrder,
      newTime: this.newTime(),
      reason: this.selectedReason()
    });
  }

  /**
   * Cierra el diálogo sin guardar
   */
  cancel(): void {
    this.dialogRef.close();
  }
}
