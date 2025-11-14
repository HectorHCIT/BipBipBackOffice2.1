import type { Routes } from '@angular/router';

export const LOYALTY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/loyalty-page/loyalty-page.component').then(m => m.LoyaltyPageComponent)
  }
];
