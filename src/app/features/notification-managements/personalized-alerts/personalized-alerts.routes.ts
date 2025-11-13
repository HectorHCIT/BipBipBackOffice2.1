import { Routes } from '@angular/router';

export const PERSONALIZED_ALERTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/alerts-list-page/alerts-list-page.component').then(
        (m) => m.AlertsListPageComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/alert-detail-page/alert-detail-page.component').then(
        (m) => m.AlertDetailPageComponent
      ),
  },
  {
    path: 'edit/:code',
    loadComponent: () =>
      import('./pages/alert-detail-page/alert-detail-page.component').then(
        (m) => m.AlertDetailPageComponent
      ),
  },
];
