import { Routes } from '@angular/router';

export const CANCELLATION_REQUESTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cancellation-requests-page/cancellation-requests-page.component').then(
        (m) => m.CancellationRequestsPageComponent
      )
  }
];
