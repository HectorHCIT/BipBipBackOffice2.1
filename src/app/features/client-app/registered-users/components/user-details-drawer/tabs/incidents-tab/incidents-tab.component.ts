import { Component, ChangeDetectionStrategy, input, signal, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

import { RegisteredUsersService } from '../../../../services';
import { IncidentsResponse } from '../../../../models';

@Component({
  selector: 'app-incidents-tab',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incidents-tab.component.html',
  styleUrl: './incidents-tab.component.scss'
})
export class IncidentsTabComponent implements OnDestroy {
  readonly userId = input.required<number>();

  private readonly registeredUsersService = inject(RegisteredUsersService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly incidents = signal<IncidentsResponse | null>(null);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  private refreshSubscription?: Subscription;

  constructor() {
    // Load data when userId changes
    effect(() => {
      const id = this.userId();
      if (id) {
        this.loadIncidents();
      }
    });

    // Subscribe to refresh events
    this.refreshSubscription = this.registeredUsersService.refresh$.subscribe(() => {
      this.loadIncidents();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  private loadIncidents(): void {
    const customerId = this.userId();
    if (!customerId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.registeredUsersService
      .getCustomerIncidents(customerId, this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          this.incidents.set(response);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Error al cargar las incidencias del cliente');
          this.isLoading.set(false);
          console.error('Error loading customer incidents:', err);
        }
      });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    const page = (event.first ?? 0) / (event.rows ?? 10) + 1;
    const rows = event.rows ?? 10;

    this.currentPage.set(page);
    this.pageSize.set(rows);
    this.loadIncidents();
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    const statusMap: Record<string, 'success' | 'warn' | 'danger' | 'info'> = {
      'Resuelta': 'success',
      'En Proceso': 'info',
      'Pendiente': 'warn',
      'Cerrada': 'secondary' as any
    };
    return statusMap[status] ?? 'info';
  }
}
