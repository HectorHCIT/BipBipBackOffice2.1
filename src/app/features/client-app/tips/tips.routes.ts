import { Routes } from '@angular/router';

export const TIPS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/tips-page/tips-page.component')
      .then(m => m.TipsPageComponent),
    title: 'Gestión de Propinas'
  }
];
