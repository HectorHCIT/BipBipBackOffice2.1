import type { Routes } from '@angular/router';

/**
 * Dashboards Routes
 *
 * Rutas principales de los dashboards con lazy loading para cada sección
 */
export const DASHBOARDS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'kpi-chats',
    pathMatch: 'full'
  },
  {
    path: 'kpi-chats',
    loadChildren: () => import('./kpi-chats/kpi-chats.routes').then(m => m.KPI_CHATS_ROUTES),
    data: { title: 'KPI Chats' }
  },
  {
    path: 'kpi-bipbip',
    loadChildren: () => import('./kpi-bipbip/kpi-bipbip.routes').then(m => m.KPI_BIPBIP_ROUTES),
    data: { title: 'KPI BipBip' }
  },
  {
    path: 'customers',
    loadChildren: () => import('./customers/customers.routes').then(m => m.CUSTOMERS_ROUTES),
    data: { title: 'Clientes' }
  },
  {
    path: 'deliveries',
    loadChildren: () => import('./drivers/drivers.routes').then(m => m.DRIVERS_ROUTES),
    data: { title: 'Deliveries' }
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.routes').then(m => m.ORDERS_ROUTES),
    data: { title: 'Órdenes' }
  },
  {
    path: 'cancelations',
    loadChildren: () => import('./cancelaciones/cancelaciones.routes').then(m => m.CANCELACIONES_ROUTES),
    data: { title: 'Cancelaciones' }
  },
  {
    path: 'promotions',
    loadChildren: () => import('./promotions/promotions.routes').then(m => m.PROMOTIONS_ROUTES),
    data: { title: 'Promociones' }
  },
  {
    path: 'loyalty',
    loadChildren: () => import('./loyalty/loyalty.routes').then(m => m.LOYALTY_ROUTES),
    data: { title: 'Lealtad' }
  },
  {
    path: 'zones-map',
    loadChildren: () => import('./zones-map/zones-map.routes').then(m => m.ZONES_MAP_ROUTES),
    data: { title: 'Mapa de Zonas' }
  }
];
