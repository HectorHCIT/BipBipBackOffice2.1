import { Routes } from '@angular/router';

export const SETTLEMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/settlements/settlements.component').then(
        (m) => m.SettlementsComponent
      ),
    title: 'Liquidaciones',
  },
];
