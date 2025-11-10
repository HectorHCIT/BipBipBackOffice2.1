import { Routes } from '@angular/router';

export const TARGET_AUDIENCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/target-audience-page/target-audience-page.component').then(
        (m) => m.TargetAudiencePageComponent
      )
  }
];
