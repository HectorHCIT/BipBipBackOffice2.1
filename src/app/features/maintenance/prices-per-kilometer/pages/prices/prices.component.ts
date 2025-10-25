import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PriceService } from '../../services/price.service';
import type { PriceList } from '../../models/price.model';
import { AuthService } from '@core/services/auth.service';

// Dialogs
import { ResetPricesDialogComponent } from '../../components/reset-prices-dialog/reset-prices-dialog.component';
import { DifferentiatedPaymentDialogComponent } from '../../components/differentiated-payment-dialog/differentiated-payment-dialog.component';
import { ExtraordinaryPaymentDialogComponent } from '../../components/extraordinary-payment-dialog/extraordinary-payment-dialog.component';

/**
 * PricesComponent - Gestión de Precios por Kilómetro
 *
 * Features:
 * ✅ Accordion con lista de precios por ciudad/zona
 * ✅ Tabla de escalas de precios
 * ✅ Diálogos para: Resetear Precios, Pago Diferenciado, Pago Extraordinario
 * ✅ Control de permisos por rol (Admin)
 */
@Component({
  selector: 'app-prices',
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    TagModule,
    CardModule,
    DialogModule,
    ToastModule,
    ResetPricesDialogComponent,
    DifferentiatedPaymentDialogComponent,
    ExtraordinaryPaymentDialogComponent
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Precios por Kilómetro (Delivery's)
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gestión de escalas de precios para entregas por kilómetro
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mb-6 flex-wrap">
        <p-button
          label="Resetear Precios"
          icon="pi pi-refresh"
          severity="contrast"
          [outlined]="true"
          (onClick)="openResetPricesDialog()"
        />
        @if (isAdmin()) {
          <p-button
            label="Pago Diferenciado"
            icon="pi pi-dollar"
            severity="info"
            [outlined]="true"
            (onClick)="openDifferentiatedPaymentDialog()"
          />
        }
        <p-button
          label="Pago Extraordinario"
          icon="pi pi-star"
          severity="success"
          [outlined]="true"
          (onClick)="openExtraordinaryPaymentDialog()"
        />
      </div>

      <!-- Loading -->
      @if (priceService.isLoading()) {
        <div class="flex justify-center items-center py-12">
          <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
        </div>
      }

      <!-- Price List - Using Cards with Collapsible Content -->
      @if (!priceService.isLoading()) {
        <div class="space-y-4 mb-4">
          @for (priceItem of priceService.prices(); track $index) {
            <p-card styleClass="shadow-sm">
              <!-- Card Header with Toggle -->
              <ng-template #header>
                <div
                  class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  (click)="priceService.toggleAccordion($index)"
                >
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ priceItem.label }}
                  </h3>
                  <i
                    class="pi transition-transform duration-200"
                    [class.pi-chevron-down]="!priceItem.isOpen"
                    [class.pi-chevron-up]="priceItem.isOpen"
                  ></i>
                </div>
              </ng-template>

              <!-- Collapsible Table Content -->
              @if (priceItem.isOpen) {
                <p-table
                  [value]="priceItem.scales"
                  [tableStyle]="{ 'min-width': '50rem' }"
                  styleClass="p-datatable-sm"
                >
                  <ng-template #header>
                    <tr>
                      <th class="text-left">Rango de KM</th>
                      <th class="text-left">Cobro al Cliente</th>
                      <th class="text-left">Pago al Repartidor</th>
                    </tr>
                  </ng-template>

                  <ng-template #body let-scale>
                    <tr>
                      <!-- Column 1: KM Range -->
                      <td>
                        <span class="font-medium">
                          {{ scale.kmminimun }} - {{ scale.kmmaximum }} km
                        </span>
                      </td>

                      <!-- Column 2: Customer Charge -->
                      <td>
                        <div class="flex items-center gap-2">
                          <span class="font-semibold text-lg">
                            {{ scale.customerDeliveryCharge | currency:'L. ':'symbol':'1.2-2' }}
                          </span>
                          @if (scale.customerSpecialFee) {
                            <p-tag
                              [value]="formatCurrency(scale.customerSpecialFee)"
                              severity="success"
                              styleClass="font-semibold"
                            />
                          }
                        </div>
                      </td>

                      <!-- Column 3: Driver Payment -->
                      <td>
                        <div class="flex items-center gap-2">
                          <span class="font-semibold text-lg">
                            {{ scale.paymentAmountDelivery | currency:'L. ':'symbol':'1.2-2' }}
                          </span>
                          @if (scale.driverSpecialFee) {
                            <p-tag
                              [value]="formatCurrency(scale.driverSpecialFee)"
                              severity="success"
                              styleClass="font-semibold"
                            />
                          }
                        </div>
                      </td>
                    </tr>
                  </ng-template>

                  <ng-template #emptymessage>
                    <tr>
                      <td colspan="3" class="text-center py-8 text-gray-500">
                        <i class="pi pi-inbox text-4xl mb-3 block"></i>
                        <p>No hay escalas de precios configuradas</p>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              }
            </p-card>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!priceService.isLoading() && priceService.prices().length === 0) {
        <div class="text-center py-12">
          <i class="pi pi-inbox text-6xl text-gray-400 mb-4 block"></i>
          <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No hay precios configurados
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Aún no se han definido escalas de precios para ninguna ciudad
          </p>
        </div>
      }

      <!-- Toast for notifications -->
      <p-toast />

      <!-- Dialogs -->
      <!-- Reset Prices Dialog -->
      <p-dialog
        [(visible)]="showResetDialog"
        header="Resetear Precios"
        [modal]="true"
        [dismissableMask]="true"
        [style]="{ width: '500px' }"
        (onHide)="onResetDialogClose()"
      >
        <app-reset-prices-dialog
          (onCancel)="closeResetDialog()"
          (onSuccess)="onResetSuccess()"
        />
      </p-dialog>

      <!-- Differentiated Payment Dialog -->
      <p-dialog
        [(visible)]="showDifferentiatedDialog"
        header="Pago Diferenciado"
        [modal]="true"
        [dismissableMask]="true"
        [style]="{ width: '550px' }"
        (onHide)="onDifferentiatedDialogClose()"
      >
        <app-differentiated-payment-dialog
          (onCancel)="closeDifferentiatedDialog()"
          (onSuccess)="onDifferentiatedSuccess()"
        />
      </p-dialog>

      <!-- Extraordinary Payment Dialog -->
      <p-dialog
        [(visible)]="showExtraordinaryDialog"
        header="Pago Extraordinario"
        [modal]="true"
        [dismissableMask]="true"
        [style]="{ width: '550px' }"
        (onHide)="onExtraordinaryDialogClose()"
      >
        <app-extraordinary-payment-dialog
          (onCancel)="closeExtraordinaryDialog()"
          (onSuccess)="onExtraordinarySuccess()"
        />
      </p-dialog>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-card-header {
        padding: 0;
        border-bottom: none;
      }

      .p-card-body {
        padding: 0;
      }

      .p-tag {
        font-size: 0.875rem;
        padding: 0.375rem 0.75rem;
      }

      .cursor-pointer {
        cursor: pointer;
      }
    }
  `]
})
export class PricesComponent implements OnInit {
  readonly priceService = inject(PriceService);
  private readonly authService = inject(AuthService);

  // Dialog visibility signals
  showResetDialog = false;
  showDifferentiatedDialog = false;
  showExtraordinaryDialog = false;

  ngOnInit(): void {
    this.loadPrices();
  }

  loadPrices(): void {
    this.priceService.getPrices().subscribe({
      error: (error) => {
        console.error('Error cargando precios:', error);
      }
    });
  }

  isAdmin(): boolean {
    const user = this.authService.currentUser();
    return user?.rolName === 'Administrador';
  }

  formatCurrency(value: number): string {
    return `L. ${value.toFixed(2)}`;
  }

  // Dialog open handlers
  openResetPricesDialog(): void {
    this.showResetDialog = true;
  }

  openDifferentiatedPaymentDialog(): void {
    this.showDifferentiatedDialog = true;
  }

  openExtraordinaryPaymentDialog(): void {
    this.showExtraordinaryDialog = true;
  }

  // Dialog close handlers
  closeResetDialog(): void {
    this.showResetDialog = false;
  }

  closeDifferentiatedDialog(): void {
    this.showDifferentiatedDialog = false;
  }

  closeExtraordinaryDialog(): void {
    this.showExtraordinaryDialog = false;
  }

  // Dialog success handlers
  onResetSuccess(): void {
    this.showResetDialog = false;
    this.loadPrices(); // Reload prices after reset
  }

  onDifferentiatedSuccess(): void {
    this.showDifferentiatedDialog = false;
    this.loadPrices(); // Reload prices after update
  }

  onExtraordinarySuccess(): void {
    this.showExtraordinaryDialog = false;
    this.loadPrices(); // Reload prices after update
  }

  // Dialog hide handlers (when clicking outside)
  onResetDialogClose(): void {
    // Optional: cleanup if needed
  }

  onDifferentiatedDialogClose(): void {
    // Optional: cleanup if needed
  }

  onExtraordinaryDialogClose(): void {
    // Optional: cleanup if needed
  }
}
