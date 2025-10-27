import { Routes } from '@angular/router';

export const FISCAL_CORRELATIVES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/fiscal-correlatives/fiscal-correlatives.component').then(
        (m) => m.FiscalCorrelativesComponent
      ),
    title: 'Correlativos Fiscales'
  }
];
