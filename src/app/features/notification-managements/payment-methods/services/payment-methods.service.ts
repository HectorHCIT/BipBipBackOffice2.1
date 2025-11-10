import { Injectable, signal, inject } from '@angular/core';
import { DataService } from '@core/services/data.service';
import { PaymentMethod } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {
  private readonly dataService = inject(DataService);

  // State
  private readonly _paymentMethods = signal<PaymentMethod[]>([]);
  private readonly _isLoading = signal(false);

  // Readonly signals
  readonly paymentMethods = this._paymentMethods.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  /**
   * Load payment methods from API
   */
  loadPaymentMethods(): void {
    this._isLoading.set(true);
    this.dataService
      .get$<PaymentMethod[]>('Customer/PaymentMethods')
      .subscribe({
        next: (data) => {
          this._paymentMethods.set(data);
          this._isLoading.set(false);
        },
        error: (error: unknown) => {
          console.error('Error loading payment methods:', error);
          this._paymentMethods.set([]);
          this._isLoading.set(false);
        }
      });
  }
}
