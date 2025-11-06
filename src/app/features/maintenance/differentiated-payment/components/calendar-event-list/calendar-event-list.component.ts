import { Component, ChangeDetectionStrategy, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { GlobalDataService } from '@core/services/global-data.service';
import { type Payment } from '../../models/payment.model';

/**
 * CalendarEventListComponent
 *
 * List view of payments grouped by day
 * Optimized for mobile devices
 */
@Component({
  selector: 'app-calendar-event-list',
  imports: [CommonModule, CardModule, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      @if (paymentsGroupedByDay().length === 0) {
        <div class="text-center py-12 text-gray-500">
          <i class="pi pi-calendar text-4xl mb-4"></i>
          <p>No hay pagos programados para mostrar</p>
        </div>
      }

      @for (group of paymentsGroupedByDay(); track group.date) {
        <div class="payment-group">
          <!-- Date Header -->
          <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <i class="pi pi-calendar"></i>
            {{ formatDate(group.date) }}
          </h3>

          <!-- Payment Cards -->
          <div class="space-y-2">
            @for (payment of group.payments; track payment.id) {
              <p-card
                class="payment-card cursor-pointer hover:shadow-md transition-shadow"
                (click)="onPaymentClick(payment)"
              >
                <div class="flex items-center justify-between">
                  <!-- Payment Info -->
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <!-- Status Dot -->
                      <div
                        class="status-dot"
                        [style.background-color]="getPaymentColor(payment)"
                      ></div>

                      <!-- Scale Value -->
                      <div class="font-semibold text-lg">
                        Escala: {{ payment.launchScaleValue }}
                      </div>
                    </div>

                    <!-- Time -->
                    <div class="text-sm text-gray-600 mb-2">
                      <i class="pi pi-clock mr-1"></i>
                      {{ formatTime(payment.launchDate) }}
                    </div>

                    <!-- Cities -->
                    <div class="flex flex-wrap gap-1">
                      @for (cityId of payment.cities; track cityId) {
                        <p-tag
                          [value]="getCityName(cityId)"
                          [style]="{
                            'background-color': getCityColor(cityId),
                            'color': '#ffffff'
                          }"
                        />
                      }
                    </div>
                  </div>

                  <!-- Status Badge -->
                  <div class="ml-4">
                    @if (payment.scheduled) {
                      <p-tag value="Programado" severity="success" />
                    } @else {
                      <p-tag value="Pendiente" severity="warn" />
                    }
                  </div>
                </div>
              </p-card>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .payment-group {
      margin-bottom: 2rem;
    }

    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    :host ::ng-deep .payment-card .p-card {
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    :host ::ng-deep .payment-card:hover .p-card {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    :host ::ng-deep .p-card-body {
      padding: 1rem;
    }
  `]
})
export class CalendarEventListComponent {
  private readonly globalData = inject(GlobalDataService);

  // Inputs
  readonly payments = input.required<Payment[]>();
  readonly cityColors = input.required<Map<number, string>>();

  // Outputs
  readonly paymentClick = output<Payment>();

  /**
   * Group payments by day
   */
  readonly paymentsGroupedByDay = computed(() => {
    const grouped = new Map<string, Payment[]>();

    this.payments().forEach(payment => {
      const dateKey = payment.launchDate.split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(payment);
    });

    // Convert to array and sort by date
    return Array.from(grouped.entries())
      .map(([date, payments]) => ({
        date,
        payments: payments.sort((a, b) =>
          new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime()
        )
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  });

  /**
   * Format date for display
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Format time for display
   */
  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get color for payment (from first city)
   */
  getPaymentColor(payment: Payment): string {
    const firstCityId = payment.cities[0];
    return this.cityColors().get(firstCityId) || '#fb0021';
  }

  /**
   * Get city name
   */
  getCityName(cityId: number): string {
    const city = this.globalData.cities().find(c => c.id === cityId);
    return city?.name || 'Desconocida';
  }

  /**
   * Get city color
   */
  getCityColor(cityId: number): string {
    return this.cityColors().get(cityId) || '#fb0021';
  }

  /**
   * Handle payment click
   */
  onPaymentClick(payment: Payment): void {
    this.paymentClick.emit(payment);
  }
}
