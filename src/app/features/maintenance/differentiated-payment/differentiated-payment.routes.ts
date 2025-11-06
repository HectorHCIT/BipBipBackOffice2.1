import { Routes } from '@angular/router';

/**
 * PAYMENT_ROUTES - Rutas del módulo de Pagos Diferenciados
 *
 * Sistema de calendario para programar escalas de pago especiales
 * por ciudad y fecha específica
 */
export const PAYMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/payment-calendar/payment-calendar.component').then(
        m => m.PaymentCalendarComponent
      ),
    title: 'Calendario de Pagos Diferenciados'
  }
];
