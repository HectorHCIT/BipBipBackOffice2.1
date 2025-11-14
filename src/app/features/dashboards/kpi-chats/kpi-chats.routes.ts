import type { Routes } from '@angular/router';

export const KPI_CHATS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/kpi-chats-page/kpi-chats-page.component').then(m => m.KpiChatsPageComponent)
  }
];
