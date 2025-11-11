import { Routes } from '@angular/router';

/**
 * LOYALTY_PROGRAM_ROUTES
 *
 * Routes for the Loyalty Program module
 */
export const LOYALTY_PROGRAM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/loyalty-levels-page/loyalty-levels-page.component').then(
        (m) => m.LoyaltyLevelsPageComponent
      ),
  },
  {
    path: 'detail/:maxPoints',
    loadComponent: () =>
      import('./pages/level-detail-page/level-detail-page.component').then(
        (m) => m.LevelDetailPageComponent
      ),
  },
  {
    path: 'detail/:minPoints/:maxPoints/:id',
    loadComponent: () =>
      import('./pages/level-detail-page/level-detail-page.component').then(
        (m) => m.LevelDetailPageComponent
      ),
  },
];
