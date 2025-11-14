import type { Routes } from '@angular/router';

export const KPI_BIPBIP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/kpi-bipbip-page/kpi-bipbip-page.component').then(m => m.KpiBipbipPageComponent)
  }
];
