import { Routes } from '@angular/router';

/**
 * Reports Routes
 *
 * Rutas standalone para el módulo de reportes de deliveries.
 * Usa lazy loading para optimizar el bundle size.
 *
 * Estado de migración:
 * ✅ Contenedor principal (DeliveriesReportsComponent)
 * ⏳ Reportes individuales (en desarrollo)
 *
 * Estructura:
 * /reports → Redirect a /reports/deliveries
 * /reports/deliveries → Contenedor con los 10 reportes
 */
export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'deliveries',
    pathMatch: 'full'
  },
  {
    path: 'deliveries',
    loadComponent: () =>
      import('./components/deliveries-reports/deliveries-reports.component').then(
        (m) => m.DeliveriesReportsComponent
      ),
    data: {
      title: 'Reportes de Deliveries',
      breadcrumb: 'Deliveries'
    }
  }
];
