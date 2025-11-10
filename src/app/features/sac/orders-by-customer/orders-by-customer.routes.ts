import { Routes } from '@angular/router';

export const ORDERS_BY_CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/orders-by-customer-page/orders-by-customer-page.component').then(
        (m) => m.OrdersByCustomerPageComponent
      )
  }
];
