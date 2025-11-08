import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DataService } from '@core/services/data.service';
import { ScheduledOrder } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ScheduledOrderService {
  private readonly dataService = inject(DataService);

  // State signals
  readonly scheduledOrders = signal<ScheduledOrder[]>([]);
  readonly isLoading = signal(false);

  // Computed signals
  readonly hasOrders = computed(() => this.scheduledOrders().length > 0);
  readonly orderCount = computed(() => this.scheduledOrders().length);

  /**
   * Obtiene todas las órdenes programadas
   */
  getScheduledOrders(): Observable<ScheduledOrder[]> {
    this.isLoading.set(true);
    return this.dataService.get$<ScheduledOrder[]>('Customer/ScheduleOrders').pipe(
      tap({
        next: (orders) => {
          this.scheduledOrders.set(orders);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * Limpia el estado del servicio
   */
  clearState(): void {
    this.scheduledOrders.set([]);
    this.isLoading.set(false);
  }
}
