import type { Routes } from '@angular/router';

export const DRIVERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/drivers-page/drivers-page.component').then(m => m.DriversPageComponent)
  }
];
