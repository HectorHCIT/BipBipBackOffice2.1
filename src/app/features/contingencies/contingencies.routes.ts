import { Routes } from '@angular/router';

/**
 * CONTINGENCIES_ROUTES - Rutas consolidadas del módulo de Contingencias
 *
 * Este archivo agrupa todas las rutas de los submódulos de Contingencias:
 * - Signal Monitoring (Monitoreo de Señal) ✅
 * - SAAO (Sistema de Análisis y Asignación de Órdenes) ✅
 *
 * Estructura:
 * /contingencies/signal-monitoring -> SignalMonitoringComponent
 * /contingencies/saao -> SaaoComponent
 */
export const CONTINGENCIES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'signal-monitoring',
    pathMatch: 'full',
  },
  {
    path: 'signal-monitoring',
    loadChildren: () =>
      import('./signal-monitoring/signal-monitoring.routes').then(
        (m) => m.SIGNAL_MONITORING_ROUTES
      ),
    title: 'Monitoreo de Señal',
  },
  {
    path: 'saao',
    loadChildren: () => import('./saao/saao.routes').then(m => m.SAAO_ROUTES),
    title: 'SAAO - Sistema de Análisis de Órdenes'
  }
];
