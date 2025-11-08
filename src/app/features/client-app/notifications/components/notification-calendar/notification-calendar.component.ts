import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';

import { NotificationEvent, CalendarStats } from '../../models';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: NotificationEvent[];
  hasEvents: boolean;
}

type CalendarView = 'month' | 'day';

@Component({
  selector: 'app-notification-calendar',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    TagModule,
    ChipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-calendar.component.html',
  styleUrl: './notification-calendar.component.scss'
})
export class NotificationCalendarComponent {
  // Inputs
  readonly events = input.required<NotificationEvent[]>();
  readonly stats = input.required<CalendarStats>();
  readonly isLoading = input<boolean>(false);

  // Outputs
  readonly eventClick = output<NotificationEvent>();
  readonly dateClick = output<Date>();

  // State
  readonly currentDate = signal(new Date());
  readonly currentView = signal<CalendarView>('month');
  readonly expandedDays = signal<Set<string>>(new Set());

  // Computed
  readonly currentMonth = computed(() => this.currentDate().getMonth());
  readonly currentYear = computed(() => this.currentDate().getFullYear());

  readonly monthName = computed(() => {
    return this.currentDate().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' });
  });

  readonly calendarDays = computed(() => {
    return this.generateCalendarDays();
  });

  readonly dayViewEvents = computed(() => {
    if (this.currentView() !== 'day') return [];

    const selectedDate = this.currentDate();
    return this.events().filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  });

  readonly weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  /**
   * Generate calendar days for current month
   */
  private generateCalendarDays(): CalendarDay[] {
    const year = this.currentYear();
    const month = this.currentMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);

    // Start from Sunday of the week containing the first day
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate 6 weeks (42 days) to ensure consistent grid
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayEvents = this.getEventsForDate(date);

      days.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        events: dayEvents,
        hasEvents: dayEvents.length > 0
      });
    }

    return days;
  }

  /**
   * Get events for a specific date
   */
  private getEventsForDate(date: Date): NotificationEvent[] {
    return this.events().filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }

  /**
   * Navigation
   */
  previousMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentDate.set(newDate);
  }

  nextMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentDate.set(newDate);
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.currentView.set('month');
  }

  /**
   * View switching
   */
  switchToMonthView(): void {
    this.currentView.set('month');
  }

  switchToDayView(): void {
    this.currentView.set('day');
  }

  /**
   * Event handlers
   */
  onDayClick(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;

    if (day.hasEvents) {
      this.currentDate.set(day.date);
      this.switchToDayView();
    }

    this.dateClick.emit(day.date);
  }

  onEventClick(event: NotificationEvent, $event: Event): void {
    $event.stopPropagation();
    this.eventClick.emit(event);
  }

  /**
   * Toggle expanded state for a day
   */
  toggleDayExpanded(dateKey: string): void {
    const expanded = this.expandedDays();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }

    this.expandedDays.set(newExpanded);
  }

  isDayExpanded(dateKey: string): boolean {
    return this.expandedDays().has(dateKey);
  }

  getDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  /**
   * Get visible events for a day (max 3, or all if expanded)
   */
  getVisibleEvents(day: CalendarDay): NotificationEvent[] {
    const dateKey = this.getDateKey(day.date);
    const isExpanded = this.isDayExpanded(dateKey);

    if (isExpanded) {
      return day.events;
    }

    return day.events.slice(0, 3);
  }

  shouldShowMoreButton(day: CalendarDay): boolean {
    return day.events.length > 3;
  }

  getRemainingCount(day: CalendarDay): number {
    const dateKey = this.getDateKey(day.date);
    const isExpanded = this.isDayExpanded(dateKey);

    if (isExpanded) return 0;

    return Math.max(0, day.events.length - 3);
  }

  /**
   * Format time from event date
   */
  formatEventTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Get severity for event type tag based on processed status
   */
  getEventSeverity(event: NotificationEvent): 'success' | 'warn' {
    return event.extendedProps.originalPush.isProcessed ? 'success' : 'warn';
  }

  /**
   * Get event type label
   */
  getEventTypeLabel(event: NotificationEvent): string {
    if (event.extendedProps.originalPush.isProcessed) {
      return 'Enviada';
    }
    return event.extendedProps.type === 'push' ? 'Push' : 'SMS';
  }

  /**
   * Get event type icon (single letter)
   */
  getEventTypeIcon(event: NotificationEvent): string {
    if (event.extendedProps.originalPush.isProcessed) {
      return '✓';
    }
    return event.extendedProps.type === 'push' ? 'P' : 'S';
  }

  /**
   * Format event label for chip display
   */
  formatEventLabel(event: NotificationEvent): string {
    const time = this.formatEventTime(event.date);
    const title = event.title;
    return `${time} - ${title}`;
  }
}
