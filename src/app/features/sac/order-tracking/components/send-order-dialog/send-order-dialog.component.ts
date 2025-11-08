import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-send-order-dialog',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-dialog
      [visible]="visible()"
      [header]="'Enviar orden programada #' + orderNumber()"
      [modal]="true"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      styleClass="w-full max-w-md"
      (visibleChange)="onVisibleChange($event)"
    >
      <div class="space-y-4">
        <div class="border-l-4 border-blue-400 bg-blue-50 p-4 rounded">
          <div class="flex items-start gap-3">
            <i class="pi pi-info-circle text-blue-600 text-xl mt-0.5"></i>
            <div>
              <h4 class="text-sm font-semibold text-blue-800 mb-1">Enviar orden programada</h4>
              <p class="text-sm text-blue-700">
                Esta orden está programada. Al enviarla, se activará inmediatamente y estará disponible para asignación de driver.
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
            @if (scheduledTime()) {
              <div class="flex justify-between">
                <span class="text-gray-600">Hora programada:</span>
                <span class="font-medium text-gray-900">{{ scheduledTime() }}</span>
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
            label="Enviar ahora"
            severity="primary"
            icon="pi pi-send"
            (onClick)="onConfirm()"
            [loading]="loading()"
          />
        </div>
      </ng-template>
    </p-dialog>
  `
})
export class SendOrderDialogComponent {
  // Inputs
  readonly visible = input.required<boolean>();
  readonly orderNumber = input.required<number>();
  readonly customerName = input<string | null>(null);
  readonly scheduledTime = input<string | null>(null);
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
