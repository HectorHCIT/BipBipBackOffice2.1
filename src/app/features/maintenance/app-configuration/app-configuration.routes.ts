import { Routes } from '@angular/router';
import { AppConfigPageComponent } from './pages/app-config-page/app-config-page.component';

/**
 * APP_CONFIG_ROUTES
 *
 * Rutas para el módulo de Configuración de App
 */
export const APP_CONFIG_ROUTES: Routes = [
  {
    path: '',
    component: AppConfigPageComponent,
    title: 'Configuración de App'
  }
];
