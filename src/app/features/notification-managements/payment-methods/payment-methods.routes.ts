import { Routes } from '@angular/router';

export const PAYMENT_METHODS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/payment-methods-page/payment-methods-page.component').then(
        (m) => m.PaymentMethodsPageComponent
      )
  }
];
