import { Routes } from '@angular/router';

/**
 * MAINTENANCE_ROUTES - Rutas consolidadas del módulo de Mantenimiento
 *
 * Este archivo agrupa todas las rutas de los submódulos de Mantenimiento:
 * - Brands (Marcas) ✅
 * - Currencies and Countries (Monedas y Países) ✅
 * - App Configs (Configuraciones de App) - TODO
 * - Automatic Assignment (Asignación Automática) - TODO
 * - Credentials and Permissions (Credenciales y Permisos) - TODO
 * - Prices per Kilometer (Precios por Kilómetro) - TODO
 * - Differentiated Payment (Pagos Diferenciados) - TODO
 *
 * Estructura:
 * /maintenance/brands -> BrandsComponent
 * /maintenance/currencies -> CurrenciesComponent
 * /maintenance/app-configuration -> AppConfigsComponent (futuro)
 * ...etc
 */
export const MAINTENANCE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'brands',
    pathMatch: 'full'
  },
  {
    path: 'brands',
    loadChildren: () => import('./brands/brands.routes').then(m => m.BRANDS_ROUTES),
    title: 'Gestión de Marcas'
  },
  {
    path: 'currencies',
    loadChildren: () => import('./currencies/currencies.routes').then(m => m.CURRENCIES_ROUTES),
    title: 'Gestión de Monedas y Países'
  }
  // TODO: Agregar más submódulos de mantenimiento aquí
  /*
  {
    path: 'app-configuration',
    loadChildren: () => import('./app-configs/app-configs.routes').then(m => m.APP_CONFIGS_ROUTES),
    title: 'Configuración de App'
  },
  {
    path: 'automatic-assignment',
    loadChildren: () => import('./automatic-assignment/automatic-assignment.routes').then(m => m.AUTOMATIC_ASSIGNMENT_ROUTES),
    title: 'Asignación Automática'
  },
  {
    path: 'credentials-and-permissions',
    loadChildren: () => import('./credentials-and-permissions/credentials.routes').then(m => m.CREDENTIALS_ROUTES),
    title: 'Credenciales y Permisos'
  },
  {
    path: 'prices-per-kilometer-delivery',
    loadChildren: () => import('./prices-per-kilometer/prices.routes').then(m => m.PRICES_ROUTES),
    title: 'Precios por Kilómetro'
  },
  {
    path: 'differentiated-payment',
    loadChildren: () => import('./differentiated-payment/payment.routes').then(m => m.PAYMENT_ROUTES),
    title: 'Pagos Diferenciados'
  }
  */
];
