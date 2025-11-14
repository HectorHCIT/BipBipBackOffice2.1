import type { Routes } from '@angular/router';

export const ZONES_MAP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/zones-map-page/zones-map-page.component').then(m => m.ZonesMapPageComponent)
  }
];
