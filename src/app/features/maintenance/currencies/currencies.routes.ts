import { Routes } from '@angular/router';

export const CURRENCIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/currencies/currencies.component').then(m => m.CurrenciesComponent)
  }
];
