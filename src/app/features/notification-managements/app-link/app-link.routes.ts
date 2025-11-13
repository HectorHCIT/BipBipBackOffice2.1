import { Routes } from '@angular/router';

export const APP_LINK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/app-links-list-page/app-links-list-page.component').then(
        (m) => m.AppLinksListPageComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/app-link-detail-page/app-link-detail-page.component').then(
        (m) => m.AppLinkDetailPageComponent
      ),
  },
  {
    path: 'edit/:campaignName',
    loadComponent: () =>
      import('./pages/app-link-detail-page/app-link-detail-page.component').then(
        (m) => m.AppLinkDetailPageComponent
      ),
  },
];
