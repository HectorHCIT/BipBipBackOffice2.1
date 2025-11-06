import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { PaymentService } from '../../services/payment.service';
import { GlobalDataService } from '@core/services/global-data.service';
import { CalendarGridComponent } from '../../components/calendar-grid/calendar-grid.component';
import { CalendarEventListComponent } from '../../components/calendar-event-list/calendar-event-list.component';
import { PaymentFormComponent } from '../../components/payment-form/payment-form.component';
import { type Payment, type CalendarDay, DEFAULT_CITY_COLORS } from '../../models/payment.model';

/**
 * PaymentCalendarComponent
 *
 * Main page component for differentiated payment scheduling
 * Features:
 * - Monthly calendar view with payment events
 * - Mobile-responsive list view
 * - Create/edit/delete payments
 * - City-based color coding
 */
@Component({
  selector: 'app-payment-calendar',
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbModule,
    ButtonModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    DynamicDialogModule,
    CalendarGridComponent,
    CalendarEventListComponent
  ],
  providers: [MessageService, ConfirmationService, DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto p-6">
      <!-- Breadcrumb -->
      <p-breadcrumb [model]="breadcrumbItems" [home]="breadcrumbHome" styleClass="mb-4" />

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">
          <i class="pi pi-calendar mr-3 text-primary"></i>
          Calendario de Pagos Diferenciados
        </h1>
        <p class="text-gray-600 mt-2">
          Programa escalas de pago especiales para fechas específicas por ciudad
        </p>
      </div>

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6 p-4  rounded-lg border border-gray-300 ">
        <!-- Month/Year Navigation -->
        <div class="flex items-center gap-2">
          <p-button
            icon="pi pi-chevron-left"
            [outlined]="true"
            (onClick)="navigateMonth('prev')"
            [disabled]="isLoading()"
          />

          <p-select
            [options]="monthOptions"
            [ngModel]="selectedMonth()"
            (ngModelChange)="selectedMonth.set($event); onMonthYearChange()"
            optionLabel="label"
            optionValue="value"
            [style]="{ width: '140px' }"
          />

          <p-select
            [options]="yearOptions"
            [ngModel]="selectedYear()"
            (ngModelChange)="selectedYear.set($event); onMonthYearChange()"
            [style]="{ width: '100px' }"
          />

          <p-button
            icon="pi pi-chevron-right"
            [outlined]="true"
            (onClick)="navigateMonth('next')"
            [disabled]="isLoading()"
          />

          <p-button
            label="Hoy"
            icon="pi pi-home"
            [text]="true"
            (onClick)="goToToday()"
          />
        </div>

        <!-- View Toggle & Create Button -->
        <div class="flex items-center gap-2">
          @if (!isMobileView()) {
            <p-button
              [icon]="viewType() === 'calendar' ? 'pi pi-list' : 'pi pi-calendar'"
              [label]="viewType() === 'calendar' ? 'Vista Lista' : 'Vista Calendario'"
              [outlined]="true"
              (onClick)="toggleView()"
            />
          }

          <p-button
            label="Programar Pago"
            icon="pi pi-plus"
            (onClick)="openCreateDialog()"
            [loading]="isLoading()"
          />
        </div>
      </div>

      <!-- Loading Spinner -->
      @if (isLoading()) {
        <div class="flex justify-center items-center p-12">
          <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
        </div>
      }

      <!-- Calendar View -->
      @if (!isLoading() && viewType() === 'calendar') {
        <app-calendar-grid
          [payments]="payments()"
          [currentMonth]="currentMonthDate()"
          [cityColors]="cityColors"
          (dateClick)="onDateClick($event)"
          (paymentClick)="onPaymentClick($event)"
        />
      }

      <!-- List View -->
      @if (!isLoading() && viewType() === 'list') {
        <app-calendar-event-list
          [payments]="payments()"
          [cityColors]="cityColors"
          (paymentClick)="onPaymentClick($event)"
        />
      }

      <!-- FAB Button (Mobile Only) -->
      @if (isMobileView()) {
        <button
          class="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-600 transition-colors z-50"
          (click)="openCreateDialog()"
        >
          <i class="pi pi-plus text-xl"></i>
        </button>
      }

      <!-- Toast & Dialogs -->
      <p-toast />
      <p-confirmDialog />
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .bg-primary {
      background-color: #fb0021;
    }

    .bg-primary-600 {
      background-color: #dc001d;
    }

    .text-primary {
      color: #fb0021;
    }
  `]
})
export class PaymentCalendarComponent implements OnInit, OnDestroy {
  private readonly paymentService = inject(PaymentService);
  private readonly globalData = inject(GlobalDataService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dialogService = inject(DialogService);

  // Breadcrumb
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Mantenimiento', routerLink: '/maintenance' },
    { label: 'Pagos Diferenciados' }
  ];

  // State signals
  readonly payments = this.paymentService.payments;
  readonly isLoading = this.paymentService.isLoading;
  readonly isMobileView = signal(false);
  readonly viewType = signal<'calendar' | 'list'>('calendar');

  // Date navigation
  readonly selectedMonth = signal(new Date().getMonth());
  readonly selectedYear = signal(new Date().getFullYear());

  // Computed
  readonly currentMonthDate = computed(() =>
    new Date(this.selectedYear(), this.selectedMonth(), 1)
  );

  // Month options
  readonly monthOptions = [
    { label: 'Enero', value: 0 },
    { label: 'Febrero', value: 1 },
    { label: 'Marzo', value: 2 },
    { label: 'Abril', value: 3 },
    { label: 'Mayo', value: 4 },
    { label: 'Junio', value: 5 },
    { label: 'Julio', value: 6 },
    { label: 'Agosto', value: 7 },
    { label: 'Septiembre', value: 8 },
    { label: 'Octubre', value: 9 },
    { label: 'Noviembre', value: 10 },
    { label: 'Diciembre', value: 11 }
  ];

  // Year options (current year ± 5 years)
  readonly yearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return year;
  });

  // City colors map
  cityColors = new Map<number, string>();

  private resizeListener?: () => void;

  ngOnInit(): void {
    this.setupResizeListener();
    this.checkMobileView();
    this.ensureCitiesLoaded();
    this.assignCityColors();
    this.loadPayments();
  }

  /**
   * Ensure cities are loaded from GlobalDataService
   */
  private ensureCitiesLoaded(): void {
    if (this.globalData.cities().length === 0) {
      console.log('🏙️ Cities not loaded, triggering loadAll()');
      this.globalData.loadAll();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  /**
   * Setup window resize listener
   */
  private setupResizeListener(): void {
    this.resizeListener = () => this.checkMobileView();
    window.addEventListener('resize', this.resizeListener);
  }

  /**
   * Check if mobile view should be active
   */
  private checkMobileView(): void {
    const isMobile = window.innerWidth < 768;
    this.isMobileView.set(isMobile);

    // Force list view on mobile
    if (isMobile) {
      this.viewType.set('list');
    }
  }

  /**
   * Assign colors to cities from global data
   */
  private assignCityColors(): void {
    const cities = this.globalData.cities();
    this.cityColors.clear();

    cities.forEach((city, index) => {
      const colorIndex = index % DEFAULT_CITY_COLORS.length;
      this.cityColors.set(city.id, DEFAULT_CITY_COLORS[colorIndex]);
    });
  }

  /**
   * Load payments for current month
   */
  private loadPayments(): void {
    const firstDay = new Date(this.selectedYear(), this.selectedMonth(), 1, 0, 0, 0, 0);
    const lastDay = new Date(this.selectedYear(), this.selectedMonth() + 1, 0, 23, 59, 59, 999);

    const startDate = this.formatDateISO(firstDay);
    const endDate = this.formatDateISO(lastDay);

    this.paymentService.getPayments(startDate, endDate).subscribe({
      error: (error) => {
        console.error('Error loading payments:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los pagos programados',
          life: 3000
        });
      }
    });
  }

  /**
   * Format date to ISO string for API
   */
  private formatDateISO(date: Date): string {
    return date.toISOString();
  }

  /**
   * Navigate to previous/next month
   */
  navigateMonth(direction: 'prev' | 'next'): void {
    if (direction === 'prev') {
      const newMonth = this.selectedMonth() - 1;
      if (newMonth < 0) {
        this.selectedMonth.set(11);
        this.selectedYear.set(this.selectedYear() - 1);
      } else {
        this.selectedMonth.set(newMonth);
      }
    } else {
      const newMonth = this.selectedMonth() + 1;
      if (newMonth > 11) {
        this.selectedMonth.set(0);
        this.selectedYear.set(this.selectedYear() + 1);
      } else {
        this.selectedMonth.set(newMonth);
      }
    }

    this.loadPayments();
  }

  /**
   * Handle month/year selector change
   */
  onMonthYearChange(): void {
    this.loadPayments();
  }

  /**
   * Go to today's date
   */
  goToToday(): void {
    const now = new Date();
    this.selectedMonth.set(now.getMonth());
    this.selectedYear.set(now.getFullYear());
    this.loadPayments();
  }

  /**
   * Toggle between calendar and list view
   */
  toggleView(): void {
    this.viewType.set(this.viewType() === 'calendar' ? 'list' : 'calendar');
  }

  /**
   * Open dialog to create payment
   */
  openCreateDialog(preselectedDate?: Date): void {
    const ref = this.dialogService.open(PaymentFormComponent, {
      header: 'Programar Pago Diferenciado',
      width: '600px',
      data: {
        date: preselectedDate || new Date(this.selectedYear(), this.selectedMonth(), 1, 12, 0, 0),
        mode: 'create'
      }
    });

    if (ref) {
      ref.onClose.subscribe((success) => {
        if (success) {
          this.loadPayments();
        }
      });
    }
  }

  /**
   * Handle date click from calendar
   */
  onDateClick(day: CalendarDay): void {
    const selectedDate = new Date(day.year, day.month, day.date, 12, 0, 0);
    this.openCreateDialog(selectedDate);
  }

  /**
   * Handle payment click
   */
  onPaymentClick(payment: Payment): void {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar el pago programado para ${new Date(payment.launchDate).toLocaleString('es-ES')}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deletePayment(payment.id);
      }
    });
  }

  /**
   * Delete payment
   */
  private deletePayment(id: number): void {
    this.paymentService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pago eliminado correctamente',
          life: 3000
        });
      },
      error: (error) => {
        console.error('Error deleting payment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar el pago',
          life: 3000
        });
      }
    });
  }
}
