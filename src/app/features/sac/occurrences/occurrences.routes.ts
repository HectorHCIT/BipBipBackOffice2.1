import { Routes } from '@angular/router';

export const OCCURRENCES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/occurrences-page/occurrences-page.component').then(
        (m) => m.OccurrencesPageComponent
      ),
    title: 'Gestión de Ocurrencias'
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/occurrences-report-page/occurrences-report-page.component').then(
        (m) => m.OccurrencesReportPageComponent
      ),
    title: 'Reporte de Ocurrencias'
  }
];
