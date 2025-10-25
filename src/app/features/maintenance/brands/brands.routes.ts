import { Routes } from '@angular/router';

export const BRANDS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/brands/brands.component').then(m => m.BrandsComponent),
    title: 'Gestión de Marcas'
  }
];
