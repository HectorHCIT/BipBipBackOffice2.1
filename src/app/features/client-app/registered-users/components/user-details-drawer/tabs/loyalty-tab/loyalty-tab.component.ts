import { Component, ChangeDetectionStrategy, input, signal, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

import { RegisteredUsersService } from '../../../../services';
import { CustomerLoyalty } from '../../../../models';

@Component({
  selector: 'app-loyalty-tab',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TagModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loyalty-tab.component.html',
  styleUrl: './loyalty-tab.component.scss'
})
export class LoyaltyTabComponent implements OnDestroy {
  readonly userId = input.required<number>();

  private readonly registeredUsersService = inject(RegisteredUsersService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly loyalty = signal<CustomerLoyalty | null>(null);

  private refreshSubscription?: Subscription;

  constructor() {
    // Load data when userId changes
    effect(() => {
      const id = this.userId();
      if (id) {
        this.loadLoyalty();
      }
    });

    // Subscribe to refresh events
    this.refreshSubscription = this.registeredUsersService.refresh$.subscribe(() => {
      this.loadLoyalty();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  private loadLoyalty(): void {
    const customerId = this.userId();
    if (!customerId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.registeredUsersService.getCustomerLoyalty(customerId).subscribe({
      next: (loyalty) => {
        this.loyalty.set(loyalty);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los datos de lealtad');
        this.isLoading.set(false);
        console.error('Error loading customer loyalty:', err);
      }
    });
  }
}
