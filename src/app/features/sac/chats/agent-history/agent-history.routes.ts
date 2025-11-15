import { Routes } from '@angular/router';

export const AGENT_HISTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/agent-history-page')
      .then(m => m.AgentHistoryPageComponent),
    title: 'Historial de Agentes'
  }
];
