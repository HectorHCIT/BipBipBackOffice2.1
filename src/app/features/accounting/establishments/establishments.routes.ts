import { Routes } from '@angular/router';

/**
 * ESTABLISHMENTS_ROUTES - Rutas del módulo de Establecimientos
 */
export const ESTABLISHMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/establishments/establishments.component').then(
        (m) => m.EstablishmentsComponent
      )
  }
];
