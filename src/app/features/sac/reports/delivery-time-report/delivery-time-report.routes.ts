import { Routes } from '@angular/router';

export const DELIVERY_TIME_REPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/delivery-time-report-page/delivery-time-report-page.component').then(
        (m) => m.DeliveryTimeReportPageComponent
      )
  }
];
