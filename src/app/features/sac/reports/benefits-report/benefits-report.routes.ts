import { Routes } from '@angular/router';

export const BENEFITS_REPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/benefits-report-page/benefits-report-page.component').then(
        (m) => m.BenefitsReportPageComponent
      )
  }
];
