import { Routes } from '@angular/router';

/**
 * EMISSION_POINTS_ROUTES - Rutas del módulo de Puntos de Emisión
 *
 * Ruta base: /accounting/emission-points
 */
export const EMISSION_POINTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/emission-points/emission-points.component').then(
        (m) => m.EmissionPointsComponent
      ),
    title: 'Puntos de Emisión'
  }
];
