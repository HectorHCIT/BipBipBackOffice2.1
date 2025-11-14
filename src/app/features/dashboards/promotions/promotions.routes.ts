import type { Routes } from '@angular/router';

export const PROMOTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/promotions-page/promotions-page.component').then(m => m.PromotionsPageComponent)
  }
];
