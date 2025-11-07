import { Routes } from '@angular/router';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/notifications-page/notifications-page.component').then(
        (m) => m.NotificationsPageComponent
      ),
    title: 'Gestión de Notificaciones'
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/notification-form-page/notification-form-page.component').then(
        (m) => m.NotificationFormPageComponent
      ),
    title: 'Nueva Notificación'
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/notification-form-page/notification-form-page.component').then(
        (m) => m.NotificationFormPageComponent
      ),
    title: 'Editar Notificación'
  }
];
