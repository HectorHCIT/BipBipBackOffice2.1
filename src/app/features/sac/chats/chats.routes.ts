import { Routes } from '@angular/router';

export const CHATS_ROUTES: Routes = [
  {
    path: 'sac-cliente',
    loadChildren: () =>
      import('./sac-cliente/sac-cliente.routes').then((m) => m.SAC_CLIENTE_ROUTES),
    title: 'Chats SAC-Cliente'
  },
  {
    path: 'sac-driver',
    loadChildren: () =>
      import('./sac-driver/sac-driver.routes').then((m) => m.SAC_DRIVER_ROUTES),
    title: 'Chats SAC-Driver'
  },
  {
    path: 'agent-history',
    loadChildren: () =>
      import('./agent-history/agent-history.routes').then((m) => m.AGENT_HISTORY_ROUTES),
    title: 'Historial de Agentes'
  },
  {
    path: 'history',
    loadChildren: () =>
      import('./chat-history/chat-history.routes').then((m) => m.CHAT_HISTORY_ROUTES),
    title: 'Historial de Chats'
  },
  {
    path: 'SAC-config',
    loadChildren: () =>
      import('./settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
    title: 'Ajustes SAC'
  },
  // TODO FASE 10: Agregar rutas para cliente-driver
  // {
  //   path: 'cliente-driver',
  //   loadChildren: () =>
  //     import('./cliente-driver/cliente-driver.routes').then((m) => m.CLIENTE_DRIVER_ROUTES),
  //   title: 'Chats Cliente-Driver'
  // },
  {
    path: '',
    redirectTo: 'sac-cliente',
    pathMatch: 'full'
  }
];
