import { Routes } from '@angular/router';

/**
 * COMPANIES_ROUTES - Rutas del módulo de Empresas
 */
export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/companies/companies.component').then(
        (m) => m.CompaniesComponent
      )
  }
];
