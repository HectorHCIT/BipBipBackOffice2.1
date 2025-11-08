import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-complete-order-dialog',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-dialog
      [visible]="visible()"
      [header]="'Completar orden #' + orderNumber()"
      [modal]="true"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      styleClass="w-full max-w-md"
      (visibleChange)="onVisibleChange($event)"
    >
      <div class="space-y-4">
        <div class="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded">
          <div class="flex items-start gap-3">
            <i class="pi pi-exclamation-triangle text-yellow-600 text-xl mt-0.5"></i>
            <div>
              <h4 class="text-sm font-semibold text-yellow-800 mb-1">Confirmar completación</h4>
              <p class="text-sm text-yellow-700">
                ¿Está seguro de marcar esta orden como completada? Esta acción cambiará el estado de la orden.
              </p>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Detalles de la orden</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Número de orden:</span>
              <span class="font-medium text-gray-900">#{{ orderNumber() }}</span>
            </div>
            @if (customerName()) {
              <div class="flex justify-between">
                <span class="text-gray-600">Cliente:</span>
                <span class="font-medium text-gray-900">{{ customerName() }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <ng-template #footer>
        <div class="flex justify-end gap-2">
          <p-button
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            (onClick)="onCancel()"
            [disabled]="loading()"
          />
          <p-button
            label="Completar orden"
            severity="success"
            icon="pi pi-check"
            (onClick)="onConfirm()"
            [loading]="loading()"
          />
        </div>
      </ng-template>
    </p-dialog>
  `
})
export class CompleteOrderDialogComponent {
  // Inputs
  readonly visible = input.required<boolean>();
  readonly orderNumber = input.required<number>();
  readonly customerName = input<string | null>(null);
  readonly loading = input<boolean>(false);

  // Outputs
  readonly visibleChange = output<boolean>();
  readonly confirm = output<void>();

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}
