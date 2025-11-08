import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { MessageModule } from 'primeng/message';
import { MenuItem } from 'primeng/api';

import { NotificationCalendarComponent } from '../../components/notification-calendar/notification-calendar.component';
import { NotificationHistoryComponent } from '../../components/notification-history/notification-history.component';
import { NotificationFormDrawerComponent } from '../../components/notification-form-drawer/notification-form-drawer.component';
import { NotificationEventDetailsDialogComponent } from '../../components/notification-event-details-dialog/notification-event-details-dialog.component';
import { NotificationService } from '../../services';
import { NotificationEvent } from '../../models';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbModule,
    ButtonModule,
    TabsModule,
    MessageModule,
    NotificationCalendarComponent,
    NotificationHistoryComponent,
    NotificationFormDrawerComponent,
    NotificationEventDetailsDialogComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss'
})
export class NotificationsPageComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Clientes', routerLink: '/client-app' },
    { label: 'Gestión de Notificaciones' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Active tab
  readonly activeTab = signal('calendar');

  // Form drawer state
  readonly showFormDrawer = signal(false);
  readonly selectedNotificationId = signal<number | null>(null);

  // Event details dialog state
  readonly showEventDetailsDialog = signal(false);
  readonly selectedEvent = signal<NotificationEvent | null>(null);

  // State from service
  readonly events = this.notificationService.notificationEvents;
  readonly stats = this.notificationService.calendarStats;
  readonly isLoading = this.notificationService.isLoadingCalendar;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getScheduledNotifications().subscribe({
      error: (err) => {
        console.error('Error loading notifications:', err);
      }
    });
  }

  onEventClick(event: NotificationEvent): void {
    this.selectedEvent.set(event);
    this.showEventDetailsDialog.set(true);
  }

  onDateClick(date: Date): void {
    console.log('Date clicked:', date);
  }

  openFormDrawer(notificationId: number | null = null): void {
    this.selectedNotificationId.set(notificationId);
    this.showFormDrawer.set(true);
  }

  handleFormSave(): void {
    // Refresh data after save
    this.loadNotifications();
  }

  handleFormCancel(): void {
    // Optional: Any cleanup when form is cancelled
  }

  refreshData(): void {
    this.loadNotifications();
  }
}
