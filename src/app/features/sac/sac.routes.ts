import { Routes } from '@angular/router';

export const SAC_ROUTES: Routes = [
  {
    path: 'ocurrences',
    loadChildren: () =>
      import('./occurrences/occurrences.routes').then((m) => m.OCCURRENCES_ROUTES),
    title: 'SAC - Ocurrencias'
  },
  {
    path: 'scheduled-orders',
    loadChildren: () =>
      import('./scheduled-orders/scheduled-orders.routes').then((m) => m.SCHEDULED_ORDERS_ROUTES),
    title: 'SAC - Órdenes Programadas'
  },
  {
    path: 'order-tracking',
    loadChildren: () =>
      import('./order-tracking/order-tracking.routes').then((m) => m.ORDER_TRACKING_ROUTES),
    title: 'SAC - Seguimiento de Pedidos'
  }
  // TODO: Agregar otras rutas del módulo SAC cuando se migren:
  // - reports
];
