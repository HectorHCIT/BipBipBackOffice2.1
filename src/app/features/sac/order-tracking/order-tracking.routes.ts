import { Routes } from '@angular/router';

export const ORDER_TRACKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/order-tracking-page/order-tracking-page.component').then(
        (m) => m.OrderTrackingPageComponent
      ),
    title: 'Seguimiento de Pedidos'
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/order-detail-page/order-detail-page.component').then(
        (m) => m.OrderDetailPageComponent
      ),
    title: 'Detalle de Pedido'
  }
];
