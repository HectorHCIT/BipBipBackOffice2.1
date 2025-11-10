import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { PaymentMethodsService } from '../../services';

@Component({
  selector: 'app-payment-methods-page',
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    CardModule,
    ProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-methods-page.component.html',
  styleUrl: './payment-methods-page.component.scss'
})
export class PaymentMethodsPageComponent implements OnInit {
  private readonly paymentMethodsService = inject(PaymentMethodsService);

  // Expose service signals to template
  readonly paymentMethods = this.paymentMethodsService.paymentMethods;
  readonly isLoading = this.paymentMethodsService.isLoading;

  ngOnInit(): void {
    this.paymentMethodsService.loadPaymentMethods();
  }

  /**
   * Get severity for p-tag based on payment method status
   */
  getStatusSeverity(isActive: boolean): 'success' | 'secondary' {
    return isActive ? 'success' : 'secondary';
  }

  /**
   * Get status label
   */
  getStatusLabel(isActive: boolean): string {
    return isActive ? 'ACTIVO' : 'INACTIVO';
  }
}
