import { Component, ChangeDetectionStrategy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';

import { NotificationService } from '../../services/notification.service';
import { DataPush, PushTypeEnum } from '../../models';

interface FilterOptions {
  search: string;
  type: PushTypeEnum | 'all';
  status: 'all' | 'processed' | 'pending';
  dateFrom: Date | null;
  dateTo: Date | null;
}

@Component({
  selector: 'app-notification-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TagModule,
    CardModule,
    MessageModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-history.component.html',
  styleUrl: './notification-history.component.scss'
})
export class NotificationHistoryComponent {
  private readonly notificationService = inject(NotificationService);

  // State
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly totalRecords = signal(0);
  readonly selectedNotifications = signal<DataPush[]>([]);

  // Filters
  readonly filters = signal<FilterOptions>({
    search: '',
    type: 'all',
    status: 'all',
    dateFrom: null,
    dateTo: null
  });

  // Service signals
  readonly historyData = this.notificationService.historyData;
  readonly isLoading = this.notificationService.isLoadingHistory;

  // Computed
  readonly notifications = computed(() => this.historyData().data);

  // Computed
  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return f.search !== '' ||
           f.type !== 'all' ||
           f.status !== 'all' ||
           f.dateFrom !== null ||
           f.dateTo !== null;
  });

  // Filter options
  readonly typeOptions = [
    { label: 'Todos los tipos', value: 'all' },
    { label: 'Alerta', value: PushTypeEnum.ALERT },
    { label: 'Producto', value: PushTypeEnum.PRODUCT },
    { label: 'Promoción', value: PushTypeEnum.PROMOTION }
  ];

  readonly statusOptions = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Procesadas', value: 'processed' },
    { label: 'Pendientes', value: 'pending' }
  ];

  // Load notifications on init
  constructor() {
    effect(() => {
      this.loadNotifications();
    }, { allowSignalWrites: true });
  }

  /**
   * Load notifications with current filters and pagination
   */
  loadNotifications(): void {
    const f = this.filters();

    const historyFilters = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      filter: f.search || undefined,
      status: f.status === 'all' ? undefined : (f.status === 'processed'),
      from: f.dateFrom?.toISOString(),
      to: f.dateTo?.toISOString()
    };

    this.notificationService.getNotificationHistory(historyFilters).subscribe({
      next: (response) => {
        this.totalRecords.set(response.metadata.totalCount);
      }
    });
  }

  /**
   * Pagination handlers
   */
  onPageChange(event: any): void {
    this.currentPage.set(event.page);
    this.pageSize.set(event.rows);
  }

  /**
   * Filter handlers
   */
  onSearchChange(value: string): void {
    this.filters.update(f => ({ ...f, search: value }));
    this.resetPagination();
  }

  onTypeChange(value: PushTypeEnum | 'all'): void {
    this.filters.update(f => ({ ...f, type: value }));
    this.resetPagination();
  }

  onStatusChange(value: 'all' | 'processed' | 'pending'): void {
    this.filters.update(f => ({ ...f, status: value }));
    this.resetPagination();
  }

  onDateFromChange(value: Date | null): void {
    this.filters.update(f => ({ ...f, dateFrom: value }));
    this.resetPagination();
  }

  onDateToChange(value: Date | null): void {
    this.filters.update(f => ({ ...f, dateTo: value }));
    this.resetPagination();
  }

  clearFilters(): void {
    this.filters.set({
      search: '',
      type: 'all',
      status: 'all',
      dateFrom: null,
      dateTo: null
    });
    this.resetPagination();
  }

  resetPagination(): void {
    this.currentPage.set(0);
  }

  /**
   * Action handlers
   */
  onRowSelect(notification: DataPush): void {
    // Open details dialog or navigate to edit
    console.log('Selected notification:', notification);
  }

  onEdit(notification: DataPush): void {
    // Navigate to edit form
    console.log('Edit notification:', notification);
  }

  onDelete(notification: DataPush): void {
    // Show confirmation dialog
    console.log('Delete notification:', notification);
  }

  /**
   * Formatting helpers
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTypeSeverity(type: PushTypeEnum): 'danger' | 'info' | 'success' {
    switch (type) {
      case PushTypeEnum.ALERT: return 'danger';
      case PushTypeEnum.PRODUCT: return 'info';
      case PushTypeEnum.PROMOTION: return 'success';
      default: return 'info';
    }
  }

  getTypeLabel(type: PushTypeEnum): string {
    switch (type) {
      case PushTypeEnum.ALERT: return 'Alerta';
      case PushTypeEnum.PRODUCT: return 'Producto';
      case PushTypeEnum.PROMOTION: return 'Promoción';
      default: return type;
    }
  }

  getStatusSeverity(isProcessed: boolean | null): 'success' | 'warn' | 'info' {
    if (isProcessed === null) return 'info';
    return isProcessed ? 'success' : 'warn';
  }

  getStatusLabel(isProcessed: boolean | null): string {
    if (isProcessed === null) return 'Programada';
    return isProcessed ? 'Procesada' : 'Pendiente';
  }

  formatTargets(targets: string[]): string {
    if (!targets || targets.length === 0) return 'Sin audiencias';
    if (targets.length === 1) return targets[0];
    return `${targets[0]} +${targets.length - 1}`;
  }
}
