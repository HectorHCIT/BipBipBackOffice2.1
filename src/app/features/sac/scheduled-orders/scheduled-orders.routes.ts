import { Routes } from '@angular/router';

export const SCHEDULED_ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/scheduled-orders-page/scheduled-orders-page.component').then(
        (m) => m.ScheduledOrdersPageComponent
      ),
    title: 'Órdenes Programadas'
  }
];
