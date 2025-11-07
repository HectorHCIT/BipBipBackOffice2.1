import { Injectable, inject, signal } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { DataService } from '../../../../core/services/data.service';
import {
  DataPush,
  NotificationEvent,
  PushStructure,
  HistoryPushResponse,
  TargetAudience,
  AuthorizationResponse,
  SendNotificationResponse,
  HistoryFilters,
  CalendarStats,
  EMPTY_HISTORY_RESPONSE
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly dataService = inject(DataService);

  // Reactive state using signals
  readonly notificationEvents = signal<NotificationEvent[]>([]);
  readonly calendarStats = signal<CalendarStats>({
    total: 0,
    pushCount: 0,
    smsCount: 0,
    processedCount: 0,
    pendingCount: 0
  });
  readonly isLoadingCalendar = signal(false);
  readonly isLoadingHistory = signal(false);

  // History state
  readonly historyData = signal<HistoryPushResponse>(EMPTY_HISTORY_RESPONSE);

  // Target audiences
  readonly targetAudiences = signal<TargetAudience[]>([]);

  // Dialog control
  private readonly dialogControlSubject = new Subject<any>();
  readonly dialogControl$ = this.dialogControlSubject.asObservable();

  /**
   * ============================================
   * CALENDAR - Get all scheduled notifications
   * ============================================
   */
  getScheduledNotifications(): Observable<DataPush[]> {
    this.isLoadingCalendar.set(true);

    return this.dataService.get$<DataPush[]>('PushNotification').pipe(
      tap(notifications => {
        // Transform to calendar events
        const events = this.transformToCalendarEvents(notifications);
        this.notificationEvents.set(events);

        // Calculate stats
        const stats = this.calculateStats(notifications);
        this.calendarStats.set(stats);

        this.isLoadingCalendar.set(false);
      })
    );
  }

  /**
   * ============================================
   * HISTORY - Get paginated notification history
   * ============================================
   */
  getNotificationHistory(filters: HistoryFilters): Observable<HistoryPushResponse> {
    this.isLoadingHistory.set(true);

    const params: Record<string, any> = {
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize
    };

    if (filters.filter) {
      params['filter'] = filters.filter;
    }
    if (filters.status !== undefined) {
      params['status'] = filters.status;
    }
    if (filters.from) {
      params['from'] = filters.from;
    }
    if (filters.to) {
      params['to'] = filters.to;
    }

    return this.dataService.get$<HistoryPushResponse>('PushNotification/history', params).pipe(
      tap(response => {
        this.historyData.set(response);
        this.isLoadingHistory.set(false);
      })
    );
  }

  /**
   * ============================================
   * CRUD - Get single notification
   * ============================================
   */
  getNotification(id: number): Observable<DataPush> {
    return this.dataService.get$<DataPush>(`PushNotification/${id}`);
  }

  /**
   * ============================================
   * CRUD - Create new notification
   * ============================================
   */
  createNotification(data: PushStructure): Observable<any> {
    return this.dataService.post$('PushNotification', data);
  }

  /**
   * ============================================
   * CRUD - Update notification
   * ============================================
   */
  updateNotification(id: number, data: PushStructure): Observable<any> {
    return this.dataService.put$(`PushNotification`, data, { id });
  }

  /**
   * ============================================
   * STATUS - Change notification status
   * ============================================
   */
  changeNotificationStatus(id: number, status: boolean): Observable<any> {
    return this.dataService.put$(`PushNotification/${id}/status/${status}`, null);
  }

  /**
   * ============================================
   * AUTHORIZATION - Request authorization code (sent via SMS)
   * ============================================
   */
  requestAuthorization(id: number): Observable<AuthorizationResponse> {
    return this.dataService.patch$<AuthorizationResponse>(`PushNotification/${id}/authorize`, null);
  }

  /**
   * ============================================
   * SEND - Send notification with authorization code
   * ============================================
   */
  sendNotification(id: number, code: string): Observable<SendNotificationResponse> {
    return this.dataService.patch$<SendNotificationResponse>(
      `PushNotification/${id}/send`,
      null,
      { code }
    );
  }

  /**
   * ============================================
   * TARGET AUDIENCES - Get available audiences
   * ============================================
   */
  getTargetAudiences(): Observable<TargetAudience[]> {
    return this.dataService.get$<TargetAudience[]>('TargetPublic/TargetAudienceSummary').pipe(
      tap(audiences => {
        this.targetAudiences.set(audiences);
      })
    );
  }

  /**
   * ============================================
   * HELPER METHODS
   * ============================================
   */

  /**
   * Transform API data to calendar events
   */
  private transformToCalendarEvents(notifications: DataPush[]): NotificationEvent[] {
    return notifications
      .filter(n => n.scheduleDatePN !== null) // Only scheduled notifications
      .map(notification => {
        const bulletcolor = this.getEventColor(notification);
        const type: 'push' | 'sms' = notification.isPushNotification ? 'push' : 'sms';

        return {
          id: notification.codPN.toString(),
          title: notification.titlePN,
          date: notification.scheduleDatePN!,
          extendedProps: {
            bulletcolor,
            type,
            originalPush: notification,
            startTime: this.extractTime(notification.scheduleDatePN!),
            description: notification.bodyPN || notification.titlePN,
            status: notification.status ? 'Activo' : 'Inactivo',
            processed: notification.isProcessed ? 'Procesado' : 'Pendiente'
          }
        };
      });
  }

  /**
   * Get event color based on status (using CSS variables)
   */
  private getEventColor(notification: DataPush): string {
    // Return CSS variable for theming support
    if (notification.isProcessed) {
      return 'var(--green-500)'; // Processed
    }
    return notification.isPushNotification ? 'var(--primary-color)' : 'var(--surface-500)'; // Push or SMS
  }

  /**
   * Extract time from datetime string
   */
  private extractTime(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Calculate calendar statistics
   */
  private calculateStats(notifications: DataPush[]): CalendarStats {
    const total = notifications.length;
    const pushCount = notifications.filter(n => n.isPushNotification).length;
    const smsCount = total - pushCount;
    const processedCount = notifications.filter(n => n.isProcessed).length;
    const pendingCount = total - processedCount;

    return {
      total,
      pushCount,
      smsCount,
      processedCount,
      pendingCount
    };
  }

  /**
   * Update local notification status after sending
   */
  updateLocalNotificationStatus(notificationId: number): void {
    const events = this.notificationEvents();
    const updatedEvents = events.map(event => {
      if (event.id === notificationId.toString()) {
        return {
          ...event,
          extendedProps: {
            ...event.extendedProps,
            bulletcolor: '#01EB7B', // Green - Processed
            processed: 'Procesado',
            originalPush: {
              ...event.extendedProps.originalPush,
              isProcessed: true
            }
          }
        };
      }
      return event;
    });

    this.notificationEvents.set(updatedEvents);

    // Recalculate stats
    const notifications = updatedEvents.map(e => e.extendedProps.originalPush);
    const stats = this.calculateStats(notifications);
    this.calendarStats.set(stats);
  }

  /**
   * Remove notification from local state
   */
  removeLocalNotification(notificationId: number): void {
    const events = this.notificationEvents();
    const updatedEvents = events.filter(event => event.id !== notificationId.toString());
    this.notificationEvents.set(updatedEvents);

    // Recalculate stats
    const notifications = updatedEvents.map(e => e.extendedProps.originalPush);
    const stats = this.calculateStats(notifications);
    this.calendarStats.set(stats);
  }

  /**
   * Trigger dialog control events
   */
  triggerDialogEvent(event: any): void {
    this.dialogControlSubject.next(event);
  }

  /**
   * Refresh all data
   */
  refreshAll(): void {
    this.getScheduledNotifications().subscribe();
  }
}
