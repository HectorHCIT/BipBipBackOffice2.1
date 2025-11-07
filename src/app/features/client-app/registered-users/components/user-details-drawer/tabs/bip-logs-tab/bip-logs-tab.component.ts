import { Component, ChangeDetectionStrategy, input, signal, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

import { RegisteredUsersService } from '../../../../services';
import { BipTransactionsResponse } from '../../../../models';

@Component({
  selector: 'app-bip-logs-tab',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bip-logs-tab.component.html',
  styleUrl: './bip-logs-tab.component.scss'
})
export class BipLogsTabComponent implements OnDestroy {
  readonly userId = input.required<number>();

  private readonly registeredUsersService = inject(RegisteredUsersService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly transactions = signal<BipTransactionsResponse | null>(null);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  private refreshSubscription?: Subscription;

  constructor() {
    // Load data when userId changes
    effect(() => {
      const id = this.userId();
      if (id) {
        this.loadTransactions();
      }
    });

    // Subscribe to refresh events
    this.refreshSubscription = this.registeredUsersService.refresh$.subscribe(() => {
      this.loadTransactions();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  private loadTransactions(): void {
    const customerId = this.userId();
    if (!customerId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.registeredUsersService
      .getBipTransactions(customerId, this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          this.transactions.set(response);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Error al cargar las transacciones de Bips');
          this.isLoading.set(false);
          console.error('Error loading bip transactions:', err);
        }
      });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    const page = (event.first ?? 0) / (event.rows ?? 10) + 1;
    const rows = event.rows ?? 10;

    this.currentPage.set(page);
    this.pageSize.set(rows);
    this.loadTransactions();
  }
}
