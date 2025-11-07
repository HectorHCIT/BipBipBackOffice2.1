import { Component, ChangeDetectionStrategy, input, signal, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

import { RegisteredUsersService } from '../../../../services';
import { CustomerOrdersResponse } from '../../../../models';

@Component({
  selector: 'app-orders-tab',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orders-tab.component.html',
  styleUrl: './orders-tab.component.scss'
})
export class OrdersTabComponent implements OnDestroy {
  readonly userId = input.required<number>();

  private readonly registeredUsersService = inject(RegisteredUsersService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly orders = signal<CustomerOrdersResponse | null>(null);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  private refreshSubscription?: Subscription;

  constructor() {
    // Load data when userId changes
    effect(() => {
      const id = this.userId();
      if (id) {
        this.loadOrders();
      }
    });

    // Subscribe to refresh events
    this.refreshSubscription = this.registeredUsersService.refresh$.subscribe(() => {
      this.loadOrders();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  private loadOrders(): void {
    const customerId = this.userId();
    if (!customerId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.registeredUsersService
      .getCustomerOrders(customerId, this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          this.orders.set(response);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Error al cargar las órdenes del cliente');
          this.isLoading.set(false);
          console.error('Error loading customer orders:', err);
        }
      });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    const page = (event.first ?? 0) / (event.rows ?? 10) + 1;
    const rows = event.rows ?? 10;

    this.currentPage.set(page);
    this.pageSize.set(rows);
    this.loadOrders();
  }
}
