import type { Routes } from '@angular/router';

export const CANCELACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cancelaciones-page/cancelaciones-page.component').then(m => m.CancelacionesPageComponent)
  }
];
