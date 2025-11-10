import { Routes } from '@angular/router';

export const DELAYED_ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/delayed-orders-page/delayed-orders-page.component').then(
        (m) => m.DelayedOrdersPageComponent
      )
  }
];
