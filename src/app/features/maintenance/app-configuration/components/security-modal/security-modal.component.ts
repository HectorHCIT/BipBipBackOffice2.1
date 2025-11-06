import { Component, ChangeDetectionStrategy, signal, input, output, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

/**
 * SecurityModalComponent
 *
 * Modal de confirmación con código de seguridad aleatorio
 * Usado para confirmar cambios críticos en configuraciones de app
 */
@Component({
  selector: 'app-security-modal',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-dialog
      [(visible)]="visibleModel"
      (visibleChange)="visibleChange.emit($event)"
      header="Confirmar Cambios"
      [modal]="true"
      [closable]="false"
      [style]="{ width: '500px' }"
    >
      <!-- Warning Message -->
      <div class="mb-6">
        <div class="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <i class="pi pi-exclamation-triangle text-red-600 text-2xl"></i>
          <div>
            <h3 class="font-bold text-red-900 mb-1">Advertencia</h3>
            <p class="text-sm text-red-800">
              Estos cambios afectarán directamente la aplicación cliente.
              Por favor, confirma que deseas continuar.
            </p>
          </div>
        </div>
      </div>

      <!-- Security Code Display -->
      <div class="mb-4">
        <p class="text-sm text-gray-700 mb-2 font-semibold">
          Por favor, ingresa el siguiente código de seguridad para confirmar:
        </p>
        <div class="bg-gray-100 p-4 rounded-lg mb-4">
          <p class="text-xs text-gray-500 mb-1">Código de seguridad:</p>
          <p class="text-3xl font-mono font-bold text-center tracking-widest text-gray-800">
            {{ securityCode() }}
          </p>
        </div>
      </div>

      <!-- Input for Code -->
      <div class="mb-6">
        <label for="codeInput" class="block text-sm font-medium text-gray-700 mb-2">
          Ingresa el código:
        </label>
        <div class="relative">
          <input
            pInputText
            id="codeInput"
            [(ngModel)]="userInput"
            (ngModelChange)="onInputChange()"
            [maxlength]="5"
            placeholder="Ingresa el código"
            class="w-full text-center text-2xl font-mono tracking-widest uppercase"
            [class.border-green-500]="isCodeCorrect()"
            [class.border-red-500]="userInput.length > 0 && !isCodeCorrect()"
            autocomplete="off"
          />
          @if (userInput.length > 0) {
            <div class="absolute right-3 top-1/2 -translate-y-1/2">
              @if (isCodeCorrect()) {
                <i class="pi pi-check-circle text-green-600 text-xl"></i>
              } @else {
                <i class="pi pi-times-circle text-red-600 text-xl"></i>
              }
            </div>
          }
        </div>
        @if (userInput.length > 0 && !isCodeCorrect()) {
          <small class="text-red-600 mt-1 block">El código no coincide</small>
        }
      </div>

      <!-- Action Buttons -->
      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-3">
          <p-button
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            (onClick)="onCancel()"
          />
          <p-button
            label="Confirmar Cambios"
            severity="danger"
            [disabled]="!isCodeCorrect()"
            (onClick)="onConfirm()"
          />
        </div>
      </ng-template>
    </p-dialog>
  `
})
export class SecurityModalComponent {
  // Inputs
  readonly visible = input.required<boolean>();
  readonly securityCode = input.required<string>();

  // Outputs
  readonly onConfirmChanges = output<void>();
  readonly onCancelChanges = output<void>();
  readonly visibleChange = output<boolean>();

  // Local state
  userInput = '';
  visibleModel = false;

  readonly isCodeCorrect = computed(() => {
    return this.userInput.toUpperCase() === this.securityCode().toUpperCase();
  });

  constructor() {
    // Sync visible input with local visibleModel
    effect(() => {
      this.visibleModel = this.visible();
    });
  }

  /**
   * Handle input change - force uppercase
   */
  onInputChange(): void {
    this.userInput = this.userInput.toUpperCase();
  }

  /**
   * Handle confirm
   */
  onConfirm(): void {
    if (this.isCodeCorrect()) {
      this.onConfirmChanges.emit();
      this.userInput = '';
    }
  }

  /**
   * Handle cancel
   */
  onCancel(): void {
    this.onCancelChanges.emit();
    this.userInput = '';
  }
}
