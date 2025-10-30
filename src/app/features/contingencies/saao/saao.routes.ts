import { Routes } from '@angular/router';

export const SAAO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/saao/saao.component').then(m => m.SaaoComponent),
    title: 'SAAO - Sistema de Análisis de Órdenes'
  }
];
