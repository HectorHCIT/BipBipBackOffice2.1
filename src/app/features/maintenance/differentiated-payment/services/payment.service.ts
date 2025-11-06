import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import { type Payment, type CreatePaymentDto } from '../models/payment.model';

/**
 * PaymentService
 *
 * Service for managing differentiated payments (scheduled payment scales)
 * Handles CRUD operations and state management with signals
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly dataService = inject(DataService);
  private readonly baseUrl = 'Restaurant/scales/schedule';

  // State signals
  readonly payments = signal<Payment[]>([]);
  readonly isLoading = signal(false);

  /**
   * Get scheduled payments for date range
   */
  getPayments(startDate: string, endDate: string): Observable<Payment[]> {
    this.isLoading.set(true);

    const params = {
      startDate,
      endDate
    };

    return this.dataService.get$<Payment[]>(this.baseUrl, params).pipe(
      tap(payments => {
        this.payments.set(payments);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Create new scheduled payment
   */
  create(dto: CreatePaymentDto): Observable<Payment> {
    return this.dataService.post$<Payment>(this.baseUrl, dto).pipe(
      tap(payment => {
        // Add to local state
        this.payments.update(list => [...list, payment]);
      })
    );
  }

  /**
   * Update existing payment
   */
  update(id: number, dto: CreatePaymentDto): Observable<Payment> {
    return this.dataService.put$<Payment>(`${this.baseUrl}/${id}`, dto).pipe(
      tap(payment => {
        // Update in local state
        this.payments.update(list =>
          list.map(p => (p.id === id ? payment : p))
        );
      })
    );
  }

  /**
   * Delete payment
   */
  delete(id: number): Observable<void> {
    const params = { idSchedule: id };

    return this.dataService.delete$<void>(this.baseUrl, params).pipe(
      tap(() => {
        // Remove from local state
        this.payments.update(list => list.filter(p => p.id !== id));
      })
    );
  }

  /**
   * Clear payments state
   */
  clearPayments(): void {
    this.payments.set([]);
  }
}
