import { Routes } from '@angular/router';

export const SAC_ROUTES: Routes = [
  {
    path: 'chats',
    loadChildren: () =>
      import('./chats/chats.routes').then((m) => m.CHATS_ROUTES),
    title: 'SAC - Chats'
  },
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
  },
  {
    path: 'ordenes-con-demora',
    loadChildren: () =>
      import('./delayed-orders/delayed-orders.routes').then((m) => m.DELAYED_ORDERS_ROUTES),
    title: 'SAC - Órdenes con Demora'
  },
  {
    path: 'order-customer',
    loadChildren: () =>
      import('./orders-by-customer/orders-by-customer.routes').then((m) => m.ORDERS_BY_CUSTOMER_ROUTES),
    title: 'SAC - Órdenes por Cliente'
  },
  {
    path: 'cancellation-request',
    loadChildren: () =>
      import('./cancellation-requests/cancellation-requests.routes').then((m) => m.CANCELLATION_REQUESTS_ROUTES),
    title: 'SAC - Solicitudes de Cancelación'
  },
  {
    path: 'reportes',
    loadChildren: () =>
      import('./reports/reports.routes').then((m) => m.REPORTS_ROUTES),
    title: 'SAC - Reportes'
  }
];
