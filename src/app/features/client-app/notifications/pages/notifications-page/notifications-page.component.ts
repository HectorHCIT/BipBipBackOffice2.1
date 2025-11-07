import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { MessageModule } from 'primeng/message';
import { MenuItem } from 'primeng/api';

import { NotificationCalendarComponent } from '../../components/notification-calendar/notification-calendar.component';
import { NotificationHistoryComponent } from '../../components/notification-history/notification-history.component';
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
    NotificationHistoryComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss'
})
export class NotificationsPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  // Breadcrumb
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Clientes', routerLink: '/client-app' },
    { label: 'Gestión de Notificaciones' }
  ];
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Active tab
  readonly activeTab = signal('calendar');

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
    console.log('Event clicked:', event);
    // TODO: Open details dialog
  }

  onDateClick(date: Date): void {
    console.log('Date clicked:', date);
  }

  goToCreateNotification(): void {
    this.router.navigate(['/client-app/notifications/create']);
  }

  refreshData(): void {
    this.loadNotifications();
  }
}
