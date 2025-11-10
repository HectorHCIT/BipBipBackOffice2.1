import { Routes } from '@angular/router';

/**
 * NOTIFICATION_MANAGEMENTS_ROUTES
 *
 * Rutas consolidadas del módulo de Gestión de Notificaciones
 *
 * Este módulo agrupa todas las funcionalidades relacionadas con
 * la gestión y configuración de notificaciones:
 * - Payment Methods (Métodos de Pago) ✅
 * - Target Audience (Público Objetivo) ✅
 * - Loyalty Program (Programa de Lealtad) ✅
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
  },
  {
    path: 'objective-public',
    loadChildren: () => import('./target-audience/target-audience.routes').then(m => m.TARGET_AUDIENCE_ROUTES),
    title: 'Público Objetivo'
  },
  {
    path: 'loyalty-program',
    loadChildren: () => import('./loyalty-program/loyalty-program.routes').then(m => m.LOYALTY_PROGRAM_ROUTES),
    title: 'Programa de Lealtad'
  }
];
