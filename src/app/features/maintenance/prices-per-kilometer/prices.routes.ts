import { Routes } from '@angular/router';

/**
 * PRICES_ROUTES - Rutas del módulo de Precios por Kilómetro
 *
 * Gestión de escalas de precios para delivery's por kilómetro
 */
export const PRICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/prices/prices.component').then(m => m.PricesComponent),
    title: 'Precios por Kilómetro'
  }
];
