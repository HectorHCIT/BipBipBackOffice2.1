import { Routes } from '@angular/router';

/**
 * CLIENT_APP_ROUTES
 *
 * Rutas consolidadas del módulo de App Cliente
 *
 * Este módulo agrupa todas las funcionalidades relacionadas con
 * la configuración de la aplicación móvil del cliente:
 * - Channels (Canales de Comunicación) ✅
 * - Tips (Propinas) ✅
 * - FAQs (Preguntas Frecuentes) ✅
 * - Registered Users (Usuarios Registrados) ✅
 * - SMS/Push Notifications (Notificaciones) ✅
 */
export const CLIENT_APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'channels',
    pathMatch: 'full'
  },
  {
    path: 'channels',
    loadChildren: () => import('./channels/channels.routes').then(m => m.CHANNELS_ROUTES),
    title: 'Canales de Comunicación'
  },
  {
    path: 'gratification',
    loadChildren: () => import('./tips/tips.routes').then(m => m.TIPS_ROUTES),
    title: 'Gestión de Propinas'
  },
  {
    path: 'frequently-question',
    loadChildren: () => import('./faqs/faqs.routes').then(m => m.FAQS_ROUTES),
    title: 'Preguntas Frecuentes'
  },
  {
    path: 'user-registry',
    loadChildren: () => import('./registered-users/registered-users.routes').then(m => m.REGISTERED_USERS_ROUTES),
    title: 'Usuarios Registrados'
  },
  {
    path: 'sms-push-notifications',
    loadChildren: () => import('./notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES),
    title: 'Gestión de Notificaciones'
  }
];
