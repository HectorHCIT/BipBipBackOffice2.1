import { Component, ChangeDetectionStrategy, input, output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalDataService } from '@core/services/global-data.service';
import { type Payment, type CalendarDay, type CalendarEvent } from '../../models/payment.model';

/**
 * CalendarGridComponent
 *
 * Custom calendar grid component (6 weeks × 7 days = 42 cells)
 * Features:
 * - Event rendering as colored pills (desktop) or dots (mobile)
 * - City-based color coding
 * - Click handlers for dates and events
 * - Expandable days for many events
 * - Smooth animations and transitions
 * - Accessibility support
 */
@Component({
  selector: 'app-calendar-grid',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="calendar-container">
      <!-- Calendar Header (Day Names) -->
      <div class="calendar-header">
        @for (day of weekDays; track day) {
          <div class="header-cell">
            {{ day }}
          </div>
        }
      </div>

      <!-- Calendar Grid (42 cells) -->
      <div class="calendar-grid">
        @for (day of calendarDays(); track day.date + '-' + day.month + '-' + day.year) {
          <div
            class="day-cell"
            [class.current-month]="day.isCurrentMonth"
            [class.other-month]="!day.isCurrentMonth"
            [class.today]="day.isToday"
            [class.expanded]="isDayExpanded(day)"
            (click)="onDateCellClick(day)"
          >
            <!-- Day Number -->
            <div class="day-number-container">
              <div class="day-number" [class.today-number]="day.isToday">
                {{ day.date }}
              </div>
            </div>

            <!-- Events Container (Desktop Pills) -->
            <div class="events-container" [class.expanded]="isDayExpanded(day)">
              @for (event of getVisibleEvents(day); track event.id) {
                <div
                  class="event-pill"
                  [style.background-color]="event.backgroundColor"
                  [title]="getEventTooltip(event)"
                  (click)="onEventClick($event, event.payment)"
                >
                  {{ event.payment.launchScaleValue }}
                </div>
              }

              <!-- Show More / Less Buttons -->
              @if (day.events.length > 3 && !isDayExpanded(day)) {
                <button
                  class="more-events-btn"
                  (click)="toggleDayExpansion($event, day)"
                  type="button"
                >
                  +{{ day.events.length - 3 }} más
                </button>
              }

              @if (isDayExpanded(day) && day.events.length > 3) {
                <button
                  class="less-events-btn"
                  (click)="toggleDayExpansion($event, day)"
                  type="button"
                >
                  Ver menos
                </button>
              }
            </div>

            <!-- Event Dots (Mobile Only) -->
            <div class="event-dots">
              @for (event of day.events.slice(0, 3); track event.id) {
                <div
                  class="event-dot"
                  [style.background-color]="event.backgroundColor"
                  [title]="getEventTooltip(event)"
                  (click)="onEventClick($event, event.payment)"
                ></div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* ==================== */
    /* Container & Layout   */
    /* ==================== */
    .calendar-container {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 0.5rem;
      overflow: hidden;
      animation: fadeIn 0.3s ease-out;
    }

    .calendar-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: var(--surface-50);
      border-bottom: 1px solid var(--surface-border);
    }

    .header-cell {
      padding: 0.75rem;
      text-align: center;
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-color);
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    /* ==================== */
    /* Day Cells            */
    /* ==================== */
    .day-cell {
      min-height: 100px;
      padding: 0.5rem;
      border: 1px solid var(--surface-border);
      cursor: pointer;
      position: relative;
      transition: all 0.3s ease-in-out;
      animation: fadeIn 0.3s ease-out;
      background: var(--surface-card);
    }

    .day-cell:hover:not(.other-month) {
      background-color: var(--surface-hover);
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      transform: scale(1.02);
      z-index: 10;
    }

    .day-cell.today {
      background-color: var(--primary-50);
      border-left: 4px solid var(--primary-color);
    }

    .day-cell.other-month {
      background-color: var(--surface-100);
      opacity: 0.6;
    }

    .day-cell.other-month .day-number {
      color: var(--text-color-secondary);
    }

    .day-cell.expanded {
      min-height: 200px;
    }

    /* ==================== */
    /* Day Number           */
    /* ==================== */
    .day-number-container {
      display: flex;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .day-number {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-color);
      transition: all 0.2s ease-out;
    }

    .day-number.today-number {
      background-color: var(--primary-color);
      color: var(--primary-color-text);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    /* ==================== */
    /* Events Container     */
    /* ==================== */
    .events-container {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      max-height: 80px;
      overflow: hidden;
      transition: max-height 0.3s ease-in-out;
      position: relative;
    }

    .events-container.expanded {
      max-height: 240px;
      overflow-y: auto;
    }

    /* Custom Scrollbar */
    .events-container::-webkit-scrollbar {
      width: 4px;
    }

    .events-container::-webkit-scrollbar-track {
      background: var(--surface-100);
      border-radius: 9999px;
    }

    .events-container::-webkit-scrollbar-thumb {
      background: var(--surface-400);
      border-radius: 9999px;
    }

    .events-container::-webkit-scrollbar-thumb:hover {
      background: var(--surface-500);
    }

    /* ==================== */
    /* Event Pills          */
    /* ==================== */
    .event-pill {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease-out;
      animation: slideIn 0.2s ease-out;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    .event-pill:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      z-index: 20;
    }

    /* ==================== */
    /* More/Less Buttons    */
    /* ==================== */
    .more-events-btn,
    .less-events-btn {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem 0;
      text-align: left;
      transition: color 0.2s ease-out;
      font-weight: 500;
    }

    .more-events-btn:hover,
    .less-events-btn:hover {
      color: var(--primary-color);
      text-decoration: underline;
    }

    /* ==================== */
    /* Event Dots (Mobile)  */
    /* ==================== */
    .event-dots {
      display: none;
      flex-wrap: wrap;
      gap: 0.25rem;
      margin-top: 0.5rem;
    }

    .event-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.2s ease-out;
    }

    .event-dot:hover {
      transform: scale(1.3);
    }

    /* ==================== */
    /* Animations           */
    /* ==================== */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* ==================== */
    /* Accessibility        */
    /* ==================== */
    @media (prefers-reduced-motion: reduce) {
      .calendar-container,
      .day-cell,
      .event-pill,
      .events-container {
        animation: none !important;
        transition: none !important;
      }
    }

    /* ==================== */
    /* Responsive (Tablet)  */
    /* ==================== */
    @media (max-width: 768px) {
      .day-cell {
        min-height: 80px;
        padding: 0.25rem;
      }

      .day-cell.expanded {
        min-height: 150px;
      }

      .header-cell {
        padding: 0.5rem;
        font-size: 0.75rem;
      }

      .event-pill {
        width: 1.75rem;
        height: 1.75rem;
        font-size: 0.625rem;
      }

      .events-container {
        max-height: 60px;
      }

      .events-container.expanded {
        max-height: 180px;
      }
    }

    /* ==================== */
    /* Responsive (Mobile)  */
    /* ==================== */
    @media (max-width: 480px) {
      .day-cell {
        min-height: 60px;
        padding: 0.25rem;
      }

      .day-cell.expanded {
        min-height: 60px;
      }

      .day-number-container {
        margin-bottom: 0.25rem;
      }

      .day-number {
        font-size: 0.75rem;
      }

      .day-number.today-number {
        width: 24px;
        height: 24px;
      }

      /* Hide pills, show dots */
      .events-container {
        display: none !important;
      }

      .event-dots {
        display: flex;
      }
    }
  `]
})
export class CalendarGridComponent {
  private readonly globalData = inject(GlobalDataService);

  // Inputs
  readonly payments = input.required<Payment[]>();
  readonly currentMonth = input.required<Date>();
  readonly cityColors = input.required<Map<number, string>>();

  // Outputs
  readonly dateClick = output<CalendarDay>();
  readonly paymentClick = output<Payment>();

  // State for expanded days
  private readonly expandedDays = signal(new Set<string>());

  // Week day names
  readonly weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  /**
   * Generate calendar grid (42 cells: 6 weeks × 7 days)
   */
  readonly calendarDays = computed(() => {
    const date = this.currentMonth();
    const year = date.getFullYear();
    const month = date.getMonth();
    const days: CalendarDay[] = [];

    // Step 1: Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Step 2: Calculate starting day offset (Monday = 0)
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Step 3: Add previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }

    // Step 4: Add current month days with events
    const today = new Date();
    for (let date = 1; date <= lastDay.getDate(); date++) {
      const isToday =
        today.getDate() === date &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      days.push({
        date,
        month,
        year,
        isCurrentMonth: true,
        isToday,
        events: this.getEventsForDay(year, month, date)
      });
    }

    // Step 5: Fill remaining slots with next month days
    const remainingDays = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let date = 1; date <= remainingDays; date++) {
      days.push({
        date,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }

    return days;
  });

  /**
   * Get events for a specific day
   */
  private getEventsForDay(year: number, month: number, date: number): CalendarEvent[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

    return this.payments()
      .filter(payment => {
        const paymentDate = payment.launchDate.split('T')[0];
        return paymentDate === dateStr;
      })
      .map(payment => this.mapPaymentToEvent(payment));
  }

  /**
   * Map payment to calendar event
   */
  private mapPaymentToEvent(payment: Payment): CalendarEvent {
    // Get color from first city (or default)
    const firstCityId = payment.cities[0];
    const color = this.cityColors().get(firstCityId) || '#fb0021';

    return {
      id: `${payment.id}`,
      title: `${payment.launchScaleValue}`,
      date: payment.launchDate,
      backgroundColor: color,
      textColor: '#ffffff',
      payment
    };
  }

  /**
   * Get tooltip text for event
   */
  getEventTooltip(event: CalendarEvent): string {
    const payment = event.payment;
    const cityNames = payment.cities
      .map(cityId => {
        const city = this.globalData.cities().find(c => c.id === cityId);
        return city?.name || 'Desconocida';
      })
      .join(', ');

    const date = new Date(payment.launchDate);
    const dateStr = date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `Escala: ${payment.launchScaleValue}\nCiudades: ${cityNames}\nFecha: ${dateStr}`;
  }

  /**
   * Get day key for tracking expanded state
   */
  private getDayKey(day: CalendarDay): string {
    return `${day.year}-${day.month}-${day.date}`;
  }

  /**
   * Check if day is expanded
   */
  isDayExpanded(day: CalendarDay): boolean {
    return this.expandedDays().has(this.getDayKey(day));
  }

  /**
   * Toggle day expansion
   */
  toggleDayExpansion(event: Event, day: CalendarDay): void {
    event.stopPropagation();
    const key = this.getDayKey(day);
    const expanded = new Set(this.expandedDays());

    if (expanded.has(key)) {
      expanded.delete(key);
    } else {
      expanded.add(key);
    }

    this.expandedDays.set(expanded);
  }

  /**
   * Get visible events for a day based on expansion state
   */
  getVisibleEvents(day: CalendarDay): CalendarEvent[] {
    if (this.isDayExpanded(day)) {
      return day.events;
    }
    return day.events.slice(0, 3);
  }

  /**
   * Handle date cell click
   */
  onDateCellClick(day: CalendarDay): void {
    if (day.isCurrentMonth) {
      this.dateClick.emit(day);
    }
  }

  /**
   * Handle event pill click
   */
  onEventClick(event: Event, payment: Payment): void {
    event.stopPropagation();
    this.paymentClick.emit(payment);
  }
}
