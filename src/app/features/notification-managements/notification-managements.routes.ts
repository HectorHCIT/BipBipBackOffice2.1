import { Routes } from '@angular/router';

/**
 * NOTIFICATION_MANAGEMENTS_ROUTES
 *
 * Rutas consolidadas del módulo de Gestión de Notificaciones
 *
 * Este módulo agrupa todas las funcionalidades relacionadas con
 * la gestión y configuración de notificaciones:
 * - Payment Methods (Métodos de Pago) ✅
 */
export const NOTIFICATION_MANAGEMENTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'payment-methods',
    pathMatch: 'full'
  },
  {
    path: 'payment-methods',
    loadChildren: () => import('./payment-methods/payment-methods.routes').then(m => m.PAYMENT_METHODS_ROUTES),
    title: 'Métodos de Pago'
  }
];
