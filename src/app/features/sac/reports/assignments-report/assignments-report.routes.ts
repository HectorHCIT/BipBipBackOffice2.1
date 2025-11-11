import { Routes } from '@angular/router';

export const ASSIGNMENTS_REPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/assignments-report-page/assignments-report-page.component').then(
        (m) => m.AssignmentsReportPageComponent
      )
  }
];
