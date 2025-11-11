import { Routes } from '@angular/router';

export const OCCURRENCES_REPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/occurrences-report-page/occurrences-report-page.component').then(
        (m) => m.OccurrencesReportPageComponent
      )
  }
];
