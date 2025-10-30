import { Routes } from '@angular/router';

export const SIGNAL_MONITORING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/signal-monitoring/signal-monitoring.component').then(
        (m) => m.SignalMonitoringComponent
      ),
    title: 'Monitoreo de Señal',
  },
];
