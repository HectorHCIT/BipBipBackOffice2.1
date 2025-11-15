import { Routes } from '@angular/router';

export const PRODUCTS_IN_PROMOTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages').then((m) => m.ProductsListPageComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages').then((m) => m.ProductFormPageComponent),
  },
  {
    path: 'edit/:productId/:brandId',
    loadComponent: () =>
      import('./pages').then((m) => m.ProductFormPageComponent),
  },
];
