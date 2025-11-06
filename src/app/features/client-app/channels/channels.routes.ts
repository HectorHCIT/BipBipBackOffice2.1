import { Routes } from '@angular/router';

/**
 * CHANNELS_ROUTES
 *
 * Rutas del submódulo de Canales de Comunicación
 */
export const CHANNELS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/channels-page/channels-page.component').then(m => m.ChannelsPageComponent),
    title: 'Gestión de Canales'
  }
];
